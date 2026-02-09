import { Request, Response, Router } from 'express';
import { queryMultipleModels, streamMultipleModels, StreamChunkPayload, querySingleModelForRetry } from '../../../../services/openrouter';
import logger from '../../../../utilities/logger';

const router = Router();

/** Per-model character limits based on context window size.
 *  Roughly: limit ≈ 1/8 of context window in tokens × 4 chars/token,
 *  leaving headroom for system prompt, history, and output.
 */
const MODEL_CHAR_LIMITS: Record<string, number> = {
  'x-ai/grok-4.1-fast':          64_000,   // 131K context
  'moonshotai/kimi-k2.5':        64_000,   // 131K context
  'qwen/qwen3-vl-8b-instruct':   16_000,   // 32K  context
};

const DEFAULT_CHAR_LIMIT = 16_000; // safe fallback (smallest model)

/** Return the effective message-length limit for a set of selected models.
 *  Uses the minimum across all chosen models so every model can handle the input.
 */
function getCharLimit(modelIds?: string[]): number {
  if (!modelIds || modelIds.length === 0) return DEFAULT_CHAR_LIMIT;
  return Math.min(...modelIds.map(id => MODEL_CHAR_LIMITS[id] ?? DEFAULT_CHAR_LIMIT));
}

/**
 * POST /api/chat
 * Send a message to multiple AI models and get responses
 */
/** Validate and normalize conversation history from request body */
function parseHistory(bodyHistory: unknown, charLimit: number = DEFAULT_CHAR_LIMIT): Array<{ userMessage: string; images?: string[]; responses: Array<{ modelName: string; response: string }> }> | undefined {
  if (bodyHistory == null || !Array.isArray(bodyHistory)) {
    return undefined;
  }
  const history: Array<{ userMessage: string; images?: string[]; responses: Array<{ modelName: string; response: string }> }> = [];
  const maxTurns = 50;
  for (let i = 0; i < Math.min(bodyHistory.length, maxTurns); i++) {
    const turn = bodyHistory[i];
    if (!turn || typeof turn !== 'object' || typeof turn.userMessage !== 'string' || turn.userMessage.trim() === '') {
      continue;
    }
    const userMessage = turn.userMessage.trim();
    if (userMessage.length > charLimit) continue;
    let responses: Array<{ modelName: string; response: string }> = [];
    if (Array.isArray(turn.responses)) {
      for (const r of turn.responses) {
        if (r && typeof r.modelName === 'string' && typeof r.response === 'string') {
          responses.push({ modelName: r.modelName, response: r.response });
        }
      }
    }
    const historyTurn: { userMessage: string; images?: string[]; responses: Array<{ modelName: string; response: string }> } = { userMessage, responses };
    if (Array.isArray(turn.images) && turn.images.length > 0) {
      historyTurn.images = turn.images.filter((img: any) => typeof img === 'string').slice(0, 5);
    }
    history.push(historyTurn);
  }
  return history.length > 0 ? history : undefined;
}

/** Parse and validate modelIds from request (array of 2 or 3 allowed model ids) */
function parseModelIds(bodyModelIds: unknown): string[] | undefined {
  if (!Array.isArray(bodyModelIds) || bodyModelIds.length < 2 || bodyModelIds.length > 3) {
    return undefined;
  }
  const allowed = new Set(['x-ai/grok-4.1-fast', 'moonshotai/kimi-k2.5', 'qwen/qwen3-vl-8b-instruct']);
  const valid = bodyModelIds.filter((id): id is string => typeof id === 'string' && allowed.has(id));
  return valid.length >= 2 ? valid.slice(0, 3) : undefined;
}

/** Parse and validate images from request (array of base64 data URLs) */
function parseImages(bodyImages: unknown): string[] | undefined {
  if (!Array.isArray(bodyImages) || bodyImages.length === 0) {
    return undefined;
  }
  const maxImages = 5;
  const validImages = bodyImages
    .filter((img): img is string => typeof img === 'string' && img.startsWith('data:image/'))
    .slice(0, maxImages);
  return validImages.length > 0 ? validImages : undefined;
}

