import express, { NextFunction, Request, Response } from 'express';
import { requireRole } from "../../middlewares/authn";
import { ApiError, apiInternalServerError, apiSessionTimeoutError } from '../../../../models/error';
import { createApiResponse, RoleLabel } from '../../../../models/model';

import * as ConfigService from '../../../../services/config';

const router = express.Router();

router.get('/', requireRole(RoleLabel.User), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await ConfigService.get(req.session.data.me);
    return res.status(200).send(createApiResponse(null, response));
  } catch (err) {
    return next(err);
  }
});

export default router;