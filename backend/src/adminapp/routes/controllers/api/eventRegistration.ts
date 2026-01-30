import express, { NextFunction, Request, Response } from "express";
import { requireRole } from "../../middlewares/authn";
import {
  createApiResponse,
  EventSummary,
  EventRegistrationSummary,
  RoleLabel,
} from "../../../../models/model";
import * as EventService from "../../../../services/event";
import * as EventRegistrationService from "../../../../services/eventRegistration";
import * as EventRegistrationFormSessionService from "../../../../services/eventRegistrationFormSession";
import * as CustomPaymentEventService from "../../../../services/customPaymentEvent";
import logger from "../../../../utilities/logger";
import { ApiError } from "../../../../models/error";
import {
  parseIsoDateTime,
  parseLocalDateTime,
} from "../../../../utilities/date";
import { EventAttributes } from "../../../../repo/event";
import { EventRegistrationAttributes } from "../../../../repo/eventRegistration";
import { EventRegistrationFormSession } from "../../../../repo/eventRegistrationFormSession";
import { CustomPaymentEvent, CustomPaymentEventAttributes } from "../../../../repo/customPaymentEvent";
import * as AuthnService from "../../../../services/authn";

const router = express.Router();

router.post("/search", requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]),
  async (req: Request, res: Response, next: NextFunction) => {
    // TODO: Search by department deptAbbr
    try {
      const id: string = parseStringInput(req.body.id);
      const eventId: string = parseStringInput(req.body.eventId);
      const topic: string = parseStringInput(req.body.topic);
      const subtopic: string = parseStringInput(req.body.subtopic);
      const start = parseIsoDateTime(String(req.body.start));
      const earlyBirdEnd = parseIsoDateTime(String(req.body.earlyBirdEnd));
      const end = parseIsoDateTime(String(req.body.end));

      const containPosition: string = parseStringInput(req.body.containPosition);
      const containInstitution: string = parseStringInput(req.body.containInstitution);
      const containDept: string = parseStringInput(req.body.containDept);
      const containAddress: string = parseStringInput(req.body.containAddress);
      const containCountry: string = parseStringInput(req.body.containCountry);
      const containOfficePhoneNumber: string = parseStringInput(req.body.containOfficePhoneNumber);
      const containMobilePhoneNumber: string = parseStringInput(req.body.containMobilePhoneNumber);

      const containPayment: boolean = !!req.body.containPayment;
      const sendEmail: boolean = !!req.body.sendEmail;

      const events = await EventRegistrationService.search(
        req.session.data.me,
        {
          id,
          eventId,
          topic,
          subtopic,
          start,
          earlyBirdEnd,
          end,
          containPosition,
          containInstitution,
          containDept,
          containAddress,
          containCountry,
          containOfficePhoneNumber,
          containMobilePhoneNumber,
          containPayment,
          sendEmail,
        }
      );
      return res
        .status(200)
        .send(createApiResponse<EventRegistrationSummary[]>(null, events));
    } catch (err) {
      return next(err);
    }
  }
);

