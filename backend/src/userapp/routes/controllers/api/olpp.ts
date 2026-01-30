import express, { NextFunction, Request, Response } from 'express';
import { createApiResponse } from '../../../../models/model';

import * as OlppService from '../../../../services/olpp';
import logger from '../../../../utilities/logger';

const router = express.Router();

router.post('/start', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await OlppService.start(req.body?.participantId, req.body?.eventId, req.body?.paymentRefId, req.body?.callbackurl, req.body?.failedcallbackurl);
    return res.status(200).send(createApiResponse<string>(null, response));
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

router.post('/status/get', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await OlppService.getStatus(req.body?.participantId, req.body?.eventId, req.body?.paymentRefId);
    return res.status(200).send(createApiResponse<any>(null, response));
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

export default router;