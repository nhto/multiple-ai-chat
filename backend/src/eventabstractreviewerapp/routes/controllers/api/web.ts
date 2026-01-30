import express, { NextFunction, Request, Response } from 'express';
import { ApiError, apiInternalServerError, apiSessionTimeoutError } from '../../../../models/error';
import { requireRole } from '../../middlewares/authn';
import { createApiResponse, RoleLabel } from '../../../../models/model';

import * as WebService from '../../../../services/web';
import { WebAttributes } from '../../../../repo/web';

const router = express.Router();

router.post('/event-url/unique/check', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const web = await WebService.eventUrlUniqueCheck(req.body.eventId, req.body.eventUrl);
    return res.status(200).send(createApiResponse<any>(null, web));
  } catch (err) {
    return next(err);
  }
});

router.post('/:type/search', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const web = await WebService.search(req.session.data.me, req.params?.type, req.body.eventId);
    return res.status(200).send(createApiResponse<any>(null, web));
  } catch (err) {
    return next(err);
  }
});

router.post('/:type/save', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const web = await WebService.save(req.session.data.me, req.params?.type, req.body);
    return res.status(200).send(createApiResponse<WebAttributes>(null, web));
  } catch (err) {
    return next(err);
  }
});

router.post('/:type/saveAll', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const web = await WebService.save(req.session.data.me, req.params?.type, req.body);
    return res.status(200).send(createApiResponse<WebAttributes>(null, web));
  } catch (err) {
    return next(err);
  }
});

router.post('/publish', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const web = await WebService.publishWeb(req.session.data.me, req.body.eventId, req.body.isPublished);
    return res.status(200).send(createApiResponse<WebAttributes>(null, web));
  } catch (err) {
    return next(err);
  }
});

export default router;