router.post("/create", requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const eventId: string = parseStringInput(req.body.eventId);
      const topic: string = parseStringInput(req.body.topic);
      const subtopic: string = parseStringInput(req.body.subtopic);
      const start = parseIsoDateTime(String(req.body.start));
      const end = parseIsoDateTime(String(req.body.end));
      const description: string = parseStringInput(req.body.description);
      const acceptAnyone: boolean = !!req.body.acceptAnyone;
      const acceptAlumni: boolean = !!req.body.acceptAlumni;
      const acceptStudent: boolean = !!req.body.acceptStudent;
      const acceptStaff: boolean = !!req.body.acceptStaff;
      const acceptGuest: boolean = !!req.body.acceptGuest;

      const banner: Buffer = !!req.body.banner ? Buffer.from(req.body.banner, "utf8") : null;
      const bannerAltText: string = parseStringInput(req.body.bannerAltText);
      const bannerHyperlink: string = parseStringInput(req.body.bannerHyperlink);

      const pics: string = parseStringInput(req.body.pics);
      const picsAcceptBox: boolean = !!req.body.picsAcceptBox;
      const picsAcceptBoxMsg: string = parseStringInput(req.body.picsAcceptBoxMsg);
      const marketingAcceptBox: boolean = !!req.body.marketingAcceptBox;
      const marketingAcceptBoxMsg: string = parseStringInput(req.body.marketingAcceptBoxMsg);

      const containPosition: string = parseStringInput(req.body.containPosition);
      const containInstitution: string = parseStringInput(req.body.containInstitution);
      const containDept: string = parseStringInput(req.body.containDept);
      const containAddress: string = parseStringInput(req.body.containAddress);
      const containCountry: string = parseStringInput(req.body.containCountry);
      const containOfficePhoneNumber: string = parseStringInput(req.body.containOfficePhoneNumber);
      const containMobilePhoneNumber: string = parseStringInput(req.body.containMobilePhoneNumber);
      const containAttachment: string = parseStringInput(req.body.containAttachment);

      const containPayment: boolean = !!req.body.containPayment;
      const paymentCode: string = parseStringInput(req.body.paymentCode);
      const earlyBirdEnd = parseIsoDateTime(String(req.body.earlyBirdEnd));
      const limitItemCount: boolean = !!req.body.isItemCountLimit;
      const minItemCount: number = parseNumericInput(req.body.minItemCount);
      const maxItemCount: number = parseNumericInput(req.body.maxItemCount);
      const containPaymentTitle1: boolean = !!req.body.containPaymentTitle1;
      const paymentTitle1: string = parseStringInput(req.body.paymentTitle1);
      const paymentTitle1Price: number = parseNumericInput(req.body.paymentTitle1Price);
      const paymentTitle1Price_EB: number = parseNumericInput(req.body.paymentTitle1Price_EB);
      const containPaymentTitle2: boolean = !!req.body.containPaymentTitle2;
      const paymentTitle2: string = parseStringInput(req.body.paymentTitle2);
      const paymentTitle2Price: number = parseNumericInput(req.body.paymentTitle2Price);
      const paymentTitle2Price_EB: number = parseNumericInput(req.body.paymentTitle2Price_EB);
      const containPaymentTitle3: boolean = !!req.body.containPaymentTitle3;
      const paymentTitle3: string = parseStringInput(req.body.paymentTitle3);
      const paymentTitle3Price: number = parseNumericInput(req.body.paymentTitle3Price);
      const paymentTitle3Price_EB: number = parseNumericInput(req.body.paymentTitle3Price_EB);
      const containPaymentTitle4: boolean = !!req.body.containPaymentTitle4;
      const paymentTitle4: string = parseStringInput(req.body.paymentTitle4);
      const paymentTitle4Price: number = parseNumericInput(req.body.paymentTitle4Price);
      const paymentTitle4Price_EB: number = parseNumericInput(req.body.paymentTitle4Price_EB);
      const containPaymentTitle5: boolean = !!req.body.containPaymentTitle5;
      const paymentTitle5: string = parseStringInput(req.body.paymentTitle5);
      const paymentTitle5Price: number = parseNumericInput(req.body.paymentTitle5Price);
      const paymentTitle5Price_EB: number = parseNumericInput(req.body.paymentTitle5Price_EB);
      const containPaymentTitle6: boolean = !!req.body.containPaymentTitle6;
      const paymentTitle6: string = parseStringInput(req.body.paymentTitle6);
      const paymentTitle6Price: number = parseNumericInput(req.body.paymentTitle6Price);
      const paymentTitle6Price_EB: number = parseNumericInput(req.body.paymentTitle6Price_EB);
      const containPaymentTitle7: boolean = !!req.body.containPaymentTitle7;
      const paymentTitle7: string = parseStringInput(req.body.paymentTitle7);
      const paymentTitle7Price: number = parseNumericInput(req.body.paymentTitle7Price);
      const paymentTitle7Price_EB: number = parseNumericInput(req.body.paymentTitle7Price_EB);
      const containPaymentTitle8: boolean = !!req.body.containPaymentTitle8;
      const paymentTitle8: string = parseStringInput(req.body.paymentTitle8);
      const paymentTitle8Price: number = parseNumericInput(req.body.paymentTitle8Price);
      const paymentTitle8Price_EB: number = parseNumericInput(req.body.paymentTitle8Price_EB);
      const containPaymentTitle9: boolean = !!req.body.containPaymentTitle9;
      const paymentTitle9: string = parseStringInput(req.body.paymentTitle9);
      const paymentTitle9Price: number = parseNumericInput(req.body.paymentTitle9Price);
      const paymentTitle9Price_EB: number = parseNumericInput(req.body.paymentTitle9Price_EB);
      const containPaymentTitle10: boolean = !!req.body.containPaymentTitle10;
      const paymentTitle10: string = parseStringInput(req.body.paymentTitle10);
      const paymentTitle10Price: number = parseNumericInput(req.body.paymentTitle10Price);
      const paymentTitle10Price_EB: number = parseNumericInput(req.body.paymentTitle10Price_EB);
      const paymentTitle1Mandatory: boolean = !!req.body.paymentTitle1Mandatory;
      const paymentTitle2Mandatory: boolean = !!req.body.paymentTitle2Mandatory;
      const paymentTitle3Mandatory: boolean = !!req.body.paymentTitle3Mandatory;
      const paymentTitle4Mandatory: boolean = !!req.body.paymentTitle4Mandatory;
      const paymentTitle5Mandatory: boolean = !!req.body.paymentTitle5Mandatory;
      const paymentTitle6Mandatory: boolean = !!req.body.paymentTitle6Mandatory;
      const paymentTitle7Mandatory: boolean = !!req.body.paymentTitle7Mandatory;
      const paymentTitle8Mandatory: boolean = !!req.body.paymentTitle8Mandatory;
      const paymentTitle9Mandatory: boolean = !!req.body.paymentTitle9Mandatory;
      const paymentTitle10Mandatory: boolean = !!req.body.paymentTitle10Mandatory;

      const paymentTitle1QuantityEnable: boolean = !!req.body.paymentTitle1QuantityEnable;
      const paymentTitle2QuantityEnable: boolean = !!req.body.paymentTitle2QuantityEnable;
      const paymentTitle3QuantityEnable: boolean = !!req.body.paymentTitle3QuantityEnable;
      const paymentTitle4QuantityEnable: boolean = !!req.body.paymentTitle4QuantityEnable;
      const paymentTitle5QuantityEnable: boolean = !!req.body.paymentTitle5QuantityEnable;
      const paymentTitle6QuantityEnable: boolean = !!req.body.paymentTitle6QuantityEnable;
      const paymentTitle7QuantityEnable: boolean = !!req.body.paymentTitle7QuantityEnable;
      const paymentTitle8QuantityEnable: boolean = !!req.body.paymentTitle8QuantityEnable;
      const paymentTitle9QuantityEnable: boolean = !!req.body.paymentTitle9QuantityEnable;
      const paymentTitle10QuantityEnable: boolean = !!req.body.paymentTitle10QuantityEnable;

      const selectedSessions = JSON.parse(parseStringInput(req.body.selectedSessions));
      const mandatorySessions = JSON.parse(parseStringInput(req.body.mandatorySessions)); 

      const customQuestions: string = parseStringInput(req.body.customQuestions);

      const successfulMsgtoReg: string = parseStringInput(req.body.successfulMsgtoReg);
      const successfulMsgtoWaitingList: string = parseStringInput(req.body.successfulMsgtoWaitingList);
      const sendEmail: boolean = !!req.body.sendEmail;
      const emailFrom: string = parseStringInput(req.body.emailFrom);
      const emailBcc: string = parseStringInput(req.body.emailBcc);
      const emailSubjectSuccessfulReg: string = parseStringInput(req.body.emailSubjectSuccessfulReg);
      const emailDetailsSuccessfulReg: string = parseStringInput(req.body.emailDetailsSuccessfulReg);
      const emailSubjectSuccessfulWaiting: string = parseStringInput(req.body.emailSubjectSuccessfulWaiting);
      const emailDetailsSuccessfulWaiting: string = parseStringInput(req.body.emailDetailsSuccessfulWaiting);

      const isSessionCountLimit: boolean = !!req.body.isSessionCountLimit;
      const minSessionCount: number = parseNumericInput(req.body.minSessionCount);
      const maxSessionCount: number = parseNumericInput(req.body.maxSessionCount);

      const err_msg_userType: string = parseStringInput(req.body.err_msg_userType);
      const err_msg_quotaExceed: string = parseStringInput(req.body.err_msg_quotaExceed);

      if (!topic) { return next(new ApiError("Missing Event Registration Form Topic.")); }
      if (!subtopic) { return next(new ApiError("Missing Event Registration Form Subtopic.")); }
      if (start === null) { return next(new ApiError("Start time must be in ISO8601 format")); }
      // if (earlyBirdEnd === null) { return next(new ApiError("Early Bird End time must be in ISO8601 format")); }
      if (end === null) { return next(new ApiError("End time must be in ISO8601 format")); }

      const eventRegistration = await EventRegistrationService.create(
        req.session.data.me,
        eventId,
        topic,
        subtopic,
        start,
        end,
        description,
        acceptAnyone,
        acceptAlumni,
        acceptStudent,
        acceptStaff,
        acceptGuest,
        banner,
        bannerAltText,
        bannerHyperlink,
        pics,
        picsAcceptBox,
        picsAcceptBoxMsg,
        marketingAcceptBox,
        marketingAcceptBoxMsg,
        containPosition,
        containInstitution,
        containDept,
        containAddress,
        containCountry,
        containOfficePhoneNumber,
        containMobilePhoneNumber,
        containAttachment,
        containPayment,
        paymentCode,
        earlyBirdEnd,
        containPaymentTitle1,
        paymentTitle1,
        paymentTitle1Price,
        paymentTitle1Price_EB,
        containPaymentTitle2,
        paymentTitle2,
        paymentTitle2Price,
        paymentTitle2Price_EB,
        containPaymentTitle3,
        paymentTitle3,
        paymentTitle3Price,
        paymentTitle3Price_EB,
        containPaymentTitle4,
        paymentTitle4,
        paymentTitle4Price,
        paymentTitle4Price_EB,
        containPaymentTitle5,
        paymentTitle5,
        paymentTitle5Price,
        paymentTitle5Price_EB,
        containPaymentTitle6,
        paymentTitle6,
        paymentTitle6Price,
        paymentTitle6Price_EB,
        containPaymentTitle7,
        paymentTitle7,
        paymentTitle7Price,
        paymentTitle7Price_EB,
        containPaymentTitle8,
        paymentTitle8,
        paymentTitle8Price,
        paymentTitle8Price_EB,
        containPaymentTitle9,
        paymentTitle9,
        paymentTitle9Price,
        paymentTitle9Price_EB,
        containPaymentTitle10,
        paymentTitle10,
        paymentTitle10Price,
        paymentTitle10Price_EB,
        paymentTitle1Mandatory,
        paymentTitle2Mandatory,
        paymentTitle3Mandatory,
        paymentTitle4Mandatory,
        paymentTitle5Mandatory,
        paymentTitle6Mandatory,
        paymentTitle7Mandatory,
        paymentTitle8Mandatory,
        paymentTitle9Mandatory,
        paymentTitle10Mandatory,
        customQuestions,
        successfulMsgtoReg,
        successfulMsgtoWaitingList,
        sendEmail,
        emailFrom,
        emailBcc,
        emailSubjectSuccessfulReg,
        emailDetailsSuccessfulReg,
        emailSubjectSuccessfulWaiting,
        emailDetailsSuccessfulWaiting,
        err_msg_userType,
        err_msg_quotaExceed,
        limitItemCount,
        minItemCount,
        maxItemCount,
        paymentTitle1QuantityEnable,
        paymentTitle2QuantityEnable,
        paymentTitle3QuantityEnable,
        paymentTitle4QuantityEnable,
        paymentTitle5QuantityEnable,
        paymentTitle6QuantityEnable,
        paymentTitle7QuantityEnable,
        paymentTitle8QuantityEnable,
        paymentTitle9QuantityEnable,
        paymentTitle10QuantityEnable,
        isSessionCountLimit,
        minSessionCount,
        maxSessionCount
      );

      // Create mapping to regulate Session Display
      for (const session of selectedSessions) {
        const mandatory = mandatorySessions?.some((mandSession: { id: any; }) => mandSession.id === session?.id)? true : false;
        await EventRegistrationFormSessionService.create(
          req.session.data.me,
          eventId,
          eventRegistration?.id,
          session?.id,
          mandatory,
        )
      }

      // Refresh Session Data, especially me
      req.session.data.me = await AuthnService.getMeSummary(
        req.session.data.me.netId
      );

      return res.status(200).send(
        createApiResponse<any>(null,
          {
            id: eventRegistration.id,
            eventId: eventRegistration.eventId,
            disabled: eventRegistration.disabled,
            topic: eventRegistration.topic,
            subtopic: eventRegistration.subtopic,
            start: eventRegistration.start,
            end: eventRegistration.end,
            description: eventRegistration.description,
            acceptAnyone: eventRegistration.acceptAnyone,
            acceptAlumni: eventRegistration.acceptAlumni,
            acceptStudent: eventRegistration.acceptStudent,
            acceptStaff: eventRegistration.acceptStaff,
            acceptGuest: eventRegistration.acceptGuest,
            banner: eventRegistration?.banner?.toString("utf8"),
            bannerAltText: eventRegistration.bannerAltText,
            bannerHyperlink: eventRegistration.bannerHyperlink,
            pics: eventRegistration.pics,
            picsAcceptBox: eventRegistration.picsAcceptBox,
            picsAcceptBoxMsg: eventRegistration.picsAcceptBoxMsg,
            marketingAcceptBox: eventRegistration.marketingAcceptBox,
            marketingAcceptBoxMsg: eventRegistration.marketingAcceptBoxMsg,
            containPosition: eventRegistration.containPosition,
            containInstitution: eventRegistration.containInstitution,
            containDept: eventRegistration.containDept,
            containAddress: eventRegistration.containAddress,
            containCountry: eventRegistration.containCountry,
            containOfficePhoneNumber: eventRegistration.containOfficePhoneNumber,
            containMobilePhoneNumber: eventRegistration.containMobilePhoneNumber,
            containAttachment: eventRegistration.containAttachment,
            containPayment: eventRegistration.containPayment,
            paymentCode: eventRegistration.paymentCode,
            earlyBirdEnd: eventRegistration.earlyBirdEnd,
            containPaymentTitle1: eventRegistration.containPaymentTitle1,
            paymentTitle1: eventRegistration.paymentTitle1,
            paymentTitle1Price: eventRegistration.paymentTitle1Price,
            paymentTitle1Price_EB: eventRegistration.paymentTitle1Price_EB,
            containPaymentTitle2: eventRegistration.containPaymentTitle2,
            paymentTitle2: eventRegistration.paymentTitle2,
            paymentTitle2Price: eventRegistration.paymentTitle2Price,
            paymentTitle2Price_EB: eventRegistration.paymentTitle2Price_EB,
            containPaymentTitle3: eventRegistration.containPaymentTitle3,
            paymentTitle3: eventRegistration.paymentTitle3,
            paymentTitle3Price: eventRegistration.paymentTitle3Price,
            paymentTitle3Price_EB: eventRegistration.paymentTitle3Price_EB,
            containPaymentTitle4: eventRegistration.containPaymentTitle4,
            paymentTitle4: eventRegistration.paymentTitle4,
            paymentTitle4Price: eventRegistration.paymentTitle4Price,
            paymentTitle4Price_EB: eventRegistration.paymentTitle4Price_EB,
            containPaymentTitle5: eventRegistration.containPaymentTitle5,
            paymentTitle5: eventRegistration.paymentTitle5,
            paymentTitle5Price: eventRegistration.paymentTitle5Price,
            paymentTitle5Price_EB: eventRegistration.paymentTitle5Price_EB,
            containPaymentTitle6: eventRegistration.containPaymentTitle6,
            paymentTitle6: eventRegistration.paymentTitle6,
            paymentTitle6Price: eventRegistration.paymentTitle6Price,
            paymentTitle6Price_EB: eventRegistration.paymentTitle6Price_EB,
            containPaymentTitle7: eventRegistration.containPaymentTitle7,
            paymentTitle7: eventRegistration.paymentTitle7,
            paymentTitle7Price: eventRegistration.paymentTitle7Price,
            paymentTitle7Price_EB: eventRegistration.paymentTitle7Price_EB,
            containPaymentTitle8: eventRegistration.containPaymentTitle8,
            paymentTitle8: eventRegistration.paymentTitle8,
            paymentTitle8Price: eventRegistration.paymentTitle8Price,
            paymentTitle8Price_EB: eventRegistration.paymentTitle8Price_EB,
            containPaymentTitle9: eventRegistration.containPaymentTitle9,
            paymentTitle9: eventRegistration.paymentTitle9,
            paymentTitle9Price: eventRegistration.paymentTitle9Price,
            paymentTitle9Price_EB: eventRegistration.paymentTitle9Price_EB,
            containPaymentTitle10: eventRegistration.containPaymentTitle10,
            paymentTitle10: eventRegistration.paymentTitle10,
            paymentTitle10Price: eventRegistration.paymentTitle10Price,
            paymentTitle10Price_EB: eventRegistration.paymentTitle10Price_EB,
            paymentTitle1Mandatory: eventRegistration.paymentTitle1Mandatory,
            paymentTitle2Mandatory: eventRegistration.paymentTitle2Mandatory,
            paymentTitle3Mandatory: eventRegistration.paymentTitle3Mandatory,
            paymentTitle4Mandatory: eventRegistration.paymentTitle4Mandatory,
            paymentTitle5Mandatory: eventRegistration.paymentTitle5Mandatory,
            paymentTitle6Mandatory: eventRegistration.paymentTitle6Mandatory,
            paymentTitle7Mandatory: eventRegistration.paymentTitle7Mandatory,
            paymentTitle8Mandatory: eventRegistration.paymentTitle8Mandatory,
            paymentTitle9Mandatory: eventRegistration.paymentTitle9Mandatory,
            paymentTitle10Mandatory: eventRegistration.paymentTitle10Mandatory,
            customQuestions: eventRegistration.customQuestions,
            successfulMsgtoReg: eventRegistration.successfulMsgtoReg,
            successfulMsgtoWaitingList: eventRegistration.successfulMsgtoWaitingList,
            sendEmail: eventRegistration.sendEmail,
            emailFrom: eventRegistration.emailFrom,
            emailBcc: eventRegistration.emailBcc,
            emailSubjectSuccessfulReg: eventRegistration.emailSubjectSuccessfulReg,
            emailDetailsSuccessfulReg: eventRegistration.emailDetailsSuccessfulReg,
            emailSubjectSuccessfulWaiting: eventRegistration.emailSubjectSuccessfulWaiting,
            emailDetailsSuccessfulWaiting: eventRegistration.emailDetailsSuccessfulWaiting,
            err_msg_userType: eventRegistration.err_msg_userType,
            err_msg_quotaExceed: eventRegistration.err_msg_quotaExceed,
            limitItemCount: eventRegistration.limitItemCount,
            minItemCount: eventRegistration.minItemCount,
            maxItemCount: eventRegistration.maxItemCount,
            updatedBy: eventRegistration.updatedBy,
          },
        )
      );
    } catch (err) {
      return next(err);
    }
  }
);

