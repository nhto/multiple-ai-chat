import express, { NextFunction, Request, Response } from "express";
import { requireRole } from "../../middlewares/authn";
import { createApiResponse, RoleLabel } from "../../../../models/model";
import * as termOfUseService from '../../../../services/termOfUse';
import logger from "../../../../utilities/logger";

const router = express.Router();

router.post('/init', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const termOfUse = await termOfUseService.init(req.session.data.me, res);
    return res.status(200).send(createApiResponse<any>(null, termOfUse));
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

router.post('/accept', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const termOfUse = await termOfUseService.acceptTerm(req.session.data.me, res);
    return res.status(200).send(createApiResponse<any>(null, null));
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

export default router;