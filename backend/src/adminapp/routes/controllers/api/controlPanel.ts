import express, { NextFunction, Request, Response } from "express";
import { requireRole } from "../../middlewares/authn";
import { createApiResponse, RoleLabel, EventAlbumsSummary } from "../../../../models/model";
import { PaginationResult, parsePaginationRequest } from '../../../../utilities/pagination';
import * as controlPanelService from '../../../../services/controlPanel';
import { ApiError } from "../../../../models/error";
import { sendEmail } from '../../../../utilities/email';
import logger from "../../../../utilities/logger";
import { AbstractReviewConfigs, AbstractSubmitters, AbstractTopics, Abstracts, AbstractReviewers, AbstractReviewDeciders, AbstractReviews, AbstractReviewEmailTemplates, AbstractReviewFinalDecisions } from "../../../../repo/eventAbstractReviews";
import { Event } from "../../../../repo/event";
import * as config from '../../../../utilities/config';
import { insertEmailDeliveryLogNew } from '../../../../services/eventAbstractReviews/abstractReviewers';
import { generateEmailDeliveryLogDataNew } from "../../../../utilities/payload";
import multer from 'multer';
const storage = multer.memoryStorage();
const fileUpload = multer({ storage });

const router = express.Router();

router.post('/init', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.body);
    const abstractConfig = await controlPanelService.init(req.session.data.me, req.body?.eventId, res);
    return res.status(200).send(createApiResponse<any>(null, abstractConfig));
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

router.post('/save', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.body);
    const abstractConfig = await controlPanelService.save(req.session.data.me, req.body?.eventId, req.body, res);
    return res.status(200).send(createApiResponse<any>("Update configuration successfully", abstractConfig));
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

router.post('/updateReviewPairing', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.body);
    const abstractReview = await controlPanelService.updateReviewPairing(req.session.data.me, req.body?.abstract.eventId, req.body?.abstract, req.body?.abstractReviewCollection, res);
    return res.status(200).send(createApiResponse<any>("Update Abstract-Reviewer pairing successfully", abstractReview));
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

router.post('/getReviewPairing', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.body);
    const abstractConfig = await controlPanelService.getReviewPairing(req.session.data.me, req.body?.eventId, req.body?.abstractId, res);
    return res.status(200).send(createApiResponse<any>(null, abstractConfig));
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

router.post('/updateReviewPairingBulk', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.body);
    const abstractReview = await controlPanelService.updateReviewPairingBulk(req.session.data.me, req.body?.eventId, req.body?.abstractCollection, res);
    return res.status(200).send(createApiResponse<any>("Update Abstract-Reviewer pairing successfully", abstractReview));
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

router.post('/createTemplate', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.body);
    const newTemplate = await controlPanelService.createTemplate(req.session.data.me, req.body?.eventId, req.body?.emailSubject, req.body?.emailDescription, req.body?.emailBcc, res);
    return res.status(200).send(createApiResponse<any>("Create Template successfully.", newTemplate));
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

router.post('/updateTemplate', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.body);
    const updatedTemplate = await controlPanelService.updateTemplate(req.session.data.me, req.body?.eventId, req.body?.emailId, req.body?.emailSubject, req.body?.emailDescription, req.body?.emailBcc, res);
    return res.status(200).send(createApiResponse<any>("Update Template successfully.", updatedTemplate));
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

router.post('/deleteTemplate', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.body);
    const deleteTemplate = await controlPanelService.deleteTemplate(req.session.data.me, req.body?.eventId, req.body?.id, res);
    return res.status(200).send(createApiResponse<any>("Delete Template successfully.", deleteTemplate));
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

