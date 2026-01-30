import express, { NextFunction, Request, Response } from "express";
import { requireRole } from "../../middlewares/authn";
import {
  createApiResponse,
  RoleLabel,
  EventAlbumsSummary,
} from "../../../../models/model";
import * as screenAbstractSubmissionService from "../../../../services/screenAbstractSubmission";
import logger from "../../../../utilities/logger";
import { Abstracts } from "../../../../repo/eventAbstractReviews";
import * as s3 from "../../../../utilities/s3client";

const router = express.Router();

router.post(
  "/init",
  requireRole([
    RoleLabel.SystemAdmin,
    RoleLabel.EventOrganizer,
    RoleLabel.EventSupporter,
  ]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log(req.body);
      const abstractConfig = await screenAbstractSubmissionService.init(
        req.session.data.me,
        req.body?.eventId,
        res
      );
      return res.status(200).send(createApiResponse<any>(null, abstractConfig));
    } catch (err) {
      logger.error(err);
      return next(err);
    }
  }
);

router.post(
  "/proceedAbstract",
  requireRole([
    RoleLabel.SystemAdmin,
    RoleLabel.EventOrganizer,
    RoleLabel.EventSupporter,
  ]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log(req.body);
      const proceedAbstract =
        await screenAbstractSubmissionService.proceedAbstract(
          req.session.data.me,
          req.body?.abstract.eventId,
          req.body?.abstract,
          res
        );
      return res
        .status(200)
        .send(
          createApiResponse<any>(
            "Proceed Abstract successfully",
            proceedAbstract
          )
        );
    } catch (err) {
      logger.error(err);
      return next(err);
    }
  }
);

router.post(
  "/removeAbstract",
  requireRole([
    RoleLabel.SystemAdmin,
    RoleLabel.EventOrganizer,
    RoleLabel.EventSupporter,
  ]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log(req.body);
      const removeAbstract =
        await screenAbstractSubmissionService.removeAbstract(
          req.session.data.me,
          req.body?.abstract.eventId,
          req.body?.abstract,
          req.body?.reason,
          res
        );
      return res
        .status(200)
        .send(
          createApiResponse<any>(
            "Abstract status update successfully. Pre-screen Fail email is sent to submitter.",
            null
          )
        );
    } catch (err) {
      logger.error(err);
      return next(err);
    }
  }
);

// GET Abstract Streaming
router.get(
  "/abstract-streaming/:eventId/:abstractId",
  async (req: Request, res: Response, next: NextFunction) => {
    const { eventId, abstractId } = req.params;
    try {
      const abstract = await Abstracts.findOne({
        where: {
          id: abstractId,
          eventId: eventId,
        },
      });

      await s3.getSingleFile(abstract.s3FileKey, res, abstract.fileName);
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

router.post(
  "/getReviewerAbstractPairing",
  requireRole([
    RoleLabel.SystemAdmin,
    RoleLabel.EventOrganizer,
    RoleLabel.EventSupporter,
  ]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log(req.body);
      const abstractCollection =
        await screenAbstractSubmissionService.getReviewerAbstractPairing(
          req.session.data.me,
          req.body?.reviewerId,
          res
        );
      return res
        .status(200)
        .send(
          createApiResponse<any>(
            null,
            abstractCollection
          )
        );
    } catch (err) {
      logger.error(err);
      return next(err);
    }
  }
);

export default router;
