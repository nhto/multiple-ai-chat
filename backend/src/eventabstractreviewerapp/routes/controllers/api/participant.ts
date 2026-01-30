import express, { NextFunction, Request, Response } from 'express';
import { requireRole } from '../../middlewares/authn';
import { createApiResponse, RoleLabel, ParticipantSummary, PaymentStatusLabel } from '../../../../models/model';
import { ApiError, apiInternalServerError } from '../../../../models/error';
import { parseIsoDateTime } from '../../../../utilities/date';
import { sendEmail } from '../../../../utilities/email';
import * as ParticipantService from '../../../../services/participant';
import { Participant } from '../../../../repo/participant';
import { Event } from '../../../../repo/event';
import path from 'path';
import qrcode from 'qrcode';
import { createCanvas, loadImage } from "canvas";
import { createQrWithGuestName } from '../../../../services/cams';
// import { DepartmentAttributes } from '../../../../repo/department';

const router = express.Router();

router.post("/search", requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]),
  async (req: Request, res: Response, next: NextFunction) => {
    // TODO: Search by department deptAbbr
    try {
      const id: string = parseStringInput(req.body.id);
      const eventId: string = parseStringInput(req.body.eventId);
      const formId: string = parseStringInput(req.body.formId);
      const userType: string = parseStringInput(req.body.userType);
      const userId: string = parseStringInput(req.body.userId);
      const qrCode: string = parseStringInput(req.body.qrCode);
      const disabled: boolean = req?.body?.disabled === undefined ? undefined : !!req?.body?.disabled;

      const registrationStatus: string = parseStringInput(req.body.registrationStatus);

      const title: string = parseStringInput(req.body.title);
      const firstname: string = parseStringInput(req.body.firstname);
      const lastname: string = parseStringInput(req.body.lastname);
      const email: string = parseStringInput(req.body.email);

      const position: string = parseStringInput(req.body.position);
      const institution: string = parseStringInput(req.body.institution);
      const dept: string = parseStringInput(req.body.dept);
      const address: string = parseStringInput(req.body.address);
      const country: string = parseStringInput(req.body.country);
      const officePhoneNumber: string = parseStringInput(req.body.officePhoneNumber);
      const mobilePhoneNumber: string = parseStringInput(req.body.mobilePhoneNumber);

      const needPayment: boolean = req?.body?.needPayment === undefined ? undefined : !!req?.body?.needPayment;
      const paymentStatus: string = parseStringInput(req.body.paymentStatus);
      const paymentRefId: string = parseStringInput(req.body.paymentRefId);

      const participants = await ParticipantService.search(req.session.data.me, {
        id,
        eventId,
        formId,
        userType,
        userId,
        qrCode,
        disabled,

        registrationStatus,

        title,
        firstname,
        lastname,
        email,

        position,
        institution,
        dept,
        address,
        country,
        officePhoneNumber,
        mobilePhoneNumber,

        needPayment,
        paymentStatus,
        paymentRefId,
      });
      return res
        .status(200)
        .send(createApiResponse<ParticipantSummary[]>(null, participants));
    } catch (err) {
      return next(err);
    }
  }
);

