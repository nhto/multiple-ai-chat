import express, { NextFunction, Request, Response } from 'express';
import { ApiError, apiInternalServerError, apiSessionTimeoutError } from '../../../../models/error';
import { createApiResponse } from '../../../../models/model';

const router = express.Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.status(200).send(createApiResponse(null, req.session.data.me));
  } catch (err) {
    return next(err);
  }
});

export default router;