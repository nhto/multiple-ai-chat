import axios from 'axios';
import * as readline from 'readline';
import logger from '../utilities/logger';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

/** Available models for user selection */
export const AVAILABLE_MODELS = [
  { id: 'x-ai/grok-4.1-fast', label: 'xAI: Grok 4.1 Fast' },
  { id: 'moonshotai/kimi-k2.5', label: 'MoonshotAI: Kimi K2.5' },
  { id: 'qwen/qwen3-vl-8b-instruct', label: 'Qwen: Qwen3 VL 8B Instruct' }
] as const;

const ALLOWED_IDS: Set<string> = new Set(AVAILABLE_MODELS.map(m => m.id));

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | Array<{ type: 'text' | 'image_url'; text?: string; image_url?: { url: string } }>;
}

export interface ModelResponse {
  modelName: string;
  modelLabel: string;
  response: string;
  error?: string;
  responseTime?: number;
}

/** One turn in conversation history: user message + each model's response */
export interface HistoryTurn {
  userMessage: string;
  images?: string[];
  responses: Array<{ modelName: string; response: string }>;
}

function getSystemPrompt(language?: string): string {
  if (language === 'zhHK') {
    return '你是一個有用的助手。目前語言設定是：繁體中文（Traditional Chinese）。請務必使用繁體中文回答所有問題。';
  }
  if (language === 'zhCN') {
    return '你是一个有用的助手。目前语言设定是：简体中文（Simplified Chinese）。请务必使用简体中文回答所有问题。';
  }
  if (language === 'en') {
    return 'You are a helpful assistant. Current language: English. Please always respond in English.';
  }
  return 'You are a helpful assistant.';
}

/**
 * Build the messages array for one model from conversation history + current user message
 */
function buildMessagesForModel(
  history: HistoryTurn[],
  currentMessage: string,
  language: string,
  modelId: string,
  currentImages?: string[]
): ChatMessage[] {
  const systemPrompt = getSystemPrompt(language);
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt }
  ];

  for (const turn of history) {
    // Build user message content (text + optional images)
    if (turn.images && turn.images.length > 0) {
      const contentParts: Array<{ type: 'text' | 'image_url'; text?: string; image_url?: { url: string } }> = [];
      const turnText = turn.userMessage?.trim() || 'What do you see in this image?';
      contentParts.push({ type: 'text', text: turnText });
      for (const imgUrl of turn.images) {
        contentParts.push({ type: 'image_url', image_url: { url: imgUrl } });
      }
      messages.push({ role: 'user', content: contentParts });
    } else {
      messages.push({ role: 'user', content: turn.userMessage });
    }
    
    const modelResponse = turn.responses.find(r => r.modelName === modelId);
    const assistantContent = modelResponse?.response?.trim()
      ? modelResponse.response
      : '(No response for this turn.)';
    messages.push({ role: 'assistant', content: assistantContent });
  }

  // Add current message with optional images
  if (currentImages && currentImages.length > 0) {
    const contentParts: Array<{ type: 'text' | 'image_url'; text?: string; image_url?: { url: string } }> = [];
    // Vision APIs typically require at least one text part; use fallback if user sent only images
    const textContent = currentMessage?.trim() || 'What do you see in this image? Please describe or answer based on the image(s).';
    contentParts.push({ type: 'text', text: textContent });
    for (const imgUrl of currentImages) {
      contentParts.push({ type: 'image_url', image_url: { url: imgUrl } });
    }
    messages.push({ role: 'user', content: contentParts });
  } else {
    messages.push({ role: 'user', content: currentMessage });
  }
  
  return messages;
}

/**
 * Query a single AI model via OpenRouter with a full messages array
 */
