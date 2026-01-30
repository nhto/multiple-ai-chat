import express, { NextFunction, Request, Response } from "express";
import { requireRole } from "../../middlewares/authn";
import {
  createApiResponse,
  EmailTemplateSummary,
  RoleLabel,
  MessagePlaceholderLabel,
} from "../../../../models/model";
import * as EmailTemplatetService from "../../../../services/emailTemplate";
import { ApiError } from "../../../../models/error";
import { EmailTemplateAttributes } from "../../../../repo/emailTemplate";
import path from 'path';
import qrcode from 'qrcode';
import * as config from '../../../../utilities/config';
import { createCanvas, loadImage } from "canvas";
import { sendEmail } from '../../../../utilities/email';
import { EmailTemplate } from '../../../../repo/emailTemplate';
import { Event } from '../../../../repo/event';
import { Participant } from '../../../../repo/participant';
import { createQrWithGuestName } from '../../../../services/cams';

const router = express.Router();

router.post("/search", requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]),
  async (req: Request, res: Response, next: NextFunction) => {
    // TODO: Search by department deptAbbr
    try {
      const id: string = parseStringInput(req.body.id);
      const eventId: string = parseStringInput(req.body.eventId);
      const name: string = parseStringInput(req.body.name);
      const from: string = parseStringInput(req.body.from);
      const bcc: string = parseStringInput(req.body.bcc);
      const subject: string = parseStringInput(req.body.subject);
      const details: string = parseStringInput(req.body.details);
      const updatedBy: string = parseStringInput(req.body.updatedBy);

      const events = await EmailTemplatetService.search(req.session.data.me, {
        id,
        eventId,
        name,
        from,
        bcc,
        subject,
        details,
        updatedBy,
      });
      return res
        .status(200)
        .send(createApiResponse<EmailTemplateSummary[]>(null, events));
    } catch (err) {
      return next(err);
    }
  }
);

router.post("/create", requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const eventId: string = parseStringInput(req.body.eventId);
      const name: string = parseStringInput(req.body.name);
      const from: string = parseStringInput(req.body.from);
      const bcc: string = parseStringInput(req.body.bcc);
      const subject: string = parseStringInput(req.body.subject);
      const details: string = parseStringInput(req.body.details);

      if (!eventId) { return next(new ApiError("Missing Event ID.")); }
      if (!name) { return next(new ApiError("Missing Email Template Name.")); }
      if (!from) { return next(new ApiError("Missing Email Template From.")); }
      if (!subject) { return next(new ApiError("Missing Email Template Subject.")); }

      const emailTemplate = await EmailTemplatetService.create(
        req.session.data.me,
        eventId,
        name,
        from,
        bcc,
        subject,
        details,
      );

      return res.status(200).send(createApiResponse<EmailTemplateAttributes>(null, emailTemplate));
    } catch (err) {
      return next(err);
    }
  }
);

router.post("/modify", requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id: string = parseStringInput(req.body.id);
      const eventId: string = parseStringInput(req.body.eventId);
      const name: string = parseStringInput(req.body.name);
      const from: string = parseStringInput(req.body.from);
      const bcc: string = parseStringInput(req.body.bcc);
      const subject: string = parseStringInput(req.body.subject);
      const details: string = parseStringInput(req.body.details);

      if (!id) { return next(new ApiError("Missing Email Template ID.")); }
      if (!eventId) { return next(new ApiError("Missing Event ID.")); }
      if (!name) { return next(new ApiError("Missing Email Template Name.")); }
      if (!from) { return next(new ApiError("Missing Email Template From.")); }
      if (!subject) { return next(new ApiError("Missing Email Template Subject.")); }

      const emailTemplate = await EmailTemplatetService.modify(
        req.session.data.me,
        id,
        eventId,
        name,
        from,
        bcc,
        subject,
        details,
      );

      return res.status(200).send(createApiResponse<EmailTemplateAttributes>(null, emailTemplate)
      );
    } catch (err) {
      return next(err);
    }
  }
);

