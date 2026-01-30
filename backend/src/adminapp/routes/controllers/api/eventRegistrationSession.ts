import express, { NextFunction, Request, Response } from "express";
import { requireRole } from "../../middlewares/authn";
import {
  createApiResponse,
  EventRegistrationFormSessionSummary,
  RoleLabel,
} from "../../../../models/model";
import * as eventRegistrationFormSession from "../../../../services/eventRegistrationFormSession";

const router = express.Router();

router.post("/search",
  requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]),
  async (req: Request, res: Response, next: NextFunction) => {
    // TODO: Search by department deptAbbr
    try {
      const id: string = parseStringInput(req.body.id);
      const eventId: string = parseStringInput(req.body.eventId);
      const formId: string = parseStringInput(req.body.formId);
      const sessionId: string = parseStringInput(req.body.sessionId);

      const eventSession = await eventRegistrationFormSession.search(
        req.session.data.me,
        { id, eventId, formId, sessionId }
      );
      return res
        .status(200)
        .send(createApiResponse<EventRegistrationFormSessionSummary[]>(null, eventSession));
    } catch (err) {
      return next(err);
    }
  }
);

function parseStringInput(input: any): string {
  if (!input) { return null; }
  return String(input);
}

export default router;