async function querySingleModel(
  modelId: string,
  modelLabel: string,
  messages: ChatMessage[]
): Promise<ModelResponse> {
  const startTime = Date.now();

  try {
    if (!OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY not configured');
    }

    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: modelId,
        messages
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
          'X-Title': 'Multi-AI Chat'
        },
        timeout: 90000
      }
    );

    const responseTime = Date.now() - startTime;
    const aiResponse = response.data.choices?.[0]?.message?.content || 'No response';

    logger.info(`Model ${modelLabel} responded in ${responseTime}ms`);

    return {
      modelName: modelId,
      modelLabel,
      response: aiResponse,
      responseTime
    };
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    logger.error(`Error querying model ${modelLabel}:`, error.message);

    return {
      modelName: modelId,
      modelLabel,
      response: '',
      error: error.response?.data?.error?.message || error.message || 'Unknown error',
      responseTime
    };
  }
}

type ModelConfig = { id: string; label: string };

/** Resolve model configs from user-selected modelIds (2 or 3 models) */
function getModelConfigs(modelIds?: string[]): ModelConfig[] {
  if (!modelIds || !Array.isArray(modelIds) || modelIds.length < 2 || modelIds.length > 3) {
    return AVAILABLE_MODELS.map(m => ({ id: m.id, label: m.label }));
  }
  const configs: ModelConfig[] = [];
  for (const id of modelIds) {
    if (!ALLOWED_IDS.has(id)) continue;
    const m = AVAILABLE_MODELS.find(av => av.id === id);
    if (m && configs.length < 3) configs.push({ id: m.id, label: m.label });
  }
  return configs.length >= 2 ? configs : AVAILABLE_MODELS.map(m => ({ id: m.id, label: m.label }));
}

/**
 * Query multiple AI models in parallel, optionally with conversation history
 */
export async function queryMultipleModels(
  userMessage: string,
  language?: string,
  history?: HistoryTurn[],
  modelIds?: string[],
  images?: string[]
): Promise<ModelResponse[]> {
  const modelConfigs = getModelConfigs(modelIds);
  logger.info(
    `Querying ${modelConfigs.length} AI models with language: ${language}, history turns: ${history?.length ?? 0}, images: ${images?.length ?? 0}, models: ${modelConfigs.map(c => c.id).join(', ')}`
  );

  const promises = modelConfigs.map(config => {
    const messages = history && history.length > 0
      ? buildMessagesForModel(history, userMessage, language || 'en', config.id, images)
      : (() => {
          const msgs: ChatMessage[] = [{ role: 'system', content: getSystemPrompt(language) }];
          if (images && images.length > 0) {
            const contentParts: Array<{ type: 'text' | 'image_url'; text?: string; image_url?: { url: string } }> = [];
            if (userMessage) {
              contentParts.push({ type: 'text', text: userMessage });
            }
            for (const imgUrl of images) {
              contentParts.push({ type: 'image_url', image_url: { url: imgUrl } });
            }
            msgs.push({ role: 'user', content: contentParts });
          } else {
            msgs.push({ role: 'user', content: userMessage });
          }
          return msgs;
        })();
    return querySingleModel(config.id, config.label, messages);
  });

  // Use Promise.allSettled to ensure all promises complete even if some fail
  const results = await Promise.allSettled(promises);

  return results.map((result, index) => {
    const config = modelConfigs[index];
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return {
        modelName: config.id,
        modelLabel: config.label,
        response: '',
        error: result.reason?.message || 'Request failed'
      };
    }
  });
}

/** Payload sent to client for each streamed chunk or completion */
export interface StreamChunkPayload {
  modelId: string;
  modelLabel: string;
  chunk?: string;
  done?: boolean;
  error?: string;
  responseTime?: number;
}

/**
 * Query a single model by id (for retry). Returns null if modelId is not in allowed list.
 */
