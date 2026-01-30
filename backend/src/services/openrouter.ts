import axios from 'axios';
import logger from '../utilities/logger';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Three models for comparison - you can customize these
const MODELS = {
  creative: 'mistralai/mistral-small-3.1-24b-instruct:free', // Good for creative responses
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

/**
 * Query a single AI model via OpenRouter
 */
async function querySingleModel(
  modelId: string,
  modelLabel: string,
  userMessage: string,
  language?: string
): Promise<ModelResponse> {
  const startTime = Date.now();
  
  try {
    if (!OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY not configured');
    }

    let systemPrompt = 'You are a helpful assistant.';
    let languageInstruction = '';

    if (language === 'zhHK') {
      systemPrompt = '你是一個有用的助手。目前語言設定是：繁體中文（Traditional Chinese）。請務必使用繁體中文回答所有問題。';
      languageInstruction = '[請使用繁體中文回答] ';
    } else if (language === 'zhCN') {
      systemPrompt = '你是一个有用的助手。目前语言设定是：简体中文（Simplified Chinese）。请务必使用简体中文回答所有问题。';
      languageInstruction = '[请使用简体中文回答] ';
    } else if (language === 'en') {
      systemPrompt = 'You are a helpful assistant. Current language: English. Please always respond in English.';
      languageInstruction = '[Respond in English] ';
    }

    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: modelId,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `${languageInstruction}${userMessage}`
          }
        ]
      },
      {
        headers: {
// ... rest of headers
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
 * Query multiple AI models in parallel
 */
export async function queryMultipleModels(userMessage: string, language?: string): Promise<ModelResponse[]> {
  logger.info(`Querying multiple AI models in parallel with language: ${language}`);

  const modelConfigs = [
    { id: MODELS.creative, label: 'Mistral: Mistral Small 3.1 24B' },
    { id: MODELS.accurate, label: 'Arcee AI: Trinity Large Preview' },
    { id: MODELS.fast, label: 'DeepSeek: R1 0528' }
  ];

  const promises = modelConfigs.map(config => 
    querySingleModel(config.id, config.label, userMessage, language)
  );

  // Use Promise.allSettled to ensure all promises complete even if some fail
  const results = await Promise.allSettled(promises);

  return results.map((result, index) => {
    const config = modelConfigs[index];
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      // Handle rejected promise
      return {
        modelName: config.id,
        modelLabel: config.label,
        response: '',
        error: result.reason?.message || 'Request failed'
      };
    }
  });
}
