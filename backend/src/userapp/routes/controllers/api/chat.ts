import { Request, Response, Router } from 'express';
import { queryMultipleModels } from '../../../../services/openrouter';
import logger from '../../../../utilities/logger';

const router = Router();

/**
 * POST /api/chat
 * Send a message to multiple AI models and get responses
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { message, language } = req.body;

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

    logger.info(`Received chat request with message length: ${message.length}, language: ${language}`);

    // Query all models in parallel
    const responses = await queryMultipleModels(message.trim(), language);

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

export default router;
