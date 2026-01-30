import express, { Request, Response, NextFunction } from "express";
import * as s3 from "../../../../utilities/s3client";
import { createApiResponse } from "../../../../models/model";
import { getEventDetailsById } from "../../../../services/event";
import * as config from "../../../../utilities/config";
import { ApiError } from "../../../../models/error";
import { compileAbstractLandingPageOutput } from "../../../../utilities/payload";
import * as AbstractReviewersService from "../../../../services/eventAbstractReviews/abstractReviewers";
import {
  getAbstractReviewerCounts,
  abstractReviewsDataMarkedWithTimeStamp,
  areAbstractReviewsDuplicated,
  extractAbstractIds,
  createAbstractReviewInput,
  getMailOptions,
  wrapUpAssessmentRecordSubmission,
} from "../../../../utilities/payload";
import {
  AbstractReviewerLandingPageData,
  AvailableAbstractsDetails,
  AbstractCounts,
  AssessmentRecords,
  ManageAbstractReview,
  UpdatedAbstractReview,
  PickedAbstractDetails,
} from "../../../../services/eventAbstractReviews/interfaces";
import { sendEmail } from "../../../../utilities/email";
import {
  AbstractReviews,
  Abstracts,
  AbstractTopics,
} from "../../../../repo/eventAbstractReviews";

const router = express.Router();

