import express, { NextFunction, Request, Response } from "express";
import { requireRole } from "../../middlewares/authn";
import { createApiResponse, RoleLabel, EventAlbumsSummary } from "../../../../models/model";
import { PaginationResult, parsePaginationRequest } from '../../../../utilities/pagination';

import * as uploadReviewersDecidersService from '../../../../services/uploadReviewersDeciders';
import logger from "../../../../utilities/logger";
import multer from 'multer';

const router = express.Router();
const storage = multer.memoryStorage();
const fileUpload = multer({ storage });

router.post('/init', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const abstractConfig = await uploadReviewersDecidersService.init(req.session.data.me, req.body?.eventId, res);
    return res.status(200).send(createApiResponse<any>(null, abstractConfig));
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

router.post('/uploadReviewer', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const uploadReviewer = await uploadReviewersDecidersService.uploadReviewer(req.session.data.me, req.body?.eventId, req.body?.reviewerData, res);
    return res.status(200).send(createApiResponse<any>("Upload Reviewers Successfully", uploadReviewer));
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

router.post('/uploadDecider', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const uploadDecider = await uploadReviewersDecidersService.uploadDecider(req.session.data.me, req.body?.eventId, req.body?.deciderData, res);
    return res.status(200).send(createApiResponse<any>("Upload Review Coordinators Successfully", uploadDecider));
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

router.post('/deleteReviewer', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleteReviewer = await uploadReviewersDecidersService.deleteReviewer(req.session.data.me, req.body?.reviewerId, res);
    return res.status(200).send(createApiResponse<any>("Delete Reviewer Successfully", null));
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

router.post('/deleteDecider', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.body);
    const deleteDecider = await uploadReviewersDecidersService.deleteDecider(req.session.data.me, req.body?.deciderId, res);
    return res.status(200).send(createApiResponse<any>("Delete Review Coordinator Successfully", null));
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

router.post('/updateReviewer', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.body);
    const updateReviewer = await uploadReviewersDecidersService.updateReviewer(req.session.data.me, req.body?.reviewerCollection, req.body?.eventId, res);
    return res.status(200).send(createApiResponse<any>("Update Reviewer Successfully", updateReviewer));
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});


router.post('/updateDecider', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.body);
    const updateDecider = await uploadReviewersDecidersService.updateDecider(req.session.data.me, req.body?.deciderCollection, res);
    return res.status(200).send(createApiResponse<any>("Update Review Coordinator Successfully", updateDecider));
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});


export default router;