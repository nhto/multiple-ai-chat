import express, { NextFunction, Request, Response } from "express";
import { requireRole } from "../../middlewares/authn";
import {
  createApiResponse,
  EventSessionSummary,
  RoleLabel,
} from "../../../../models/model";
import * as EventService from "../../../../services/event";
import * as EventSessionService from "../../../../services/eventSession";
import logger from "../../../../utilities/logger";
import { ApiError } from "../../../../models/error";
import {
  parseIsoDateTime,
  parseLocalDateTime,
} from "../../../../utilities/date";
import { EventAttributes } from "../../../../repo/event";
import { EventSessionAttributes } from "../../../../repo/eventSession";
import * as AuthnService from "../../../../services/authn";
import * as EventRegistrationFormSessionService from "../../../../services/eventRegistrationFormSession";

const router = express.Router();

router.post("/search", requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]),
  async (req: Request, res: Response, next: NextFunction) => {
    // TODO: Search by department deptAbbr
    try {
      const eventId: string = parseStringInput(req.body.eventId);
      const venue: string = parseStringInput(req.body.venue);
      const details: string = parseStringInput(req.body.details);
      // const needPayment: boolean = !!req.body.needPayment;
      // const price: number = parseInt(req.body.price, 10);
      // const price_eb: number = parseInt(req.body.price_eb, 10);
      const allowWalkIn: boolean = !!req.body.allowWalkIn;
      const from = parseIsoDateTime(String(req.body.from));
      const to = parseIsoDateTime(String(req.body.to));

      const eventSession = await EventSessionService.search(req.session.data.me, {
        eventId,
        venue,
        details,
        // needPayment,
        // price,
        // price_eb,
        allowWalkIn,
        from,
        to,
      });

      // const eventSession will have all the sessions related to the eventId.
      // For each of the session, we count its frequency in the EventRegistrationFormSession DB table.
      // The frequency represent how many registration forms are using that particular session.
      // The number is stored in the inUseCount variable.
      for (const session of eventSession) {

        // count how many of this session appear in the EventRegistrationFormSession DB table
        const outcome = await EventRegistrationFormSessionService.search(req.session.data.me, {
          sessionId: session.id,
        })
        const inUseCount = outcome.length
        
        session.inUseCount = inUseCount
      }


      return res
        .status(200)
        .send(createApiResponse<EventSessionSummary[]>(null, eventSession));
    } catch (err) {
      return next(err);
    }
  }
);

