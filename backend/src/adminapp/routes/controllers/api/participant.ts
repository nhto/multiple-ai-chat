import express, { NextFunction, Request, Response } from 'express';
import { requireRole } from '../../middlewares/authn';
import { createApiResponse, RoleLabel, ParticipantSummary, PaymentStatusLabel } from '../../../../models/model';
import { ApiError, apiInternalServerError } from '../../../../models/error';
import * as ParticipantService from '../../../../services/participant';
import * as s3 from "../../../../utilities/s3client";
import multer from 'multer';
import { ParticipantAttachments } from "../../../../repo/participantAttachments";
// import { DepartmentAttributes } from '../../../../repo/department';

const router = express.Router();
// const multer  = require('multer')
const upload = multer({ storage: multer.memoryStorage() });


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
      const removeSymbols = (input: string): string => {
        return input.replace(/[!@#$%^&*(),.?":{}|<>]/g, '').trim();
      };

      console.log(req.body);
      if(!req.body.eventId){
        throw new ApiError("Event Id is missing.");
      }
      const eventId: string = parseStringInput(req.body.eventId).trim();
      if(!req.body.formId){
        throw new ApiError("Form Id is missing.");
      }
      const formId: string = parseStringInput(req.body.formId).trim();
      if(!req.body.userType){
        throw new ApiError("User Type is missing.");
      }
      const userType: string = parseStringInput(req.body.userType).trim();
      // if(!req.body.userId){
      //   throw new ApiError("User Id is missing.");
      // }
      const userId: string = req.body.userId? parseStringInput(req.body.userId).trim():parseStringInput(req.body.email).trim();

      if(!req.body.registrationStatus){
        throw new ApiError("Registration Status is missing.");
      }
      const registrationStatus: string = parseStringInput(req.body.registrationStatus).trim();
      const internalRemark: string = req.body.internalRemark ? parseStringInput(req.body.internalRemark).trim() : null;

      if(!req.body.title){
        throw new ApiError("Title is missing.");
      }
      const title: string = parseStringInput(req.body.title).trim();
      if(!req.body.firstname){
        throw new ApiError("First name is missing.");
      }
      const firstname: string = removeSymbols(parseStringInput(req.body.firstname));
      if(!req.body.lastname){
        throw new ApiError("Last name is missing.");
      }
      const lastname: string = removeSymbols(parseStringInput(req.body.lastname));
      if(!req.body.email){
        throw new ApiError("Email is missing.");
      }
      const email: string = parseStringInput(req.body.email).trim();

      const position: string = req.body.position? parseStringInput(req.body.position).trim() : null;
      const institution: string = req.body.institution ? parseStringInput(req.body.institution).trim() : null;
      const dept: string = req.body.dept ? parseStringInput(req.body.dept).trim() : null;
      const address: string = req.body.address ? parseStringInput(req.body.address).trim() : null;
      const country: string = req.body.country ? parseStringInput(req.body.country).trim() : null;
      const officePhoneNumber: string = req.body.officePhoneNumber ? parseStringInput(req.body.officePhoneNumber).trim() : null;
      const mobilePhoneNumber: string = req.body.mobilePhoneNumber ? parseStringInput(req.body.mobilePhoneNumber).trim() : null;

      const customAnswer: string = parseStringInput(req.body.customAnswer);

      // Data validation
      if (userType && userType !== "Staff" && userType !== "Student" && userType !== "Alumni" && userType !== "Guests") {
        return next(new ApiError(`File contains invalid user type.${email}`));
      }

      if (registrationStatus && registrationStatus !== "Registered" && registrationStatus !== "In Wait List") {
        return next(new ApiError(`File contains invalid registration status.${email}`));
      }

      const userIdRegex = /^[a-zA-Z0-9_-]*$/;
      // if (userId && !userIdRegex.test(userId)) {
      //   return next(new ApiError(`File contains invalid user ID.${email}`));
      // }

      const validTitle = ["Ir", "Ir Prof.", "Ir Dr", "Prof", "Dr", "Mr", "Mrs", "Ms", "Miss"];
      if (title && !validTitle.includes(title)) {
        return next(new ApiError(`File contains invalid title.${email}`));
      }

      const nameRegex = /^[a-zA-Z\s-]{1,255}$/;
      if (firstname && !nameRegex.test(firstname)) {
        return next(new ApiError(`File contains invalid first name.${email}`));
      }
      if (lastname && !nameRegex.test(lastname)) {
        return next(new ApiError(`File contains invalid last name.${email}`));
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+[a-zA-Z0-9]$/;
      if (email && !emailRegex.test(email)) {
        return next(new ApiError(`File contains invalid email address.${email}`));
      }

      const positionRegex = /^[a-zA-Z\s.-]+$/;
      if (position && !positionRegex.test(position)) {
        return next(new ApiError(`File contains invalid position.${email}`));
      }

      const phoneRegex = /^[0-9+\s]{8,20}$/;
      if (mobilePhoneNumber && !phoneRegex.test(mobilePhoneNumber)) {
        return next(new ApiError(`File contains invalid mobile phone number.${email}`));
      }
      if (officePhoneNumber && !phoneRegex.test(officePhoneNumber)) {
        return next(new ApiError(`File contains invalid office phone number.${email}`));
      }

      // const organizationRegex = /^[a-zA-Z\s.-]+$/;
      const organizationRegex = /^[a-zA-Z\s().-]+$/;
      if (institution && !organizationRegex.test(institution)) {
        return next(new ApiError(`File contains invalid organization.${email}`));
      }
      if (dept && !organizationRegex.test(dept)) {
        return next(new ApiError(`File contains invalid department/unit.${email}`));
      }

      const addressRegex = /^[a-zA-Z0-9\s.,\/()]+(?:\s[0-9A-Za-z]+)*$/;
      if (address && !addressRegex.test(address)) {
        return next(new ApiError(`File contains invalid address.${email}`));
      }

      const countryRegex = /^[a-zA-Z\s-]+$/;
      if (country && !countryRegex.test(country)) {
        return next(new ApiError(`File contains invalid country.${email}`));
      }

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

        customAnswer,
        // "[]" // customAnswers
        0, // orderPaymentQuantity1
        0, // orderPaymentQuantity2
        0, // orderPaymentQuantity3
        0, // orderPaymentQuantity4
        0, // orderPaymentQuantity5
        0, // orderPaymentQuantity6
        0, // orderPaymentQuantity7
        0, // orderPaymentQuantity8
        0, // orderPaymentQuantity9
        0, // orderPaymentQuantity10
      );
      return res
        .status(200)
        .send(createApiResponse<any>(null, participant));
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
        .send(createApiResponse<any>(null, participant));
    } catch (err) {
      return next(err);
    }
  }
);

