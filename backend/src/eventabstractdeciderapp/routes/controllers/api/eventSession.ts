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
import * as AuthnService from "../../../../services/authn";

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
          },
        ])
      );
    } catch (err) {
      return next(err);
    }
  }
);

// router.post(
//   "/modify",
//   requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer]),
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const id: string = parseStringInput(req.body.id);
//       const topic: string = parseStringInput(req.body.topic);
//       const subtopic: string = parseStringInput(req.body.subtopic);
//       const start = parseIsoDateTime(String(req.body.start));
//       const end = parseIsoDateTime(String(req.body.end));
//       const remark: string = parseStringInput(req.body.remark);
//       const contactName: string = parseStringInput(req.body.contactName);
//       const contactEmail: string = parseStringInput(req.body.contactEmail);
//       const contactPhoneNumber: string = parseStringInput(
//         req.body.contactPhoneNumber
//       );
//       const banner: Buffer = !!req.body.banner
//         ? Buffer.from(req.body.banner, "utf8")
//         : null;

//       if (!topic) {
//         return next(new ApiError("Missing Role Label."));
//       }
//       if (start === null) {
//         throw new ApiError("Start time must be in ISO8601 format");
//       }
//       if (end === null) {
//         throw new ApiError("End time must be in ISO8601 format");
//       }
//       if (!contactName) {
//         return next(new ApiError("Missing Contact Name."));
//       }
//       if (!contactEmail) {
//         return next(new ApiError("Missing Contact Email."));
//       }
//       if (!contactPhoneNumber) {
//         return next(new ApiError("Missing Contact Phone Number."));
//       }

//       const event = await EventService.modify(
//         req.session.data.me,
//         id,
//         topic,
//         subtopic,
//         remark,
//         contactName,
//         contactEmail,
//         contactPhoneNumber,
//         banner
//       );

//       // Refresh Session Data, especially me
//       req.session.data.me = await AuthnService.getMeSummary(
//         req.session.data.me.netId
//       );

//       return res.status(200).send(
//         createApiResponse<EventAttributes[]>(null, [
//           {
//             id: event.id,
//             topic: event.topic,
//             subtopic: event.subtopic,
//             remark: event.remark,
//             contactName: event.contactName,
//             contactEmail: event.contactEmail,
//             contactPhoneNumber: event.contactPhoneNumber,
//             banner: event.banner,
//           },
//         ])
//       );
//     } catch (err) {
//       return next(err);
//     }
//   }
// );

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