router.post('/modify', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id: string = parseStringInput(req.body.id);
    const eventId: string = parseStringInput(req.body.eventId);
    const topic: string = parseStringInput(req.body.topic);
    const subtopic: string = parseStringInput(req.body.subtopic);
    const start = parseIsoDateTime(String(req.body.start));
    const end = parseIsoDateTime(String(req.body.end));
    const description: string = parseStringInput(req.body.description);
    const acceptAnyone: boolean = !!req.body.acceptAnyone;
    const acceptAlumni: boolean = !!req.body.acceptAlumni;
    const acceptStudent: boolean = !!req.body.acceptStudent;
    const acceptStaff: boolean = !!req.body.acceptStaff;
    const acceptGuest: boolean = !!req.body.acceptGuest;

    const banner: Buffer = !!req.body.banner ? Buffer.from(req.body.banner, "utf8") : null;
    // console.log(banner)
    const bannerAltText: string = parseStringInput(req.body.bannerAltText);
    const bannerHyperlink: string = parseStringInput(req.body.bannerHyperlink);

    const pics: string = parseStringInput(req.body.pics);
    const picsAcceptBox: boolean = !!req.body.picsAcceptBox;
    const picsAcceptBoxMsg: string = parseStringInput(req.body.picsAcceptBoxMsg);
    const marketingAcceptBox: boolean = !!req.body.marketingAcceptBox;
    const marketingAcceptBoxMsg: string = parseStringInput(req.body.marketingAcceptBoxMsg);

    const containPosition: string = parseStringInput(req.body.containPosition);
    const containInstitution: string = parseStringInput(req.body.containInstitution);
    const containDept: string = parseStringInput(req.body.containDept);
    const containAddress: string = parseStringInput(req.body.containAddress);
    const containCountry: string = parseStringInput(req.body.containCountry);
    const containOfficePhoneNumber: string = parseStringInput(req.body.containOfficePhoneNumber);
    const containMobilePhoneNumber: string = parseStringInput(req.body.containMobilePhoneNumber);
    const containAttachment: string = parseStringInput(req.body.containAttachment);

    const containPayment: boolean = !!req.body.containPayment;
    const paymentCode: string = parseStringInput(req.body.paymentCode);
    const earlyBirdEnd = parseIsoDateTime(String(req.body.earlyBirdEnd));
    const limitItemCount: boolean = !!req.body.isItemCountLimit;
    const minItemCount: number = parseNumericInput(req.body.minItemCount);
    const maxItemCount: number = parseNumericInput(req.body.maxItemCount);
    const containPaymentTitle1: boolean = !!req.body.containPaymentTitle1;
    const paymentTitle1: string = parseStringInput(req.body.paymentTitle1);
    const paymentTitle1Price: number = parseNumericInput(req.body.paymentTitle1Price);
    const paymentTitle1Price_EB: number = parseNumericInput(req.body.paymentTitle1Price_EB);
    const containPaymentTitle2: boolean = !!req.body.containPaymentTitle2;
    const paymentTitle2: string = parseStringInput(req.body.paymentTitle2);
    const paymentTitle2Price: number = parseNumericInput(req.body.paymentTitle2Price);
    const paymentTitle2Price_EB: number = parseNumericInput(req.body.paymentTitle2Price_EB);
    const containPaymentTitle3: boolean = !!req.body.containPaymentTitle3;
    const paymentTitle3: string = parseStringInput(req.body.paymentTitle3);
    const paymentTitle3Price: number = parseNumericInput(req.body.paymentTitle3Price);
    const paymentTitle3Price_EB: number = parseNumericInput(req.body.paymentTitle3Price_EB);
    const containPaymentTitle4: boolean = !!req.body.containPaymentTitle4;
    const paymentTitle4: string = parseStringInput(req.body.paymentTitle4);
    const paymentTitle4Price: number = parseNumericInput(req.body.paymentTitle4Price);
    const paymentTitle4Price_EB: number = parseNumericInput(req.body.paymentTitle4Price_EB);
    const containPaymentTitle5: boolean = !!req.body.containPaymentTitle5;
    const paymentTitle5: string = parseStringInput(req.body.paymentTitle5);
    const paymentTitle5Price: number = parseNumericInput(req.body.paymentTitle5Price);
    const paymentTitle5Price_EB: number = parseNumericInput(req.body.paymentTitle5Price_EB);
    const containPaymentTitle6: boolean = !!req.body.containPaymentTitle6;
    const paymentTitle6: string = parseStringInput(req.body.paymentTitle6);
    const paymentTitle6Price: number = parseNumericInput(req.body.paymentTitle6Price);
    const paymentTitle6Price_EB: number = parseNumericInput(req.body.paymentTitle6Price_EB);
    const containPaymentTitle7: boolean = !!req.body.containPaymentTitle7;
    const paymentTitle7: string = parseStringInput(req.body.paymentTitle7);
    const paymentTitle7Price: number = parseNumericInput(req.body.paymentTitle7Price);
    const paymentTitle7Price_EB: number = parseNumericInput(req.body.paymentTitle7Price_EB);
    const containPaymentTitle8: boolean = !!req.body.containPaymentTitle8;
    const paymentTitle8: string = parseStringInput(req.body.paymentTitle8);
    const paymentTitle8Price: number = parseNumericInput(req.body.paymentTitle8Price);
    const paymentTitle8Price_EB: number = parseNumericInput(req.body.paymentTitle8Price_EB);
    const containPaymentTitle9: boolean = !!req.body.containPaymentTitle9;
    const paymentTitle9: string = parseStringInput(req.body.paymentTitle9);
    const paymentTitle9Price: number = parseNumericInput(req.body.paymentTitle9Price);
    const paymentTitle9Price_EB: number = parseNumericInput(req.body.paymentTitle9Price_EB);
    const containPaymentTitle10: boolean = !!req.body.containPaymentTitle10;
    const paymentTitle10: string = parseStringInput(req.body.paymentTitle10);
    const paymentTitle10Price: number = parseNumericInput(req.body.paymentTitle10Price);
    const paymentTitle10Price_EB: number = parseNumericInput(req.body.paymentTitle10Price_EB);

    const paymentTitle1Mandatory: boolean = !!req.body.paymentTitle1Mandatory;
    const paymentTitle2Mandatory: boolean = !!req.body.paymentTitle2Mandatory;
    const paymentTitle3Mandatory: boolean = !!req.body.paymentTitle3Mandatory;
    const paymentTitle4Mandatory: boolean = !!req.body.paymentTitle4Mandatory;
    const paymentTitle5Mandatory: boolean = !!req.body.paymentTitle5Mandatory;
    const paymentTitle6Mandatory: boolean = !!req.body.paymentTitle6Mandatory;
    const paymentTitle7Mandatory: boolean = !!req.body.paymentTitle7Mandatory;
    const paymentTitle8Mandatory: boolean = !!req.body.paymentTitle8Mandatory;
    const paymentTitle9Mandatory: boolean = !!req.body.paymentTitle9Mandatory;
    const paymentTitle10Mandatory: boolean = !!req.body.paymentTitle10Mandatory;

    const paymentTitle1QuantityEnable: boolean = !!req.body.paymentTitle1QuantityEnable;
    const paymentTitle2QuantityEnable: boolean = !!req.body.paymentTitle2QuantityEnable;
    const paymentTitle3QuantityEnable: boolean = !!req.body.paymentTitle3QuantityEnable;
    const paymentTitle4QuantityEnable: boolean = !!req.body.paymentTitle4QuantityEnable;
    const paymentTitle5QuantityEnable: boolean = !!req.body.paymentTitle5QuantityEnable;
    const paymentTitle6QuantityEnable: boolean = !!req.body.paymentTitle6QuantityEnable;
    const paymentTitle7QuantityEnable: boolean = !!req.body.paymentTitle7QuantityEnable;
    const paymentTitle8QuantityEnable: boolean = !!req.body.paymentTitle8QuantityEnable;
    const paymentTitle9QuantityEnable: boolean = !!req.body.paymentTitle9QuantityEnable;
    const paymentTitle10QuantityEnable: boolean = !!req.body.paymentTitle10QuantityEnable;

    const selectedSessions = JSON.parse(parseStringInput(req.body.selectedSessions));
    const mandatorySessions = JSON.parse(parseStringInput(req.body.mandatorySessions)); 

    const customQuestions: string = parseStringInput(req.body.customQuestions);

    const successfulMsgtoReg: string = parseStringInput(req.body.successfulMsgtoReg);
    const successfulMsgtoWaitingList: string = parseStringInput(req.body.successfulMsgtoWaitingList);
    const sendEmail: boolean = !!req.body.sendEmail;
    const emailFrom: string = parseStringInput(req.body.emailFrom);
    const emailBcc: string = parseStringInput(req.body.emailBcc);
    const emailSubjectSuccessfulReg: string = parseStringInput(req.body.emailSubjectSuccessfulReg);
    const emailDetailsSuccessfulReg: string = parseStringInput(req.body.emailDetailsSuccessfulReg);
    const emailSubjectSuccessfulWaiting: string = parseStringInput(req.body.emailSubjectSuccessfulWaiting);
    const emailDetailsSuccessfulWaiting: string = parseStringInput(req.body.emailDetailsSuccessfulWaiting);

    const err_msg_userType: string = parseStringInput(req.body.err_msg_userType);
    const err_msg_quotaExceed: string = parseStringInput(req.body.err_msg_quotaExceed);

    const isSessionCountLimit: boolean = !!req.body.isSessionCountLimit;
    const minSessionCount: number = parseNumericInput(req.body.minSessionCount);
    const maxSessionCount: number = parseNumericInput(req.body.maxSessionCount);

    if (!id) { return next(new ApiError("Missing Event Registration Form ID.")); }
    if (!topic) { return next(new ApiError("Missing Event Registration Form Topic.")); }
    if (!subtopic) { return next(new ApiError("Missing Event Registration Form Subtopic.")); }
    if (start === null) { return next(new ApiError("Start time must be in ISO8601 format")); }
    // if (earlyBirdEnd === null) { return next(new ApiError("Early Bird End time must be in ISO8601 format")); }
    if (end === null) { return next(new ApiError("End time must be in ISO8601 format")); }

    const eventRegForm = await EventRegistrationService.modify(
      req.session.data.me,
      id,
      eventId,
      true,
      topic,
      subtopic,
      start,
      end,
      description,
      acceptAnyone,
      acceptAlumni,
      acceptStudent,
      acceptStaff,
      acceptGuest,
      banner,
      bannerAltText,
      bannerHyperlink,
      pics,
      picsAcceptBox,
      picsAcceptBoxMsg,
      marketingAcceptBox,
      marketingAcceptBoxMsg,
      containPosition,
      containInstitution,
      containDept,
      containAddress,
      containCountry,
      containOfficePhoneNumber,
      containMobilePhoneNumber,
      containAttachment,
      containPayment,
      paymentCode,
      earlyBirdEnd,
      containPaymentTitle1,
      paymentTitle1,
      paymentTitle1Price,
      paymentTitle1Price_EB,
      containPaymentTitle2,
      paymentTitle2,
      paymentTitle2Price,
      paymentTitle2Price_EB,
      containPaymentTitle3,
      paymentTitle3,
      paymentTitle3Price,
      paymentTitle3Price_EB,
      containPaymentTitle4,
      paymentTitle4,
      paymentTitle4Price,
      paymentTitle4Price_EB,
      containPaymentTitle5,
      paymentTitle5,
      paymentTitle5Price,
      paymentTitle5Price_EB,
      containPaymentTitle6,
      paymentTitle6,
      paymentTitle6Price,
      paymentTitle6Price_EB,
      containPaymentTitle7,
      paymentTitle7,
      paymentTitle7Price,
      paymentTitle7Price_EB,
      containPaymentTitle8,
      paymentTitle8,
      paymentTitle8Price,
      paymentTitle8Price_EB,
      containPaymentTitle9,
      paymentTitle9,
      paymentTitle9Price,
      paymentTitle9Price_EB,
      containPaymentTitle10,
      paymentTitle10,
      paymentTitle10Price,
      paymentTitle10Price_EB,
      paymentTitle1Mandatory,
      paymentTitle2Mandatory,
      paymentTitle3Mandatory,
      paymentTitle4Mandatory,
      paymentTitle5Mandatory,
      paymentTitle6Mandatory,
      paymentTitle7Mandatory,
      paymentTitle8Mandatory,
      paymentTitle9Mandatory,
      paymentTitle10Mandatory,
      customQuestions,
      successfulMsgtoReg,
      successfulMsgtoWaitingList,
      sendEmail,
      emailFrom,
      emailBcc,
      emailSubjectSuccessfulReg,
      emailDetailsSuccessfulReg,
      emailSubjectSuccessfulWaiting,
      emailDetailsSuccessfulWaiting,
      err_msg_userType,
      err_msg_quotaExceed,
      limitItemCount,
      minItemCount,
      maxItemCount,
      paymentTitle1QuantityEnable,
      paymentTitle2QuantityEnable,
      paymentTitle3QuantityEnable,
      paymentTitle4QuantityEnable,
      paymentTitle5QuantityEnable,
      paymentTitle6QuantityEnable,
      paymentTitle7QuantityEnable,
      paymentTitle8QuantityEnable,
      paymentTitle9QuantityEnable,
      paymentTitle10QuantityEnable,
      isSessionCountLimit,
      minSessionCount,
      maxSessionCount
    );

    // First, delete all records of this form
    await EventRegistrationFormSession?.destroy({
      where: {
        eventId,
        formId: eventRegForm?.id
      }
    })
    // Then, create all new records
    // for (const session of selectedSessions) {
    //   await EventRegistrationFormSessionService.create(
    //     req.session.data.me,
    //     eventId,
    //     eventRegForm?.id,
    //     session?.id
    //   )
    // }

    console.log(selectedSessions);
    console.log("");

    for (const session of selectedSessions) {
      const mandatory = mandatorySessions?.some((mandSession: { id: any; }) => mandSession.id === session?.id)? true : false;
      await EventRegistrationFormSessionService.create(
        req.session.data.me,
        eventId,
        eventRegForm?.id,
        session?.id,
        mandatory,
      )
    }

    // // Refresh Session Data, especially me
    // req.session.data.me = await AuthnService.getMeSummary(req.session.data.me.netId);

    return res.status(200).send(createApiResponse<EventRegistrationAttributes>("Form Modified", eventRegForm));
  } catch (err) {
    return next(err);
  }
});

