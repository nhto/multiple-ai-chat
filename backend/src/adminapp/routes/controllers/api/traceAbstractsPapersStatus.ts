import express, { NextFunction, Request, Response } from "express";
import { requireRole } from "../../middlewares/authn";
import { createApiResponse, RoleLabel, EventAlbumsSummary } from "../../../../models/model";
import { PaginationResult, parsePaginationRequest } from '../../../../utilities/pagination';
import { Abstracts, AbstractShortlistingSubmissions } from "../../../../repo/eventAbstractReviews";
import * as traceAbstractsPapersStatusService from '../../../../services/traceAbstractsPapersStatus';
import logger from "../../../../utilities/logger";
import * as s3 from "../../../../utilities/s3client";
import multer from 'multer';

const router = express.Router();
const storage = multer.memoryStorage();
const fileUpload = multer({ storage });

router.post('/init', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.body);
    const abstractConfig = await traceAbstractsPapersStatusService.init(req.session.data.me, req.body?.eventId, res);
    return res.status(200).send(createApiResponse<any>(null, abstractConfig));
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

// DOWNLOAD SINGLE abstract
router.get(
  "/:eventId/download/:abstractId",
  async (req: Request, res: Response, next: NextFunction) => {
    const { eventId, abstractId } = req.params;
    const abstract = await Abstracts.findOne({ 
      where: { id: abstractId }
    });
    const s3Key = abstract.s3FileKey;

    try {
      await s3.getSingleFile(s3Key, res, abstract.fileName);
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

// DOWNLOAD SINGLE paper
router.get(
  "/:eventId/download/paper/:paperId",
  async (req: Request, res: Response, next: NextFunction) => {
    const { eventId, paperId } = req.params;
    const paper = await AbstractShortlistingSubmissions.findOne({ 
      where: { id: paperId }
    });
    const s3Key = paper.s3FileKey;

    try {
      await s3.getSingleFile(s3Key, res, paper.fileName);
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

// DOWNLOAD all abstract
router.get(
  "/:eventId/download/all/abstract",
  async (req: Request, res: Response, next: NextFunction) => {
    const { eventId } = req.params;
    const abstractCollection = await Abstracts.findAll({
      where:{
        eventId: eventId,
        isSubmitted: true,
      }
    });

    try {
      await s3.getAllAbstractZippedAmsTraceStatus(eventId, res, "abstract", abstractCollection);
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

// DOWNLOAD all paper
router.get(
  "/:eventId/download/all/paper",
  async (req: Request, res: Response, next: NextFunction) => {
    const { eventId } = req.params;
    const paperCollection = await AbstractShortlistingSubmissions.findAll({
      where:{eventId: eventId}
    });

    try {
      await s3.getAllAbstractZippedAmsTraceStatus(eventId, res, "paper", paperCollection);
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);


export default router;