router.post("/sendEmail", requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log(req.body);
      const id: string = parseStringInput(req.body.id);
      const emailTemplate = await AbstractReviewEmailTemplates.findOne({ where: { id: req.body.emailId } });
      if (!emailTemplate) { return next(new ApiError("Cannot find corresponding email template")); }

      const eventId: string = parseStringInput(req.body.eventId);
      const event = await Event.findOne({ where: { id: eventId } });
      if (!event) { return next(new ApiError("Cannot find corresponding event")); }

      const abstractConfig = await AbstractReviewConfigs.findOne({ where: { eventId: eventId } });

      const rowSelection: string[] = req?.body?.selectedRow;
      if (rowSelection?.length < 1) { return next(new ApiError("No Receipant is selected")); }

      for (const rowId of rowSelection) {
        let participant;
        let abstractFinalDecision;
        let abstract = await Abstracts.findOne({ where: { id: rowId } });
        if (req.body.emailGroup === "Review Coordinator") {
          participant = await AbstractReviewDeciders.findOne({ where: { id: rowId } });
        }

        else if (req.body.emailGroup === "Reviewer") {
          participant = await AbstractReviewers.findOne({ where: { id: rowId } });
        }

        else if (req.body.emailGroup === "Submitter") {
          abstractFinalDecision = await AbstractReviewFinalDecisions.findOne({ where: { abstractId: abstract?.id } });
          participant = await AbstractSubmitters.findOne({ where: { id: abstract?.submitterId } });
        }

        let bccEmail;

        if (emailTemplate?.bcc === '' || emailTemplate?.bcc === null) {
          bccEmail = [event?.contactEmail];
        }

        else {
          bccEmail = emailTemplate.bcc.split(";");
        }

        const mailOptions = {
          from: 'cems-noreply@polyu.edu.hk',
          to: participant?.email,
          bcc: bccEmail,
          subject: emailTemplate?.subject?.replaceAll('[%abstractId%]', abstract?.id?.toString()),
          text: emailTemplate?.subject?.replaceAll('[%abstractId%]', abstract?.id?.toString()),
          html: '<p>' + emailTemplate?.content
            .replace(/<p><br><\/p>/g, '<br>')
            .replace(/<\/p>/g, '<br>')
            .replace(/<p>/g, '')
            //replace with review coordinator placeholder
            ?.replaceAll('[%chairmanTitle%]', participant?.title)
            ?.replaceAll('[%chairmanFirstname%]', participant?.firstName)
            ?.replaceAll('[%chairmanLastname%]', participant?.lastName)
            ?.replaceAll('[%chairmanPosition%]', participant?.position)
            ?.replaceAll('[%chairmanOrganization%]', participant?.institution)
            ?.replaceAll('[%chairmanDept%]', participant?.department)
            ?.replaceAll('[%chairmanUrl%]', `<a href="${config.APP_AMS_DECIDER_URL}/decider-panel/${eventId}/abstracts-masterlist" alt="Review Coordinator Link">Review Coordinator View Url</a>`)
            //replace with reviewer placeholder
            ?.replaceAll('[%reviewerTitle%]', participant?.title)
            ?.replaceAll('[%reviewerFirstname%]', participant?.firstName)
            ?.replaceAll('[%reviewerLastname%]', participant?.lastName)
            ?.replaceAll('[%reviewerPosition%]', participant?.position)
            ?.replaceAll('[%reviewerOrganization%]', participant?.institution)
            ?.replaceAll('[%reviewerDept%]', participant?.department)
            ?.replaceAll('[%reviewUrl%]', `<a href="${config.APP_AMS_URL}/reviewer-panel/${eventId}" alt="Reviewer link">Reviewer View Url</a>`)
            //replace with submitter placeholder
            ?.replaceAll('[%title%]', participant?.title)
            ?.replaceAll('[%firstname%]', participant?.firstName)
            ?.replaceAll('[%lastname%]', participant?.lastName)
            ?.replaceAll('[%position%]', participant?.position)
            ?.replaceAll('[%organization%]', participant?.institution)
            ?.replaceAll('[%dept%]', participant?.department)
            ?.replaceAll('[%paperSubmissionLink%]', `<a href="${config.APP_USER_URL}/paper-submission/${eventId}/${rowId}?id=1" alt="Paper Submission Link">Paper Submission Url</a>`)
            //replace with event placeholder
            ?.replaceAll('[%event%]', event.topic)
            ?.replaceAll('[%eventEmail%]', event.contactEmail)
            //replace with abstract placeholder
            ?.replaceAll('[%abstractId%]', abstract?.id?.toString())
            ?.replaceAll('[%abstractTitle%]', abstract?.title)
            //replace with abstract Review placeholder
            ?.replaceAll('[%result%]', abstractFinalDecision?.grades)
            ?.replaceAll('[%comment%]', abstractFinalDecision?.comments)
            ?.replaceAll('[%discussionUrl%]', `<a href="${config.APP_USER_URL}/under-discussion/${eventId}/${rowId}?id=1" alt="Under Discussion Link">Under Discussion Url</a>`)
            ?.replaceAll('[%endorseUrl%]', `<a href="${config.APP_USER_URL}/endorse-comment/${eventId}/${rowId}?id=1" alt="Endorse Comment Link">Endorse Comment Url</a>`)
            ?.replaceAll('[%abstractSubmissionUrl%]', `<a href="${config.APP_USER_URL}/abstract-submission?id=${abstractConfig.id}&eventId=${eventId}" alt="Endorse Comment Link">Endorse Comment Url</a>`)
            ?.replaceAll('[%preScreenFailComment%]', abstract?.preScreeningComment)
            ?.replaceAll('[%suggestedPresentationMode%]', abstractFinalDecision?.suggestedPresentationMode)
            + '</p>'
        };
        await sendEmail(mailOptions);

        if (emailTemplate.scenario === "resultReleaseSuccess" || emailTemplate.scenario === "resultReleaseFail") {
          abstract.isSubmitterNotified = true;
          await abstract.save();
        }

        await insertEmailDeliveryLogNew(
          generateEmailDeliveryLogDataNew(
            eventId,
            parseInt(rowId, 10),
            'cems-noreply@polyu.edu.hk',
            [participant?.email],
            mailOptions.subject,
            mailOptions.html,
            "system",
            emailTemplate.id,
            bccEmail
          )
        );
      }

      return res.status(200).send(createApiResponse<void>("Email Sent", null));
    } catch (err) {
      return next(err);
    }
  }
);

function parseStringInput(input: any): string {
  if (!input) {
    return null;
  }

  return String(input);
}

router.post('/exportAbstractRecord', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.body);
    const abstractRecord = await controlPanelService.exportAbstractRecord(req.session.data.me, req.body?.eventId, res);
    return res.status(200).send(createApiResponse<any>(null, abstractRecord));
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

//upload new files
router.post('/uploadFile', fileUpload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const abstractId = JSON.parse(req.query.abstractId as string);
    const createFileResponse = await controlPanelService.uploadFile(req.session.data.me, abstractId, req.file);
    return res.status(200).send(createApiResponse<any>('File Upload successfully', ''));
  } catch (err) {
    return next(err);
  }
});

export default router;