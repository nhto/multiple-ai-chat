import express, { Request, Response, NextFunction } from "express";
import * as s3 from "../../../../utilities/s3client";
import { createApiResponse } from "../../../../models/model";
import { getEventDetailsById } from "../../../../services/event";
import * as config from "../../../../utilities/config";
import { ApiError } from "../../../../models/error";
import { compileAbstractLandingPageOutput } from "../../../../utilities/payload";
import * as AbstractDecidersService from "../../../../services/eventAbstractReviews/abstractDeciders";
import {
  MasterListAbstract,
  AbstractForDeciders,
  AbstractDeciderLandingPageData,
  DeciderAssessment,
} from "../../../../services/eventAbstractReviews/interfaces";
import {
  compileAbstractDeciderLandingPageOutput,
  getAbstractDeciderCounts,
  getMailOptions,
  generateEmailDeliveryLogData,
  generateUnderDiscussionContent,
} from "../../../../utilities/payload";

import { sendEmail } from "../../../../utilities/email";

const router = express.Router();

// Helper Function
async function fetchAbstractConfigData(eventId: string) {
  const reviewerNumber =
    await AbstractDecidersService.getRequiredReviewerNumberPerAbstractByEventId(
      eventId
    );
  const gradingMethod = await AbstractDecidersService.getGradingMethodByEventId(
    eventId
  );
  const isGradedByScoring = gradingMethod === "scoring";
  const isSingleReviewerRequired = reviewerNumber === 1;

  return { isGradedByScoring, isSingleReviewerRequired };
}

