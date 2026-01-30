import express, { Request, Response } from 'express';
import logger from '../../../utilities/logger';

import * as OlppService from '../../../services/olpp';

const router = express.Router();

router.get('/olpp-callback/*', async (req: Request, res: Response) => {
  let participantId: string;
  let eventId: string;
  let paymentRefId: string;

  try {
    participantId = String(req.query?.participantId);
    eventId = String(req.query?.eventId);
    paymentRefId = String(req.query?.paymentRefId);

    const d = String(req.query?.d).replace("\r\n", "");
    const response = await OlppService.handleCallback(d);

    if (!!response) {
      participantId = response.participantId;
      eventId = response.eventId;
      paymentRefId = response.paymentRefId;
    }
  } catch (err) {
    logger.warn("Error thrown on /olpp-callback");
    logger.warn(err);
  }

  const path = `/payment?id=${participantId}&eventid=${eventId}&refid=${paymentRefId}&callback=true`
  return res.status(200).redirect(path);
});

export default router;