router.post("/searchCustomPaymentEvent", requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]),
  async (req: Request, res: Response, next: NextFunction) => {
    // TODO: Search by department deptAbbr
    try {
      const cpes = await CustomPaymentEventService.search(
        req.session.data.me,
        {
          // deptAbbr: req.session.data.me?.deptAbbr
        }
      );
      return res.status(200).send(createApiResponse<CustomPaymentEventAttributes[]>(null, cpes));
    } catch (err) {
      return next(err);
    }
  }
);

router.get('/:id', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id: string = parseStringInput(req.params.id);
      if (!id) { return next(new ApiError('Missing id')); }

      const eventRes: EventRegistrationSummary[] = await EventRegistrationService.search( req.session.data.me, {id });
      const finalRes = eventRes?.length > 0 ? eventRes[0] : null;

      return res.status(200).send(createApiResponse<EventRegistrationSummary>(null, { 
        id: finalRes?.id,
        eventId: finalRes?.eventId,
        disabled: finalRes?.disabled,
        topic: finalRes?.topic,
        subtopic: finalRes?.subtopic,
        start: finalRes?.start,
        end: finalRes?.end,
        description: finalRes?.description,
        acceptAnyone: finalRes?.acceptAnyone,
        acceptAlumni: finalRes?.acceptAlumni,
        acceptStudent: finalRes?.acceptStudent,
        acceptStaff: finalRes?.acceptStaff,
        acceptGuest: finalRes?.acceptGuest,
        banner: finalRes?.banner,
        bannerAltText: finalRes?.bannerAltText,
        bannerHyperlink: finalRes?.bannerHyperlink,
        pics: finalRes?.pics,
        picsAcceptBox: finalRes?.picsAcceptBox,
        picsAcceptBoxMsg: finalRes?.picsAcceptBoxMsg,
        marketingAcceptBox: finalRes?.marketingAcceptBox,
        marketingAcceptBoxMsg: finalRes?.marketingAcceptBoxMsg,
        containPosition: finalRes?.containPosition,
        containInstitution: finalRes?.containInstitution,
        containDept: finalRes?.containDept,
        containAddress: finalRes?.containAddress,
        containCountry: finalRes?.containCountry,
        containOfficePhoneNumber: finalRes?.containOfficePhoneNumber,
        containMobilePhoneNumber: finalRes?.containMobilePhoneNumber,
        containPayment: finalRes?.containPayment,
        paymentCode: finalRes?.paymentCode,
        earlyBirdEnd: finalRes?.earlyBirdEnd,
        containPaymentTitle1: finalRes?.containPaymentTitle1,
        paymentTitle1: finalRes?.paymentTitle1,
        paymentTitle1Price: finalRes?.paymentTitle1Price,
        paymentTitle1Price_EB: finalRes?.paymentTitle1Price_EB,
        containPaymentTitle2: finalRes?.containPaymentTitle2,
        paymentTitle2: finalRes?.paymentTitle2,
        paymentTitle2Price: finalRes?.paymentTitle2Price,
        paymentTitle2Price_EB: finalRes?.paymentTitle2Price_EB,
        containPaymentTitle3: finalRes?.containPaymentTitle3,
        paymentTitle3: finalRes?.paymentTitle3,
        paymentTitle3Price: finalRes?.paymentTitle3Price,
        paymentTitle3Price_EB: finalRes?.paymentTitle3Price_EB,
        containPaymentTitle4: finalRes?.containPaymentTitle4,
        paymentTitle4: finalRes?.paymentTitle4,
        paymentTitle4Price: finalRes?.paymentTitle4Price,
        paymentTitle4Price_EB: finalRes?.paymentTitle4Price_EB,
        containPaymentTitle5: finalRes?.containPaymentTitle5,
        paymentTitle5: finalRes?.paymentTitle5,
        paymentTitle5Price: finalRes?.paymentTitle5Price,
        paymentTitle5Price_EB: finalRes?.paymentTitle5Price_EB,
        containPaymentTitle6: finalRes?.containPaymentTitle6,
        paymentTitle6: finalRes?.paymentTitle6,
        paymentTitle6Price: finalRes?.paymentTitle6Price,
        paymentTitle6Price_EB: finalRes?.paymentTitle6Price_EB,
        containPaymentTitle7: finalRes?.containPaymentTitle7,
        paymentTitle7: finalRes?.paymentTitle7,
        paymentTitle7Price: finalRes?.paymentTitle7Price,
        paymentTitle7Price_EB: finalRes?.paymentTitle7Price_EB,
        containPaymentTitle8: finalRes?.containPaymentTitle8,
        paymentTitle8: finalRes?.paymentTitle8,
        paymentTitle8Price: finalRes?.paymentTitle8Price,
        paymentTitle8Price_EB: finalRes?.paymentTitle8Price_EB,
        containPaymentTitle9: finalRes?.containPaymentTitle9,
        paymentTitle9: finalRes?.paymentTitle9,
        paymentTitle9Price: finalRes?.paymentTitle9Price,
        paymentTitle9Price_EB: finalRes?.paymentTitle9Price_EB,
        containPaymentTitle10: finalRes?.containPaymentTitle10,
        paymentTitle10: finalRes?.paymentTitle10,
        paymentTitle10Price: finalRes?.paymentTitle10Price,
        paymentTitle10Price_EB: finalRes?.paymentTitle10Price_EB,
        paymentTitle1Mandatory: finalRes?.paymentTitle1Mandatory,
        paymentTitle2Mandatory: finalRes?.paymentTitle2Mandatory,
        paymentTitle3Mandatory: finalRes?.paymentTitle3Mandatory,
        paymentTitle4Mandatory: finalRes?.paymentTitle4Mandatory,
        paymentTitle5Mandatory: finalRes?.paymentTitle5Mandatory,
        paymentTitle6Mandatory: finalRes?.paymentTitle6Mandatory,
        paymentTitle7Mandatory: finalRes?.paymentTitle7Mandatory,
        paymentTitle8Mandatory: finalRes?.paymentTitle8Mandatory,
        paymentTitle9Mandatory: finalRes?.paymentTitle9Mandatory,
        paymentTitle10Mandatory: finalRes?.paymentTitle10Mandatory,
        customQuestions: finalRes?.customQuestions,
        successfulMsgtoReg: finalRes?.successfulMsgtoReg,
        successfulMsgtoWaitingList: finalRes?.successfulMsgtoWaitingList,
        sendEmail: finalRes?.sendEmail,
        emailFrom: finalRes?.emailFrom,
        emailBcc: finalRes?.emailBcc,
        emailSubjectSuccessfulReg: finalRes?.emailSubjectSuccessfulReg,
        emailDetailsSuccessfulReg: finalRes?.emailDetailsSuccessfulReg,
        emailSubjectSuccessfulWaiting: finalRes?.emailSubjectSuccessfulWaiting,
        emailDetailsSuccessfulWaiting: finalRes?.emailDetailsSuccessfulWaiting,
        err_msg_userType: finalRes?.err_msg_userType,
        err_msg_quotaExceed: finalRes?.err_msg_quotaExceed,
        limitItemCount: finalRes?.limitItemCount,
        minItemCount: finalRes?.minItemCount,
        maxItemCount: finalRes?.maxItemCount,
        updatedBy: finalRes?.updatedBy,
      }));
    } catch (err) {
      return next(err);
    }
  }
);

