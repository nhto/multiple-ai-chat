import express, { NextFunction, Request, Response } from "express";
import { requireRole } from "../../middlewares/authn";
import { createApiResponse, RoleLabel, EventAlbumsSummary } from "../../../../models/model";
import * as abstractManagementService from '../../../../services/abstractManagement';
import logger from "../../../../utilities/logger";
const router = express.Router();

router.post('/submission-form/init', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const abstractConfig = await abstractManagementService.init(req.session.data.me, req.body?.eventId, res);
    return res.status(200).send(createApiResponse<any>(null, abstractConfig));
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

router.post('/submission-form/create', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("req.body");
    console.log(req.body);
    const newAbstractConfig = await abstractManagementService.create(req.session.data.me, req.body?.eventId, req.body);
    return res.status(200).send(createApiResponse<any>("Save successfully", null));
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

router.post('/submission-form/deleteCustomQuestion', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("req.body");
    console.log(req.body);
    const deleteQuestion = await abstractManagementService.deleteCustomQuestion(req.session.data.me, req.body.customQuestion, res);
    return res.status(200).send(createApiResponse<any>("Delete successfully", null));
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

router.post('/submission-form/homeInitAsync', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const abstractConfig = await abstractManagementService.homeInitAsync(req.session.data.me, req.body?.eventId, res);
    return res.status(200).send(createApiResponse<any>(null, abstractConfig));
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

export default router;