router.post("/create", requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]),
  async (req: Request, res: Response, next: NextFunction) => {
    // TODO: Search by department deptAbbr
    try {
      const eventId: string = parseStringInput(req.body.eventId);
      const formId: string = parseStringInput(req.body.formId);
      const userType: string = parseStringInput(req.body.userType);
      const userId: string = parseStringInput(req.body.userId);

      const registrationStatus: string = parseStringInput(req.body.registrationStatus);
      const internalRemark: string = parseStringInput(req.body.internalRemark);

      const title: string = parseStringInput(req.body.title);
      const firstname: string = parseStringInput(req.body.firstname);
      const lastname: string = parseStringInput(req.body.lastname);
      const email: string = parseStringInput(req.body.email);

      const position: string = parseStringInput(req.body.position);
      const institution: string = parseStringInput(req.body.institution);
      const dept: string = parseStringInput(req.body.dept);
      const address: string = parseStringInput(req.body.address);
      const country: string = parseStringInput(req.body.country);
      const officePhoneNumber: string = parseStringInput(req.body.officePhoneNumber);
      const mobilePhoneNumber: string = parseStringInput(req.body.mobilePhoneNumber);

      const customAnswer: string = parseStringInput(req.body.customAnswer);

      // const paymentStatus: string = parseStringInput(req.body.paymentStatus);

      const participant = await ParticipantService.create(req.session.data.me,
        null, // sub
        eventId,
        formId,
        userType,
        userId,

        registrationStatus,
        internalRemark,

        title,
        firstname,
        lastname,
        email,

        false, // picsAcceptBox
        false, // marketingAcceptBox

        position,
        institution,
        dept,
        address,
        country,
        officePhoneNumber,
        mobilePhoneNumber,

        false, // orderPaymentTitle1
        null, // paymentTitle1
        null, // paymentTitle1Price
        false, // orderPaymentTitle2
        null, // paymentTitle2
        null, // paymentTitle2Price
        false, // orderPaymentTitle3
        null, // paymentTitle3
        null, // paymentTitle3Price
        false, // orderPaymentTitle4
        null, // paymentTitle4
        null, // paymentTitle4Price
        false, // orderPaymentTitle5
        null, // paymentTitle5
        null, // paymentTitle5Price
        false, // orderPaymentTitle6
        null, // paymentTitle6
        null, // paymentTitle6Price
        false, // orderPaymentTitle7
        null, // paymentTitle7
        null, // paymentTitle7Price
        false, // orderPaymentTitle8
        null, // paymentTitle8
        null, // paymentTitle8Price
        false, // orderPaymentTitle9
        null, // paymentTitle9
        null, // paymentTitle9Price
        false, // orderPaymentTitle10
        null, // paymentTitle10
        null, // paymentTitle10Price

        PaymentStatusLabel.WaitingForPayment,

        customAnswer
        // "[]" // customAnswers
      );
      return res
        .status(200)
        .send(createApiResponse<ParticipantSummary>(null, participant));
    } catch (err) {
      return next(err);
    }
  }
);

router.post("/modify", requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]),
  async (req: Request, res: Response, next: NextFunction) => {
    // TODO: Search by department deptAbbr
    try {
      const participantId: string = parseStringInput(req.body.participantId);
      const userType: string = parseStringInput(req.body.userType);
      const registrationStatus: string = parseStringInput(req.body.registrationStatus);
      const internalRemark: string = parseStringInput(req.body.internalRemark);

      const title: string = parseStringInput(req.body.title);
      const firstname: string = parseStringInput(req.body.firstname);
      const lastname: string = parseStringInput(req.body.lastname);
      const email: string = parseStringInput(req.body.email);

      const position: string = parseStringInput(req.body.position);
      const institution: string = parseStringInput(req.body.institution);
      const dept: string = parseStringInput(req.body.dept);
      const address: string = parseStringInput(req.body.address);
      const country: string = parseStringInput(req.body.country);
      const officePhoneNumber: string = parseStringInput(req.body.officePhoneNumber);
      const mobilePhoneNumber: string = parseStringInput(req.body.mobilePhoneNumber);

      const paymentStatus: string = parseStringInput(req.body.paymentStatus);

      const customAnswers: string = parseStringInput(req.body.customAnswers);

      const participant = await ParticipantService.modify(req.session.data.me,
        participantId,
        userType,
        registrationStatus,
        internalRemark,

        title,
        firstname,
        lastname,
        email,

        position,
        institution,
        dept,
        address,
        country,
        officePhoneNumber,
        mobilePhoneNumber,

        paymentStatus,

        customAnswers,
      );
      return res
        .status(200)
        .send(createApiResponse<ParticipantSummary>(null, participant));
    } catch (err) {
      return next(err);
    }
  }
);

function parseNumbers(numericInput: any): number {
  if (!numericInput && !(numericInput === 0)) { return null; }

  let numericOutput: number = null;

  try {
    numericOutput = Number.parseInt(numericInput, 10);
  } catch (err) {
    throw new ApiError("Invalid Numbers");
  }

  return numericOutput;
}

function parseStringInput(input: any): string {
  if (!input) {
    return null;
  }

  return String(input);
}

export default router;