router.post('/getEvent', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("testingm essage");
    console.log(req.body);
    console.log("");
    const event = await EventRegistrationService.getEvent(req.session.data.me, req.body?.eventId);
    return res.status(200).send(createApiResponse<any>(null, event));
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

// router.post('/:eventId/set-roster', requireRole([RoleLabel.ServiceAdmin]), async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const eventId: number = parseEventId(req.params.eventId);
//     const deptAbbrs: string[] = req.body.deptAbbrs;

//     await EventService.updateRoster(req.session.data.me, eventId, deptAbbrs);

//     return res.status(200).send(createApiResponse<EventAttributes[]>(null, null));
//   } catch (err) {
//     return next(err);
//   }
// });

// router.post('/:eventId/set-eventDateTime', requireRole([RoleLabel.ServiceAdmin]), async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const eventId: number = parseEventId(req.params.eventId);
//     let eventDateTime: Date = null;

//     if (!!req.body?.eventDateTime) {
//       eventDateTime = parseIsoDateTime(String(req.body.eventDateTime));
//       if (eventDateTime === null) {
//         throw new ApiError('eventDateTime must be in ISO8601 format');
//       }
//     }

//     await EventService.updateEventDateTime(req.session.data.me, eventId, eventDateTime);

//     return res.status(200).send(createApiResponse<EventAttributes[]>(null, null));
//   } catch (err) {
//     return next(err);
//   }
// });

function parseNumericInput(input: any): number {
  if (!input && input !== 0) {
    return null;
  }

  let output: number = null;

  try {
    output = Number.parseInt(input, 10);
  } catch (err) {
    throw new ApiError("Invalid Numeric Input");
  }

  return output;
}

function parseStringInput(input: any): string {
  if (!input) {
    return null;
  }

  return String(input);
}

export default router;