router.post('/', async (req: Request, res: Response) => {
  try {
    const { message, language, history: bodyHistory, modelIds: bodyModelIds, images: bodyImages } = req.body;

    // Validate input - allow empty message if images are provided
    const hasMessage = message && typeof message === 'string' && message.trim().length > 0;
    const images = parseImages(bodyImages);
    
    if (!hasMessage && !images) {
      return res.status(400).json({
        error: 'Message or images are required'
      });
    }

    const modelIds = parseModelIds(bodyModelIds);
    const charLimit = getCharLimit(modelIds);

    // Limit message length to prevent abuse (model-aware)
    if (hasMessage && message.length > charLimit) {
      return res.status(400).json({
        error: `Message is too long. Maximum length is ${charLimit.toLocaleString()} characters for the selected models.`
      });
    }

    const history = parseHistory(bodyHistory, charLimit);
    logger.info(
      `Received chat request with message length: ${message?.length ?? 0}, language: ${language}, history turns: ${history?.length ?? 0}, images: ${images?.length ?? 0}, modelIds: ${modelIds?.join(',') ?? 'default'}`
    );

    const responses = await queryMultipleModels(message?.trim() || '', language, history, modelIds, images);

    // Return responses
    return res.json({
      success: true,
      userMessage: message?.trim() || '',
      responses,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    logger.error('Error in chat endpoint:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * POST /api/chat/stream
 * Stream responses from multiple AI models (SSE)
 */
router.post('/stream', async (req: Request, res: Response) => {
  try {
    const { message, language, history: bodyHistory, modelIds: bodyModelIds, images: bodyImages } = req.body;

    // Validate input - allow empty message if images are provided
    const hasMessage = message && typeof message === 'string' && message.trim().length > 0;
    const images = parseImages(bodyImages);
    
    if (!hasMessage && !images) {
      return res.status(400).json({
        error: 'Message or images are required'
      });
    }
    const modelIds = parseModelIds(bodyModelIds);
    const charLimit = getCharLimit(modelIds);

    if (hasMessage && message.length > charLimit) {
      return res.status(400).json({
        error: `Message is too long. Maximum length is ${charLimit.toLocaleString()} characters for the selected models.`
      });
    }

    const history = parseHistory(bodyHistory, charLimit);
    logger.info(
      `Received chat stream request with message length: ${message?.length ?? 0}, language: ${language}, history turns: ${history?.length ?? 0}, images: ${images?.length ?? 0}, modelIds: ${modelIds?.join(',') ?? 'default'}`
    );

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    let writeLock = Promise.resolve();
    const writeChunk = (payload: StreamChunkPayload): Promise<void> => {
      const line = `data: ${JSON.stringify(payload)}\n\n`;
      writeLock = writeLock.then(
        () =>
          new Promise<void>((resolve, reject) => {
            res.write(line, (err) => (err ? reject(err) : resolve()));
          })
      );
      return writeLock;
    };

    await streamMultipleModels(message?.trim() || '', language, history, writeChunk, modelIds, images);
    await writeLock;
    res.end();
  } catch (error: any) {
    logger.error('Error in chat stream endpoint:', error);
    if (!res.headersSent) {
      return res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
    try {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    } catch {
      // ignore
    }
  }
});

/**
 * POST /api/chat/retry
 * Retry a single failed model for the same user message and context
 */
router.post('/retry', async (req: Request, res: Response) => {
  try {
    const { message, language, history: bodyHistory, modelId } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Message is required and must be a non-empty string'
      });
    }
    if (!modelId || typeof modelId !== 'string' || modelId.trim().length === 0) {
      return res.status(400).json({
        error: 'modelId is required for retry'
      });
    }

    const charLimit = getCharLimit([modelId.trim()]);
    if (message.length > charLimit) {
      return res.status(400).json({
        error: `Message is too long. Maximum length is ${charLimit.toLocaleString()} characters for ${modelId}.`
      });
    }

    const history = parseHistory(bodyHistory, charLimit);
    logger.info(
      `Retry request for model ${modelId}, message length: ${message.length}, history turns: ${history?.length ?? 0}`
    );

    const response = await querySingleModelForRetry(
      message.trim(),
      language,
      history,
      modelId.trim()
    );

    if (response === null) {
      return res.status(400).json({
        error: 'Unknown or unsupported modelId for retry'
      });
    }

    return res.json({
      success: true,
      response,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    logger.error('Error in chat retry endpoint:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

export default router;
