import express, { NextFunction, Request, Response } from 'express';
import { ApiError, apiInternalServerError, apiSessionTimeoutError } from '../../../../models/error';
import { requireRole } from '../../middlewares/authn';
import { createApiResponse, RoleLabel, WebMenuSummary } from '../../../../models/model';

import * as WebMenuService from '../../../../services/webMenu';

const router = express.Router();

router.post('/get', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const webMenu = await WebMenuService.get(req.body.webId);
    return res.status(200).send(createApiResponse<WebMenuSummary[]>(null, webMenu));
  } catch (err) {
    return next(err);
  }
});

router.post('/save/all', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const webMenu = await WebMenuService.saveAll(req.session.data.me, req.body.webId, req.body.menuVariables);
    return res.status(200).send(createApiResponse<WebMenuSummary[]>(null, webMenu));
  } catch (err) {
    return next(err);
  }
});

export default router;