router.post('/testingSendEmail', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.body);
    const testingSendEmail = await ParticipantService.testingSendEmail(req.session.data.me, req.body);
    return res.status(200).send(createApiResponse<any>('', null));
  } catch (err) {
    return next(err);
  }
});

router.post('/deleteParticipant', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.body);
    await ParticipantService.deleteParticipant(req.session.data.me, req.body);
    return res.status(200).send(createApiResponse<any>('Delete Registrant Successfully', null));
  } catch (err) {
    return next(err);
  }
});

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

// DOWNLOAD attachment of registrant
router.get(
  "/:eventId/:participantId/download/attachment",
  async (req: Request, res: Response, next: NextFunction) => {
    const { eventId, participantId } = req.params;
    const attachmentCollection = await ParticipantAttachments.findAll({
      where:{
        participantId: participantId,
      }
    });

    try {
      await s3.getAllAttachmentZippeRegistrant(eventId, res, attachmentCollection);
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

// DOWNLOAD all attachment
router.get(
  "/:eventId/download/all/attachment",
  async (req: Request, res: Response, next: NextFunction) => {
    const { eventId } = req.params;
    const attachmentCollection = await ParticipantAttachments.findAll({
      where:{
        eventId: eventId,
      }
    });

    try {
      await s3.getAllAttachmentZipped(eventId, res, attachmentCollection);
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

export default router;
