import axios from 'axios';
import * as readline from 'readline';
import logger from '../utilities/logger';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Three models for comparison - you can customize these
const MODELS = {
  creative: 'z-ai/glm-4.5-air:free', // Good for creative responses
  accurate: 'arcee-ai/trinity-large-preview:free', // Good for accuracy
  fast: 'deepseek/deepseek-r1-0528:free' // Good for quick responses
};

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
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
  modelId: string
): ChatMessage[] {
  const systemPrompt = getSystemPrompt(language);
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt }
  ];

  for (const turn of history) {
    messages.push({ role: 'user', content: turn.userMessage });
    const modelResponse = turn.responses.find(r => r.modelName === modelId);
    const assistantContent = modelResponse?.response?.trim()
      ? modelResponse.response
      : '(No response for this turn.)';
    messages.push({ role: 'assistant', content: assistantContent });
  }

  messages.push({ role: 'user', content: currentMessage });
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

/**
 * Query multiple AI models in parallel, optionally with conversation history
 */
export async function queryMultipleModels(
  userMessage: string,
  language?: string,
  history?: HistoryTurn[]
): Promise<ModelResponse[]> {
  logger.info(
    `Querying multiple AI models with language: ${language}, history turns: ${history?.length ?? 0}`
  );

  const modelConfigs = [
    { id: MODELS.creative, label: 'Z.AI: GLM 4.5 Air' },
    { id: MODELS.accurate, label: 'Arcee AI: Trinity Large Preview' },
    { id: MODELS.fast, label: 'DeepSeek: R1 0528' }
  ];

  const promises = modelConfigs.map(config => {
    const messages = history && history.length > 0
      ? buildMessagesForModel(history, userMessage, language || 'en', config.id)
      : [
          { role: 'system', content: getSystemPrompt(language) } as ChatMessage,
          { role: 'user', content: userMessage } as ChatMessage
        ];
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

const MODEL_CONFIGS = [
  { id: MODELS.creative, label: 'Z.AI: GLM 4.5 Air' },
  { id: MODELS.accurate, label: 'Arcee AI: Trinity Large Preview' },
  { id: MODELS.fast, label: 'DeepSeek: R1 0528' }
];

/**
 * Query a single model by id (for retry). Returns null if modelId is not in MODEL_CONFIGS.
 */
export async function querySingleModelForRetry(
  userMessage: string,
  language: string | undefined,
  history: HistoryTurn[] | undefined,
  modelId: string
): Promise<ModelResponse | null> {
  const config = MODEL_CONFIGS.find(c => c.id === modelId);
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
  writeChunk: (payload: StreamChunkPayload) => Promise<void>
): Promise<void> {
  logger.info(
    `Streaming multiple AI models with language: ${language}, history turns: ${history?.length ?? 0}`
  );

  const tasks = MODEL_CONFIGS.map(config => {
    const messages = history && history.length > 0
      ? buildMessagesForModel(history, userMessage, language || 'en', config.id)
      : [
          { role: 'system', content: getSystemPrompt(language) } as ChatMessage,
          { role: 'user', content: userMessage } as ChatMessage
        ];
    return streamSingleModel(config.id, config.label, messages, writeChunk);
  });

  await Promise.all(tasks);
}
