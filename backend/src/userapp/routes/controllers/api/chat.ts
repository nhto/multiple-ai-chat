import { Request, Response, Router } from 'express';
import { queryMultipleModels, streamMultipleModels, StreamChunkPayload, querySingleModelForRetry } from '../../../../services/openrouter';
import logger from '../../../../utilities/logger';

const router = Router();

/**
 * POST /api/chat
 * Send a message to multiple AI models and get responses
 */
/** Validate and normalize conversation history from request body */
function parseHistory(bodyHistory: unknown): Array<{ userMessage: string; responses: Array<{ modelName: string; response: string }> }> | undefined {
  if (bodyHistory == null || !Array.isArray(bodyHistory)) {
    return undefined;
  }
  const history: Array<{ userMessage: string; responses: Array<{ modelName: string; response: string }> }> = [];
  const maxTurns = 50;
  for (let i = 0; i < Math.min(bodyHistory.length, maxTurns); i++) {
    const turn = bodyHistory[i];
    if (!turn || typeof turn !== 'object' || typeof turn.userMessage !== 'string' || turn.userMessage.trim() === '') {
      continue;
    }
    const userMessage = turn.userMessage.trim();
    if (userMessage.length > 4000) continue;
    let responses: Array<{ modelName: string; response: string }> = [];
    if (Array.isArray(turn.responses)) {
      for (const r of turn.responses) {
        if (r && typeof r.modelName === 'string' && typeof r.response === 'string') {
          responses.push({ modelName: r.modelName, response: r.response });
        }
      }
    }
    history.push({ userMessage, responses });
  }
  return history.length > 0 ? history : undefined;
}

router.post('/', async (req: Request, res: Response) => {
  try {
    const { message, language, history: bodyHistory } = req.body;

    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Message is required and must be a non-empty string'
      });
    }

    // Limit message length to prevent abuse
    if (message.length > 4000) {
      return res.status(400).json({
        error: 'Message is too long. Maximum length is 4000 characters.'
      });
    }

    const history = parseHistory(bodyHistory);
    logger.info(
      `Received chat request with message length: ${message.length}, language: ${language}, history turns: ${history?.length ?? 0}`
    );

    // Query all models in parallel (with optional conversation history)
    const responses = await queryMultipleModels(message.trim(), language, history);

    // Return responses
    return res.json({
      success: true,
      userMessage: message.trim(),
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
    const { message, language, history: bodyHistory } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Message is required and must be a non-empty string'
      });
    }
    if (message.length > 4000) {
      return res.status(400).json({
        error: 'Message is too long. Maximum length is 4000 characters.'
      });
    }

    const history = parseHistory(bodyHistory);
    logger.info(
      `Received chat stream request with message length: ${message.length}, language: ${language}, history turns: ${history?.length ?? 0}`
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

    await streamMultipleModels(message.trim(), language, history, writeChunk);
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
    if (message.length > 4000) {
      return res.status(400).json({
        error: 'Message is too long. Maximum length is 4000 characters.'
      });
    }
    if (!modelId || typeof modelId !== 'string' || modelId.trim().length === 0) {
      return res.status(400).json({
        error: 'modelId is required for retry'
      });
    }

    const history = parseHistory(bodyHistory);
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