router.post("/send", requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]),
  async (req: Request, res: Response, next: NextFunction) => {
    // TODO: Search by department deptAbbr
    try {
      const id: string = parseStringInput(req.body.id);
      const emailTemplate = await EmailTemplate.findOne({ where: { id } })
      const needQRCode = emailTemplate?.details?.includes(MessagePlaceholderLabel.qrCode)
      if (!emailTemplate) { return next(new ApiError("Cannot find corresponding email template")); }

      const eventId: string = parseStringInput(req.body.eventId);
      const event = await Event.findOne({ where: { id: eventId } })
      if (!event) { return next(new ApiError("Cannot find corresponding event")); }

      const rowSelection: string[] = req?.body?.rowSelection;
      if (rowSelection?.length < 1) { return next(new ApiError("No Participant is selected")); }

      for (const participantId of rowSelection) {
        const participant = await Participant.findOne({ where: { id: participantId } })

        let qr = ""
        let qrCodeImage = "";
        if (needQRCode) {
          if (!participant.qrCode) {
            const camsResponse = await createQrWithGuestName(
              event?.start,
              event?.end,
              `${participant?.firstname} ${participant?.lastname}`,
              `CEMS - ${event?.topic}`,
            )
            if (!camsResponse.qrCode) {
              return next(new ApiError("Cannot create QRCode"));
            } else {
              qr = camsResponse.qrCode
              participant.qrCode = camsResponse.qrCode
              await participant.save()
            }
          } else {
            qr = participant.qrCode;
          }

          const canvas = createCanvas(parseInt(process.env.QRCODE_WIDTH, 10) + 22, parseInt(process.env.QRCODE_WIDTH, 10) + 22);
          // Draw the QRCode first
          await qrcode.toCanvas(canvas, qr, {
            errorCorrectionLevel: "H",
            margin: 1,
            color: {
              dark: "#000000",
              light: "#ffffff",
            },
            width: parseInt(process.env.QRCODE_WIDTH, 10) + 22
          });

          // Then Draw the logo on it
          const logoPath = path.resolve(__dirname, '../../../../img/PolyU_Logo_QRCode.png')
          const img = await loadImage(logoPath);
          // const center = (parseInt(process.env.QRCODE_WIDTH, 10) - 70) / 2;
          await canvas.getContext("2d").drawImage(img, 126, 126, 70, 70);
          qrCodeImage = await canvas.toDataURL("image/png");
        }

        const mailOptions = {
          from: emailTemplate?.from,
          to: participant?.email,
          bcc: emailTemplate?.bcc,
          subject: emailTemplate?.subject,
          text: emailTemplate?.subject,
          attachDataUrls: true, // to accept base64 content in messsage
          html: emailTemplate?.details
            ?.replaceAll('[%title%]', participant.title)
            ?.replaceAll('[%firstname%]', participant.firstname)
            ?.replaceAll('[%lastname%]', participant.lastname)
            ?.replaceAll('[%position%]', participant.position)
            ?.replaceAll('[%organization%]', participant.institution)
            ?.replaceAll('[%dept%]', participant.dept)
            ?.replaceAll('[%paymentLink%]', `<a href="${config.APP_URL}/payment?id=${participant?.id}&eventid=${participant?.eventId}&refid=${participant?.paymentRefId}&callback=true" alt="payment link">Click me to pay</a>`)
            ?.replaceAll('[%qrCode%]', `<img src="${qrCodeImage}" width="${parseInt(process.env.QRCODE_WIDTH, 10)}" height="${parseInt(process.env.QRCODE_WIDTH, 10)}"><br/><p>QR Code: ${qr}</p>`)
        };
        await sendEmail(mailOptions)
      }

      return res.status(200).send(createApiResponse<void>("Email Sent", null));
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
