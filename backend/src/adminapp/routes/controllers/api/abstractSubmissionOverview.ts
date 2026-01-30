import express, { NextFunction, Request, Response } from "express";
import { requireRole } from "../../middlewares/authn";
import {
  createApiResponse,
  RoleLabel,
  EventAlbumsSummary,
} from "../../../../models/model";
import {
  PaginationResult,
  parsePaginationRequest,
} from "../../../../utilities/pagination";

import * as controlPanelService from "../../../../services/controlPanel";
import * as abstractSubmissionOverviewService from "../../../../services/abstractSubmissionOverview";
import logger from "../../../../utilities/logger";
import multer from "multer";
import { sequelize } from "../../../../utilities/database";

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
      const abstractConfig = await abstractSubmissionOverviewService.init(
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

interface ReturnedPayload {
  eventId: string;
  pairedReviewData: {
    abstractId: string;
    reviewerId: number;
  }[];
}

router.post(
  "/bulk-abstract-review-pairing/:eventId",
  async (req: Request, res: Response, next: NextFunction) => {
    const { eventId } = req.params;
    const pairedReviewData = req.body;
    const t = await sequelize.transaction();

    try {
      await abstractSubmissionOverviewService.bulkInsertAbstractReview(
        req.session.data.me,
        pairedReviewData,
        eventId,
        t
      );
      await t.commit();
  
      let payload = {
        eventId,
        pairedReviewData,
      };
    
      return res
        .status(200)
        .send(createApiResponse<ReturnedPayload>("Bulk Update Abstact-Reviewer Pairing successfully", payload));
    } catch (err) {
      logger.error(err);
      return next(err);
    }
  }
);

// router.post('/submission-form/create', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     console.log("req.body");
//     console.log(req.body);
//     console.log("");
//     const newAbstractConfig = await abstractManagementService.create(req.session.data.me, req.body?.eventId, req.body);
//     return res.status(200).send(createApiResponse<any>(null, newAbstractConfig));
//   } catch (err) {
//     logger.error(err);
//     return next(err);
//   }
// });

export default router;
