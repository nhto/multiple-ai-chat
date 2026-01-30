import express, { NextFunction, Request, Response } from "express";
import { requireRole } from "../../middlewares/authn";
import {
  createApiResponse,
  EventSummary,
  RoleLabel,
} from "../../../../models/model";
import * as EventService from "../../../../services/event";
import logger from "../../../../utilities/logger";
import { ApiError } from "../../../../models/error";
import {
  parseIsoDateTime,
  parseLocalDateTime,
} from "../../../../utilities/date";
import { EventAttributes } from "../../../../repo/event";
import * as AuthnService from "../../../../services/authn";

const router = express.Router();

router.post("/search",
  requireRole([RoleLabel.SystemAdmin, RoleLabel.Admin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]),
  async (req: Request, res: Response, next: NextFunction) => {
    // TODO: Search by department deptAbbr
    try {
      const topic: string = parseStringInput(req.body.topic);
      const subtopic: string = parseStringInput(req.body.subtopic);
      const start: Date = parseIsoDateTime(req.body.start);
      const end: Date = parseIsoDateTime(req.body.end);
      const eventMode: string = parseStringInput(req.body.eventMode);
      const contactName: string = parseStringInput(req.body.contactName);
      const contactEmail: string = parseStringInput(req.body.contactEmail);
      const contactPhoneNumber: string = parseStringInput(req.body.contactPhoneNumber);
      const contactDept: string = parseStringInput(req.body.contactDept);

      const events = await EventService.search(req.session.data.me, {
        topic,
        subtopic,
        start,
        end,
        eventMode,
        contactName,
        contactEmail,
        contactPhoneNumber,
        contactDept,
      });
      return res
        .status(200)
        .send(createApiResponse<EventSummary[]>(null, events));
    } catch (err) {
      return next(err);
    }
  }
);

router.post(
  "/create",
  requireRole([RoleLabel.SystemAdmin, RoleLabel.Admin]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const topic: string = parseStringInput(req.body.topic);
      const subtopic: string = parseStringInput(req.body.subtopic);
      const start: Date = parseIsoDateTime(req.body.start);
      const end: Date = parseIsoDateTime(req.body.end);
      const remark: string = parseStringInput(req.body.remark);
      const eventMode: string = parseStringInput(req.body.eventMode);
      const quota: number = parseNumbers(req.body.quota);
      const waitingListQuota: number = parseNumbers(req.body.waitingListQuota);
      const contactName: string = parseStringInput(req.body.contactName);
      const contactEmail: string = parseStringInput(req.body.contactEmail);
      const contactPhoneNumber: string = parseStringInput(req.body.contactPhoneNumber);
      const contactDept: string = parseStringInput(req.body.contactDept);
      const banner: Buffer | null = !!req.body.banner
        ? Buffer.from(req.body.banner, "utf8")
        : null;

      if (!topic) { return next(new ApiError("Missing Role Label.")); }
      if (quota < 0) { throw new ApiError("Missing Quota"); }
      if (waitingListQuota < 0) { throw new ApiError("Missing Waiting List Quota"); }
      if (end < start) { return next(new ApiError("Invalid Date Range")); }
      if (!contactName) { throw new ApiError("Missing Contact Name"); }
      if (!contactEmail) { return next(new ApiError("Missing Contact Email.")); }
      if (!contactPhoneNumber) { return next(new ApiError("Missing Contact Phone Number.")); }
      if (!contactDept) { return next(new ApiError("Missing Contact Department.")); }

      const event = await EventService.create(
        req.session.data.me,
        topic,
        subtopic,
        start,
        end,
        remark,
        eventMode,
        quota,
        waitingListQuota,
        0,
        contactName,
        contactEmail,
        contactPhoneNumber,
        contactDept,
        banner
      );

      // Refresh Session Data, especially me
      req.session.data.me = await AuthnService.getMeSummary(
        req.session.data.me.netId
      );

      return res.status(200).send(
        createApiResponse<EventAttributes[]>(null, [
          {
            id: event.id,
            topic: event.topic,
            subtopic: event.subtopic,
            start: event.start,
            end: event.end,
            remark: event.remark,
            eventMode: event.eventMode,
            quota: event.quota,
            waitingListQuota: event.waitingListQuota,
            used: event.used,
            contactName: event.contactName,
            contactEmail: event.contactEmail,
            contactPhoneNumber: event.contactPhoneNumber,
            contactDept: event.contactDept,
            banner: event.banner,
          },
        ])
      );
    } catch (err) {
      return next(err);
    }
  }
);

router.post(
  "/modify",
  requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id: string = parseStringInput(req.body.id);
      const topic: string = parseStringInput(req.body.topic);
      const subtopic: string = parseStringInput(req.body.subtopic);
      const start: Date = parseIsoDateTime(req.body.start);
      const end: Date = parseIsoDateTime(req.body.end);
      const remark: string = parseStringInput(req.body.remark);
      const eventMode: string = parseStringInput(req.body.eventMode);
      const quota: number = parseNumbers(req.body.quota);
      const waitingListQuota: number = parseNumbers(req.body.waitingListQuota);
      const used: number = parseNumbers(req.body.used);
      const contactName: string = parseStringInput(req.body.contactName);
      const contactEmail: string = parseStringInput(req.body.contactEmail);
      const contactPhoneNumber: string = parseStringInput(req.body.contactPhoneNumber);
      const contactDept: string = parseStringInput(req.body.contactDept);
      const banner: Buffer = !!req.body.banner
        ? Buffer.from(req.body.banner, "utf8")
        : null;

      if (!topic) { return next(new ApiError("Missing Role Label.")); }
      if (end < start) { return next(new ApiError("Invalid Date Range")); }
      if (quota < 0) { throw new ApiError("Missing Quota"); }
      if (waitingListQuota < 0) { throw new ApiError("Missing Waiting List Quota"); }
      if (!contactName) { throw new ApiError("Missing Contact Name"); }
      if (!contactEmail) { return next(new ApiError("Missing Contact Email.")); }
      if (!contactPhoneNumber) { return next(new ApiError("Missing Contact Phone Number.")); }
      if (!contactDept) { return next(new ApiError("Missing Contact Department.")); }

      const event = await EventService.modify(
        req.session.data.me,
        id,
        topic,
        subtopic,
        start,
        end,
        remark,
        eventMode,
        quota,
        waitingListQuota,
        used,
        contactName,
        contactEmail,
        contactPhoneNumber,
        contactDept,
        banner
      );

      // Refresh Session Data, especially me
      req.session.data.me = await AuthnService.getMeSummary(
        req.session.data.me.netId
      );

      return res.status(200).send(
        createApiResponse<EventAttributes[]>(null, [
          {
            id: event.id,
            topic: event.topic,
            subtopic: event.subtopic,
            start: event.start,
            end: event.end,
            remark: event.remark,
            eventMode: event.eventMode,
            quota: event.quota,
            waitingListQuota: event.waitingListQuota,
            used: event.used,
            contactName: event.contactName,
            contactEmail: event.contactEmail,
            contactPhoneNumber: event.contactPhoneNumber,
            contactDept: event.contactDept,
            banner: event.banner,
          },
        ])
      );
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