router.post(
  "/create",
  requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const eventId: string = parseStringInput(req.body.eventId);
      const details: string = parseStringInput(req.body.details);
      const venue: string = parseStringInput(req.body.venue);
      const quota: number = parseInt(req.body.quota, 10);
      // const needPayment: boolean = !!req.body.needPayment;
      // const price: number = parseInt(req.body.price, 10);
      // const price_eb: number = parseInt(req.body.price_eb, 10);
      const allowWalkIn: boolean | null = req.body.allowWalkIn === null ? null : !!req.body.allowWalkIn;
      // const from = parseIsoDateTime(String(req.body.from));
      // const to = parseIsoDateTime(String(req.body.to));
      const from = parseIsoDateTime(req.body.from);
      const to = parseIsoDateTime(req.body.to);

      if (!eventId) { return next(new ApiError("Missing EventID.")); }
      if (!details) { return next(new ApiError("Missing Event Session Name.")); }
      // if (!venue) { return next(new ApiError("Missing Venue.")); }
      if (quota < 0) { return next(new ApiError("Missing Event Session Quota.")); }
      // if (needPayment) {
      //   if (!price) { return next(new ApiError("Missing Price.")); }
      //   if (!price_eb) { return next(new ApiError("Missing Early Bird Price.")); }
      // }
      // if (from === null) { throw new ApiError("Start time (From) must be in ISO8601 format"); }
      // if (to === null) { throw new ApiError("End time (To) must be in ISO8601 format"); }

      const eventSession = await EventSessionService.create(
        req.session.data.me,
        eventId,
        details,
        venue,
        quota,
        0,
        // needPayment,
        // price,
        // price_eb,
        allowWalkIn,
        from,
        to
      );

      // Refresh Session Data, especially me
      req.session.data.me = await AuthnService.getMeSummary(req.session.data.me.netId);

      return res.status(200).send(
        createApiResponse<EventSessionSummary[]>(null, [
          {
            id: eventSession.id,
            eventId: eventSession.eventId,
            venue: eventSession.venue,
            quota: eventSession.quota,
            used: eventSession.used,
            details: eventSession.details,
            // needPayment: eventSession.needPayment,
            // price: eventSession.price,
            // price_eb: eventSession.price_eb,
            allowWalkIn: eventSession.allowWalkIn,
            from: eventSession.from,
            to: eventSession.to,
            createdAt: eventSession.createdAt,
            updatedAt: eventSession.updatedAt,
            disabled: eventSession.disabled,
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
  requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id: string = parseStringInput(req.body.id);

      const eventId: string = parseStringInput(req.body.eventId);
      const details: string = parseStringInput(req.body.details);
      const venue: string = parseStringInput(req.body.venue);
      const quota: number = parseInt(req.body.quota, 10);
      const allowWalkIn: boolean | null = req.body.allowWalkIn === null ? null : !!req.body.allowWalkIn;
      const from = parseIsoDateTime(req.body.from);
      const to = parseIsoDateTime(req.body.to);

      if (!eventId) { return next(new ApiError("Missing EventID.")); }
      if (!details) { return next(new ApiError("Missing Event Session Name.")); }
      // if (!venue) { return next(new ApiError("Missing Venue.")); }
      if (quota < 0) { return next(new ApiError("Missing Event Session Quota.")); }
      // if (needPayment) {
      //   if (!price) { return next(new ApiError("Missing Price.")); }
      //   if (!price_eb) { return next(new ApiError("Missing Early Bird Price.")); }
      // }
      // if (from === null) { throw new ApiError("Start time (From) must be in ISO8601 format"); }
      // if (to === null) { throw new ApiError("End time (To) must be in ISO8601 format"); }

      const event = await EventSessionService.modify(
        req.session.data.me,
        id,
        eventId,
        venue,
        quota,
        // used,
        details,
        allowWalkIn,
        from,
        to
      );

      // // Refresh Session Data, especially me
      // req.session.data.me = await AuthnService.getMeSummary(
      //   req.session.data.me.netId
      // );

      return res.status(200).send(
        createApiResponse<EventSessionSummary>(null,
          {
            id: event.id,
            eventId: event.eventId,
            venue: event.venue,
            quota: event.quota,
            used: event.used,
            details: event.details,
            allowWalkIn: event.allowWalkIn,
            from: event.from,
            to: event.to,
            disabled: event.disabled,
          },
        )
      );
    } catch (err) {
      return next(err);
    }
  }
);

router.post(
  "/disable",
  requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id: string = parseStringInput(req.body.id);

      const event = await EventSessionService.disable(
        req.session.data.me,
        id,
      );

      // // Refresh Session Data, especially me
      // req.session.data.me = await AuthnService.getMeSummary(
      //   req.session.data.me.netId
      // );

      return res.status(200).send(
        createApiResponse<EventSessionSummary>(null,
          {
            id: event.id,
            eventId: event.eventId,
            venue: event.venue,
            quota: event.quota,
            used: event.used,
            details: event.details,
            allowWalkIn: event.allowWalkIn,
            from: event.from,
            to: event.to,
            disabled: event.disabled,
          },
        )
      );
    } catch (err) {
      return next(err);
    }
  }
);

function parseEventId(eventIdInput: any): number {
  if (!eventIdInput) {
    return null;
  }

  let eventId: number = null;

  try {
    eventId = Number.parseInt(eventIdInput, 10);
  } catch (err) {
    throw new ApiError("Invalid Event ID");
  }

  return eventId;
}

function parseStringInput(input: any): string {
  if (!input) {
    return null;
  }

  return String(input);
}

export default router;
