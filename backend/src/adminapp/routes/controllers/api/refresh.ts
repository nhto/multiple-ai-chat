import express, { NextFunction, Request, Response } from 'express';
import { ApiError } from '../../../../models/error';
import { createApiResponse } from '../../../../models/model';

const router = express.Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!!req.session.data?.me) {
      return res.status(200).send(createApiResponse(null, req.session.data.me));
    }
    else {
      throw new ApiError('Session timed out.');
    }
  } catch (err) {
    return next(err);
  }
});

export default router;