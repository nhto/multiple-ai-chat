import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

/**
 * Build conversation history for multi-turn chat.
 * Each turn: { userMessage, responses: [{ modelName, response }] }
 * @param {Array<{ type: string, content?: string, responses?: Array<{ modelName: string, response?: string, error?: string }> }>} messages - Current chat messages (user + ai pairs)
 * @returns {Array<{ userMessage: string, responses: Array<{ modelName: string, response: string }> }>}
 */
export const buildChatHistory = (messages) => {
  const history = [];
  for (let i = 0; i < messages.length - 1; i += 2) {
    const userMsg = messages[i];
    const aiMsg = messages[i + 1];
    if (userMsg?.type !== 'user' || aiMsg?.type !== 'ai' || !userMsg?.content) continue;
    const responses = (aiMsg.responses || []).map((r) => ({
      modelName: r.modelName,
      response: r.error ? '' : (r.response || '')
    }));
    history.push({ userMessage: userMsg.content, responses });
  }
  return history;
};

/**
 * Send a message to multiple AI models, optionally with conversation history for multi-turn chat
 * @param {string} message - The user's message
 * @param {string} language - The selected language (e.g., 'en', 'zhHK', 'zhCN')
 * @param {Array<{ userMessage: string, responses: Array<{ modelName: string, response: string }> }>} [history] - Previous turns for context
 * @returns {Promise} - Promise resolving to the API response
 */
export const sendChatMessage = async (message, language, history = []) => {
  try {
    const body = { message, language };
    if (history && history.length > 0) {
      body.history = history;
    }
    const response = await axios.post(`${API_BASE_URL}/api/chat`, body);
    return response.data;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};

/**
 * Stream a message to multiple AI models; onChunk is called for each SSE payload.
 * Payload: { modelId, modelLabel, chunk?, done?, error?, responseTime? }
 * @param {string} message - The user's message
 * @param {string} language - The selected language
 * @param {Array<{ userMessage: string, responses: Array<{ modelName: string, response: string }> }>} [history] - Previous turns
 * @param {(payload: { modelId: string, modelLabel: string, chunk?: string, done?: boolean, error?: string, responseTime?: number }) => void} onChunk - Callback for each chunk
 * @param {{ signal?: AbortSignal }} [options] - Optional abort signal
 * @returns {Promise<void>}
 */
export const sendChatMessageStream = async (message, language, history = [], onChunk, options = {}) => {
  const body = { message, language };
  if (history && history.length > 0) {
    body.history = history;
  }
  const response = await fetch(`${API_BASE_URL}/api/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: options.signal
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(err.error || response.statusText);
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          const json = trimmed.slice(6);
          if (json === '[DONE]') continue;
          try {
            const payload = JSON.parse(json);
            onChunk(payload);
          } catch {
            // ignore non-JSON (e.g. error message)
          }
        }
      }
    }
    if (buffer.trim().startsWith('data: ')) {
      try {
        const payload = JSON.parse(buffer.trim().slice(6));
        onChunk(payload);
      } catch {
        // ignore
      }
    }
  } finally {
    reader.releaseLock();
  }
};

/**
 * Retry a single failed model for the same user message and context
 * @param {string} message - The user message that triggered this AI block
 * @param {string} language - The selected language
 * @param {Array<{ userMessage: string, responses: Array<{ modelName: string, response: string }> }>} [history] - Previous turns (before this message)
 * @param {string} modelId - The model to retry (e.g. from response.modelName)
 * @returns {Promise<{ response: { modelName, modelLabel, response, error?, responseTime? } }>}
 */
export const retryFailedModel = async (message, language, history = [], modelId) => {
  const body = { message, language, modelId };
  if (history && history.length > 0) {
    body.history = history;
  }
  const response = await axios.post(`${API_BASE_URL}/api/chat/retry`, body);
  return response.data;
};