export async function querySingleModelForRetry(
  userMessage: string,
  language: string | undefined,
  history: HistoryTurn[] | undefined,
  modelId: string
): Promise<ModelResponse | null> {
  const config = AVAILABLE_MODELS.find(c => c.id === modelId);
  if (!config) {
    logger.warn(`Retry requested for unknown modelId: ${modelId}`);
    return null;
  }
  const messages = history && history.length > 0
    ? buildMessagesForModel(history, userMessage, language || 'en', config.id)
    : [
        { role: 'system', content: getSystemPrompt(language) } as ChatMessage,
        { role: 'user', content: userMessage } as ChatMessage
      ];
  return querySingleModel(config.id, config.label, messages);
}

/**
 * Stream a single model's response from OpenRouter and invoke writeChunk for each chunk
 */
async function streamSingleModel(
  modelId: string,
  modelLabel: string,
  messages: ChatMessage[],
  writeChunk: (payload: StreamChunkPayload) => Promise<void>
): Promise<void> {
  const startTime = Date.now();
  try {
    if (!OPENROUTER_API_KEY) {
      await writeChunk({ modelId, modelLabel, error: 'OPENROUTER_API_KEY not configured' });
      return;
    }

    const response = await axios.post(
      OPENROUTER_API_URL,
      { model: modelId, messages, stream: true },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
          'X-Title': 'Multi-AI Chat'
        },
        responseType: 'stream',
        timeout: 90000
      }
    );

    const rl = readline.createInterface({ input: response.data as NodeJS.ReadableStream });
    for await (const line of rl) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data: ')) continue;
      const data = trimmed.slice(6);
      if (data === '[DONE]') break;
      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content;
        if (typeof content === 'string' && content) {
          await writeChunk({ modelId, modelLabel, chunk: content });
        }
        if (parsed.choices?.[0]?.finish_reason === 'error' && parsed.error?.message) {
          await writeChunk({ modelId, modelLabel, error: parsed.error.message });
        }
      } catch {
        // ignore parse errors (e.g. comment lines)
      }
    }

    const responseTime = Date.now() - startTime;
    await writeChunk({ modelId, modelLabel, done: true, responseTime });
    logger.info(`Model ${modelLabel} stream completed in ${responseTime}ms`);
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    logger.error(`Error streaming model ${modelLabel}:`, error.message);
    await writeChunk({
      modelId,
      modelLabel,
      error: error.response?.data?.error?.message || error.message || 'Unknown error',
      done: true,
      responseTime
    });
  }
}

/**
 * Stream multiple AI models in parallel; invoke writeChunk for each chunk from any model
 */
export async function streamMultipleModels(
  userMessage: string,
  language: string | undefined,
  history: HistoryTurn[] | undefined,
  writeChunk: (payload: StreamChunkPayload) => Promise<void>,
  modelIds?: string[],
  images?: string[]
): Promise<void> {
  const modelConfigs = getModelConfigs(modelIds);
  logger.info(
    `Streaming ${modelConfigs.length} AI models with language: ${language}, history turns: ${history?.length ?? 0}, images: ${images?.length ?? 0}, models: ${modelConfigs.map(c => c.id).join(', ')}`
  );

  const tasks = modelConfigs.map(config => {
    const messages = history && history.length > 0
      ? buildMessagesForModel(history, userMessage, language || 'en', config.id, images)
      : (() => {
          const msgs: ChatMessage[] = [{ role: 'system', content: getSystemPrompt(language) }];
          if (images && images.length > 0) {
            const contentParts: Array<{ type: 'text' | 'image_url'; text?: string; image_url?: { url: string } }> = [];
            if (userMessage) {
              contentParts.push({ type: 'text', text: userMessage });
            }
            for (const imgUrl of images) {
              contentParts.push({ type: 'image_url', image_url: { url: imgUrl } });
            }
            msgs.push({ role: 'user', content: contentParts });
          } else {
            msgs.push({ role: 'user', content: userMessage });
          }
          return msgs;
        })();
    return streamSingleModel(config.id, config.label, messages, writeChunk);
  });

  await Promise.all(tasks);
}
