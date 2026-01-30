import express, { NextFunction, Request, Response } from "express";
import { requireRole } from "../../middlewares/authn";
import { createApiResponse, RoleLabel, FileCollectionSummary, FileSubmissionReviewSummary } from "../../../../models/model";
import { PaginationResult, parsePaginationRequest } from '../../../../utilities/pagination';
import * as s3 from "../../../../utilities/s3client";

import * as FileCollectionService from '../../../../services/fileCollection';
import logger from "../../../../utilities/logger";

const router = express.Router();

router.post('/init', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fileCollection = await FileCollectionService.init(req.session.data.me, req.body?.eventId);
    return res.status(200).send(createApiResponse<FileCollectionSummary>(null, fileCollection));
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

router.post('/save', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fileCollection = await FileCollectionService.save(req.session.data.me, req.body?.eventId, req.body);
    return res.status(200).send(createApiResponse<FileCollectionSummary>(null, fileCollection));
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

router.post('/search', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const paginationParam = parsePaginationRequest(req.body);
    const searchParam = {...req.body}

    const fileSubmissions = await FileCollectionService.searchPaginated(req.session.data.me, searchParam, paginationParam);
    return res.status(200).send(createApiResponse<PaginationResult<FileSubmissionReviewSummary[]>>(null, fileSubmissions));
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

router.post('/:type/approval/update', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fileSubmission = await FileCollectionService.updateApprovalStatus(req.session.data.me, req.params?.type, req.body?.submissionId, req.body?.approvalStatus);
    return res.status(200).send(createApiResponse<FileSubmissionReviewSummary>(null, fileSubmission));
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

router.post('/file/download', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fileContent = await FileCollectionService.download(req.session.data.me, req.body?.id, req.body?.applicantNetId, req.body?.submissionType, req.body?.fileName);
    return res.status(200).send(createApiResponse<any>(null, fileContent));
  } catch (err) {
    logger.error(err);
    return res.status(200).send(createApiResponse<any>(null, false));
  }
});

router.post('/file/all/download', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fileContent = await FileCollectionService.downloadAll(req.session.data.me, req.body?.id, req.body?.applicantNetId, req.body?.submissionType);
    return res.status(200).send(createApiResponse<any[]>(null, fileContent));
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

//Download single file streaming
router.get('/file/download/streaming/:id/:applicantNetId/:submissionType/:fileName', async (req: Request, res: Response, next: NextFunction) => {
  const { id, applicantNetId, submissionType, fileName } = req.params;
  try {
    await s3.getSingleFile(
      `${id}/${applicantNetId}/${submissionType}/${fileName}`,
      res,
      fileName,
    );
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// DOWNLOAD ALL folder files streaming
router.get(
  "/file/all/download/streaming/:id/:applicantNetId/:submissionType",
  async (req: Request, res: Response, next: NextFunction) => {
    const { id, applicantNetId, submissionType } = req.params;
    try {
      const zippedFile = await s3.getAllBucketFilesZippedFileCollection(
        id,
        applicantNetId,
        res,
        submissionType,
      );
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

// DOWNLOAD ALL selected folder files streaming
router.get(
  "/file/all/download/selected/streaming/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    if (typeof(req.query.arrayParam) === 'string') {
      const applicantNetIdArray = req.query.arrayParam.split(',');

      try {
      const zippedFile = await s3.getAllBucketSelectedFilesZippedFileCollection(
        id,
        applicantNetIdArray,
        res,
      );
    } catch (err) {
      console.error(err);
      next(err);
    }
  } 
  }
);

export default router;