// GET - Landing Page Loading Data
router.get("/landing/:eventId/:deciderEmail", async (req, res, next) => {
  const { eventId, deciderEmail } = req.params;
  try {
    const { isGradedByScoring, isSingleReviewerRequired } =
      await fetchAbstractConfigData(eventId);
    const counts = await getAbstractDeciderCounts(
      eventId,
      isSingleReviewerRequired,
      isGradedByScoring
    );
    let deciderId = await AbstractDecidersService.getDeciderIdByEmail(
      deciderEmail,
      eventId
    );

    if (deciderId === null) {
      throw new ApiError("Reviewer not exist");
    }

    const landingPageLoadingData = compileAbstractDeciderLandingPageOutput(
      eventId,
      counts.mnasterlistAbstractCount,
      counts.abstractsUnderFinalReviewCount,
      counts.finalizedAbstractCount
    );
    const gradingMethod =
      await AbstractDecidersService.getGradingMethodByEventId(eventId);
    const eventStartEndDates =
      await AbstractDecidersService.getEventStartEndData(eventId);
    const eventName = await AbstractDecidersService.getEventTopicById(eventId);
    const presentationMode = await AbstractDecidersService.getPresentationConfig(eventId);
    const presentationEnable = await AbstractDecidersService.getPresentationVisible(eventId);
    const presentationModeOptions = await AbstractDecidersService.getPresentationModeOptions();
    let returnedPayload: any = {
      landingPageLoadingData,
      gradingMethod,
      eventStartEndDates,
      eventName,
      deciderId,
      presentationMode,
      presentationEnable,
      presentationModeOptions
    };

    return res
      .status(200)
      .send(
        createApiResponse<AbstractDeciderLandingPageData[]>(
          null,
          returnedPayload
        )
      );
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// GET - Master List Abstracts
router.get("/master-list/:eventId", async (req, res, next) => {
  const { eventId } = req.params;
  try {
    const { isGradedByScoring, isSingleReviewerRequired } =
      await fetchAbstractConfigData(eventId);
    const abstractResults =
      await AbstractDecidersService.getAbstractsWithReviewResults(
        eventId,
        isSingleReviewerRequired,
        isGradedByScoring
      );
    return res
      .status(200)
      .send(createApiResponse<MasterListAbstract[]>(null, abstractResults));
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// GET - Abstracts Pending for Deciders' Follow-up
router.get(
  "/pending-abstract-final-review/:eventId",
  async (req, res, next) => {
    const { eventId } = req.params;
    try {
      const { isGradedByScoring, isSingleReviewerRequired } =
        await fetchAbstractConfigData(eventId);
      const results =
        await AbstractDecidersService.getPendingAbstractFinalDecisions(
          eventId,
          isSingleReviewerRequired,
          isGradedByScoring
        );
      return res
        .status(200)
        .send(createApiResponse<AbstractForDeciders[]>(null, results));
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

// GET - Abstracts finalized by Deciders
router.get("/finalized-abstracts/:eventId", async (req, res, next) => {
  const { eventId } = req.params;
  try {
    const { isGradedByScoring, isSingleReviewerRequired } =
      await fetchAbstractConfigData(eventId);
    const results =
      await AbstractDecidersService.getSubmittedAbstractFinalDecisions(
        eventId,
        isSingleReviewerRequired,
        isGradedByScoring
      );
    return res
      .status(200)
      .send(createApiResponse<AbstractForDeciders[]>(null, results));
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// POST - Comment to Submitter
router.post(
  "/comment-for-submitter/:eventId/:abstractId/:deciderId",
  async (req, res, next) => {
    const { eventId, abstractId, deciderId } = req.params;
    let deciderComment = req.body;
    deciderComment["eventId"] = eventId;
    deciderComment["abstractId"] = parseInt(abstractId, 10);
    deciderComment["deciderId"] = parseInt(deciderId, 10);
    try {
      await AbstractDecidersService.insertDeciderComment(deciderComment);
      let recipient =
        await AbstractDecidersService.getSubmitterEmailByAbstractIdAndEventId(
          parseInt(abstractId, 10),
          eventId
        );
      let email =
        await AbstractDecidersService.getEmailTemplateContentByEventIdAndScenario(
          eventId,
          "abstractUnderDiscussion"
        );

      let emailContent = await generateUnderDiscussionContent(email.content, recipient, eventId, abstractId);
      let mailOptions = getMailOptions(
        [recipient],
        emailContent,
        email.subject
      );
      await sendEmail(mailOptions);
      await AbstractDecidersService.insertEmailDeliveryLog(
        generateEmailDeliveryLogData(
          eventId,
          parseInt(abstractId, 10),
          mailOptions.from,
          [recipient],
          mailOptions.subject,
          mailOptions.html,
          "system"
        )
      );
      await AbstractDecidersService.markAbstractAsUnderDiscussionWithSubmitter(
        eventId,
        parseInt(abstractId, 10)
      );
      let record: any = {
        eventId,
        abstractId,
        deciderId,
        comments: req.body.comments,
        mailOptions,
      };

      return res.status(200).send(
        createApiResponse<{
          eventId: string;
          abstractId: string;
          deciderId: string;
          comments: string;
          mailOptions: {
            recipient: string[];
            subject: string;
            content: string;
          };
        }>(null, record)
      );
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

// POST - Save Decider Comment Draft
router.post(
  "/decider-draft/:eventId/:abstractId/:deciderId",
  async (req, res, next) => {
    const { eventId, abstractId, deciderId } = req.params;
    let deciderComment = req.body;
    deciderComment["eventId"] = eventId;
    deciderComment["abstractId"] = parseInt(abstractId, 10);
    deciderComment["deciderId"] = parseInt(deciderId, 10);
    try {
      await AbstractDecidersService.insertDeciderComment(deciderComment);
      let record: any = {
        eventId,
        abstractId,
        deciderId,
        comments: req.body.comments,
      };

      await AbstractDecidersService.markIsDraft(
        eventId,
        parseInt(abstractId, 10)
      );

      return res.status(200).send(
        createApiResponse<{
          eventId: string;
          abstractId: string;
          deciderId: string;
          comments: string;
        }>(null, record)
      );
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

// GET - Decider Comment
router.get(
  "/decider-assessment/:eventId/:abstractId",
  async (req, res, next) => {
    const { eventId, abstractId } = req.params;
    try {
      let deciderAssessment =
        await AbstractDecidersService.getDeciderAssessment(
          eventId,
          parseInt(abstractId, 10)
        );

      return res
        .status(200)
        .send(createApiResponse<DeciderAssessment>(null, deciderAssessment));
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

// POST - Submit Decider Rating
router.post(
  "/decider-final-assessment/:eventId/:abstractId/:deciderId",
  async (req, res, next) => {
    const { eventId, abstractId, deciderId } = req.params;
    let deciderRating = req.body;
    deciderRating["eventId"] = eventId;
    deciderRating["abstractId"] = parseInt(abstractId, 10);
    deciderRating["deciderId"] = parseInt(deciderId, 10);
    try {
      await AbstractDecidersService.insertDeciderRating(deciderRating);
      await AbstractDecidersService.markAbstractReviewAsFinalized(
        eventId,
        parseInt(abstractId, 10)
      );
      await AbstractDecidersService.markAbstractFinalResult(
        eventId,
        parseInt(abstractId, 10),
        req.body.rating
      );
      let record: any = {
        eventId,
        rating: req.body.rating,
        abstractId,
        deciderId,
        suggestedPresentationMode: req.body.suggestedPresentationMode,
      };

      let allAbstractsAreFinalized =
        await AbstractDecidersService.areAllAbstractsFinalized(eventId);
      console.log("check allAbstractsAreFinalized, ", allAbstractsAreFinalized);
      if (allAbstractsAreFinalized) {
        let eventAdminContact =
          await AbstractDecidersService.getEventContactPersonEmailById(eventId);
        let eventTopic = await AbstractDecidersService.getEventTopicById(
          eventId
        );
        let subject = `Regarding Result Announcement for the Conference ${eventTopic}`;
        let content = `This is a system generated email.\n\n Abstract reviews for the Conference ${eventTopic} have all been finalized.\n\n Please proceed via admin panel to announce results by email to all submitters.`;
        let mailOptions = getMailOptions([eventAdminContact], content, subject);
        console.log("check mailOptions", mailOptions);
        await sendEmail(mailOptions);
        await AbstractDecidersService.insertEmailDeliveryLog(
          generateEmailDeliveryLogData(
            eventId,
            parseInt(abstractId, 10), // last finalized abstract id
            mailOptions.from,
            mailOptions.to,
            mailOptions.subject,
            mailOptions.html,
            "system"
          )
        );
      }

      return res.status(200).send(
        createApiResponse<{
          eventId: string;
          rating: string;
          abstractId: string;
          deciderId: string;
          suggestedPresentationMode: string;
        }>(null, record)
      );
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

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
        await AbstractDecidersService.getAbstractS3FileKeyById(
          parseInt(abstractId, 10),
          eventId
        );
      let userDefinedFileName =
        await AbstractDecidersService.getAbstractUserFileNameById(
          parseInt(abstractId, 10),
          eventId
        );

      await s3.getSingleFile(abstractS3FileKey, res, userDefinedFileName);
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

export default router;