// GET Abstract Streaming
router.get(
  "/abstract-streaming/:eventId/:abstractId",
  async (req: Request, res: Response, next: NextFunction) => {
    const { eventId, abstractId } = req.params;
    try {
      //   if(!req.session?.data?.isAuthenticated){
      //     throw new ApiError('Unauthorized access');
      //   }]
      let abstractS3FileKey =
        await AbstractReviewersService.getAbstractS3FileKeyById(
          parseInt(abstractId, 10)
        );
      let userDefinedFileName =
        await AbstractReviewersService.getAbstractUserFileNameById(
          parseInt(abstractId, 10)
        );

      const abstract = await Abstracts.findOne({
        where: { id: abstractId },
      });

      await s3.getSingleFile(abstract.s3FileKey, res, userDefinedFileName);
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

router.get(
  "/picked-abstracts/:eventId/:reviewerId",
  async (req: Request, res: Response, next: NextFunction) => {
    const { eventId, reviewerId } = req.params;
    try {
      let data = await AbstractReviewersService.getPickedAbstracts(
        parseInt(reviewerId, 10),
        eventId
      );

      return res
        .status(200)
        .send(createApiResponse<PickedAbstractDetails[]>(null, data));
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

router.get(
  "/reviewed-abstracts/:eventId/:reviewerId",
  async (req: Request, res: Response, next: NextFunction) => {
    const { eventId, reviewerId } = req.params;
    try {
      let data = await AbstractReviewersService.getReviewedAbstracts(
        parseInt(reviewerId, 10),
        eventId
      );

      return res
        .status(200)
        .send(createApiResponse<PickedAbstractDetails[]>(null, data));
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

router.delete(
  "/unselect-abstract/:eventId/:abstractId/:reviewerId",
  async (req: Request, res: Response, next: NextFunction) => {
    const { eventId, abstractId, reviewerId } = req.params;
    try {
      let data = await AbstractReviewersService.deleteAbstractReviewByIds(
        parseInt(abstractId, 10),
        eventId,
        parseInt(reviewerId, 10)
      );
      await AbstractReviewersService.deductReviewerNumberForAbstract(
        parseInt(abstractId, 10),
        eventId
      );

      return res
        .status(200)
        .send(createApiResponse<typeof AbstractReviews>(null, data));
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

// GET Reviewer Landing Page Data
router.get(
  "/:eventId/:reviewerEmail",
  async (req: Request, res: Response, next: NextFunction) => {
    const { eventId: paramEventId, reviewerEmail: paramReviewerEmail } =
      req.params;
    try {
      //   if(!req.session?.data?.isAuthenticated){
      //     throw new ApiError('Unauthorized access');
      //   }]
      console.log("paramReviewerEmail");
      console.log(paramReviewerEmail);
      console.log("paramEventId");
      console.log(paramEventId);
      let reviewerId = await AbstractReviewersService.getReviewerIdByEmail(
        paramReviewerEmail,
        paramEventId
      );
      let topicId = await AbstractReviewersService.getTopicIdByReviewerId(
        reviewerId
      );
      console.log("topicId, ", topicId);
      let topic = await AbstractReviewersService.getTopicByTopicId(topicId);

      let counts = await getAbstractReviewerCounts(
        paramEventId,
        reviewerId,
        topicId
      );

      let gradingConfig =
        await AbstractReviewersService.getGradingMethodByEventId(paramEventId);

      const landingPageBoxData = compileAbstractLandingPageOutput(
        paramEventId,
        counts.availableAbstractCount,
        counts.pickedAbstractCount,
        counts.reviewedAbstractCount
      );

      const eventPeriod = await AbstractReviewersService.getEventStartEndData(
        paramEventId
      );
      const eventTopic = await AbstractReviewersService.getEventTopicById(
        paramEventId
      );

      const abastractReviewEnd = await AbstractReviewersService.getReviewEndData(paramEventId);

      if (reviewerId === null) {
        console.log("Error - Reviewer not found");
        throw new ApiError("Reviewer not exist");
      }

      if (topicId === null) {
        console.log("Error - Reviewer not assigned with topic");
        throw new ApiError("Reviewer not assigned with topic");
      }

      const presentationModeEnable = await AbstractReviewersService.getPresentationModeEnable(paramEventId);


      let reviewerIdInString = reviewerId?.toString();
      let topicIdInString = topicId?.toString();

      let returnedPayload: any = {
        landingPageBoxData,
        topicId: topicIdInString,
        reviewerId: reviewerIdInString,
        topic,
        gradingMethod: gradingConfig.gradingMethod,
        eventPeriod,
        eventTopic,
        abastractReviewEnd,
        presentationModeEnable
      };

      console.log("check landing payload");
      console.log(returnedPayload);

      return res
        .status(200)
        .send(
          createApiResponse<AbstractReviewerLandingPageData[]>(
            null,
            returnedPayload
          )
        );
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

// GET Available Abstract Page Data
router.get(
  "/:eventId/:reviewerId/:topicId",
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      eventId: paramEventId,
      reviewerId: paramReviewerId,
      topicId: paramTopicId,
    } = req.params;
    try {
      //   if(!req.session?.data?.isAuthenticated){
      //     throw new ApiError('Unauthorized access');
      //   }]
      const availableAbstracts =
        await AbstractReviewersService.getAvailableAbstractsDetails(
          paramEventId,
          parseInt(paramReviewerId, 10),
          parseInt(paramTopicId, 10)
        );

      return res
        .status(200)
        .send(
          createApiResponse<AvailableAbstractsDetails[]>(
            null,
            availableAbstracts
          )
        );
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

// POST Insert Abstract Review - Selection Case
router.post(
  "/selection/:eventId/:reviewerId/:abstractId/:topicId",
  async (req, res) => {
    const { eventId, reviewerId, abstractId, topicId } = req.params;
    try {
      const review = await AbstractReviewersService.addAbstractReview(
        eventId,
        parseInt(reviewerId, 10),
        parseInt(abstractId, 10)
      );
      const counts = await getAbstractReviewerCounts(
        eventId,
        parseInt(reviewerId, 10),
        parseInt(topicId, 10)
      );
      const returnedPayload: any = { ...counts, abstractReview: review };
      return res
        .status(200)
        .send(createApiResponse<AbstractCounts>(null, returnedPayload));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// POST Insert Abstract Review - Bulk Selection Case
router.post("/bulk-selection/:topicId", async (req, res) => {
  const { topicId } = req.params;
  const abstractReviews = req.body;
  const reviewerId = req.body[0].reviewerId;
  const eventId = req.body[0].eventId;
  const enhancedAbstractReviews =
    abstractReviewsDataMarkedWithTimeStamp(abstractReviews);
  try {
    let duplicatedRows = await areAbstractReviewsDuplicated(abstractReviews);
    if (!duplicatedRows) {
      await AbstractReviewersService.addMultipleAbstractReviews(
        enhancedAbstractReviews
      );
      await AbstractReviewersService.increaseReviewerNumbersForMultipleAbstracts(
        extractAbstractIds(abstractReviews),
        eventId
      );
    }

    const counts = await getAbstractReviewerCounts(
      eventId,
      reviewerId,
      parseInt(topicId, 10)
    );

    const returnedPayload: any = { ...counts };

    return res
      .status(200)
      .send(createApiResponse<AbstractCounts>(null, returnedPayload));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Get Assessment Record for FE Preloading
router.get(
  "/assessment-record/:eventId/:abstractId/:reviewerId",
  async (req: Request, res: Response, next: NextFunction) => {
    const { eventId, abstractId, reviewerId } = req.params;
    try {
      //   if(!req.session?.data?.isAuthenticated){
      //     throw new ApiError('Unauthorized access');
      //   }]
      let assessmentRecords =
        await AbstractReviewersService.getCommentsAndGrades(
          eventId,
          parseInt(abstractId, 10),
          parseInt(reviewerId, 10)
        );

      return res
        .status(200)
        .send(createApiResponse<AssessmentRecords>(null, assessmentRecords));
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

// POST assessment DRAFT
router.post(
  "/assessment-save/:eventId/:abstractId/:reviewerId",
  async (req: Request, res: Response, next: NextFunction) => {
    const { eventId, abstractId, reviewerId } = req.params;
    const { comments, grades } = req.body;
    try {
      //   if(!req.session?.data?.isAuthenticated){
      //     throw new ApiError('Unauthorized access');
      //   }]
      let assessmentRecords =
        await AbstractReviewersService.manageAbstractReview(
          createAbstractReviewInput(
            abstractId,
            eventId,
            reviewerId,
            comments,
            grades,
            false
          )
        );
      return res
        .status(200)
        .send(
          createApiResponse<UpdatedAbstractReview>(null, assessmentRecords)
        );
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

// POST assessment SUBMISSION
router.post(
  "/assessment-submission/:eventId/:abstractId/:reviewerId/:topicId",
  async (req: Request, res: Response, next: NextFunction) => {
    const { eventId, abstractId, reviewerId, topicId } = req.params;
    const { comments, grades } = req.body;
    try {
      await AbstractReviewersService.handleSingleAbstractReviewSubmission(
        eventId,
        parseInt(abstractId, 10),
        parseInt(reviewerId, 10),
        comments,
        grades,
        true
      );

      const counts = await getAbstractReviewerCounts(
        eventId,
        parseInt(reviewerId, 10),
        parseInt(topicId, 10)
      );

      let assessmentSubmission = req.body;
      assessmentSubmission = wrapUpAssessmentRecordSubmission(
        assessmentSubmission,
        eventId,
        parseInt(abstractId, 10),
        parseInt(reviewerId, 10)
      );

      const returnedPayload: any = {
        updatedAbstractReview: assessmentSubmission,
        counts,
      };

      return res
        .status(200)
        .send(createApiResponse<ManageAbstractReview>(null, returnedPayload));
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

// POST BULK assessment SUBMISSION
router.post(
  "/bulk-assessment-submission/:eventId/:reviewerId/:topicId",
  async (req: Request, res: Response, next: NextFunction) => {
    const { eventId, topicId, reviewerId } = req.params;
    const bulkAssessments = req.body; // Expecting an array of assessments

    try {
      // Loop through each assessment in the bulk submission
      for (let assessment of bulkAssessments) {
        const { abstractId, comments, grades } = assessment;

        // Call the service function for handling single review submission
        await AbstractReviewersService.handleSingleAbstractReviewSubmission(
          eventId,
          parseInt(abstractId, 10),
          parseInt(reviewerId, 10),
          comments,
          grades,
          true
        );
      }

      // After completing all assessments, get the updated counts, for landing page
      const counts = await getAbstractReviewerCounts(
        eventId,
        parseInt(reviewerId, 10),
        parseInt(topicId, 10)
      );

      const returnedPayload: any = {
        message: "Bulk submission successful",
        submissionRecords: bulkAssessments,
        counts,
      };

      // Send the final response
      return res
        .status(200)
        .send(createApiResponse<ManageAbstractReview>(null, returnedPayload));
    } catch (err) {
      console.error("Error during bulk submission:", err);
      next(err);
    }
  }
);

// ONLY for email log testing
router.post(
  "/email-log-testing",
  async (req: Request, res: Response, next: NextFunction) => {
    const logData = req.body;

    await AbstractReviewersService.insertEmailDeliveryLog(logData);

    try {
      const returnedPayload: any = {
        message: "Email Test Successful",
      };

      // Send the final response
      return res
        .status(200)
        .send(createApiResponse<ManageAbstractReview>(null, returnedPayload));
    } catch (err) {
      console.error("Error during bulk submission:", err);
      next(err);
    }
  }
);

export default router;
