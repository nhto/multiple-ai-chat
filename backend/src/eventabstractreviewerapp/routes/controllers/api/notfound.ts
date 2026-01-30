import express, { NextFunction, Request, Response } from 'express';
import { createErrorBody } from '../../middlewares/error';

const router = express.Router();

router.get('*', async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.status(404).send(createErrorBody("Invalid Request."));
  } catch (err) {
    return next(err);
  }
});

export default router;