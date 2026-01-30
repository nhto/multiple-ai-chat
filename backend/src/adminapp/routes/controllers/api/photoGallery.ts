import express, { NextFunction, Request, Response } from "express";
import { requireRole } from "../../middlewares/authn";
import { createApiResponse, RoleLabel, EventAlbumsSummary } from "../../../../models/model";
import { PaginationResult, parsePaginationRequest } from '../../../../utilities/pagination';

import * as photoGalleryService from '../../../../services/photoGallery';
import logger from "../../../../utilities/logger";
import multer from 'multer';

const router = express.Router();
const storage = multer.memoryStorage();
const fileUpload = multer({ storage });

router.post('/init', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const photoGallery = await photoGalleryService.init(req.session.data.me, req.body?.eventId, res);
    return res.status(200).send(createApiResponse<EventAlbumsSummary[]>(null, photoGallery));
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

router.post('/save', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const photoGallery = await photoGalleryService.save(req.session.data.me, req.body?.eventId, req.body);
    return res.status(200).send(createApiResponse<EventAlbumsSummary>('Save successfully', photoGallery));
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

router.post('/deleteAlbum', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await photoGalleryService.deleteAlbum(req.session.data.me, req.body);
    return res.status(200).send(createApiResponse(`Delete Album successfully`, null));
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

router.post('/deletePhoto', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await photoGalleryService.deletePhoto(req.session.data.me, req.body);
    return res.status(200).send(createApiResponse(`Delete Photo successfully`, null));
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

router.post('/upload', fileUpload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eventAlbum = JSON.parse(req.query.eventAlbum as string);
    await photoGalleryService.upload(req.session.data.me, eventAlbum?.eventId, eventAlbum, req.file);
    return res.status(200).send(createApiResponse(`Upload Photo successfully`, null));
  } catch (err) {
    logger.error(err);
    return res.status(200).send(createApiResponse(null, false));
  }
});

router.post('/updateAlbum', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const photoGallery = await photoGalleryService.updateAlbum(req.session.data.me, req.body?.eventId, req.body);
    return res.status(200).send(createApiResponse<EventAlbumsSummary>('Update Album successfully', photoGallery));
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

export default router;