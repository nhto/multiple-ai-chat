import express, { NextFunction, Request, Response } from 'express';
import { requireRole } from '../../middlewares/authn';
import { createApiResponse, MeSummary, RoleLabel } from '../../../../models/model';
import { ApiError } from '../../../../models/error';
import { v4 as uuidv4 } from 'uuid';
import { AttendanceAttributes } from '../../../../repo/attendance';
import * as AttendanceService from '../../../../services/attendance';
import logger from '../../../../utilities/logger';
import { parseLocalDateTime, toLocalDateTime } from '../../../../utilities/date';
import { PaginationResult, parsePaginationRequest } from '../../../../utilities/pagination';

const router = express.Router();

router.post('/search',
  requireRole([RoleLabel.SystemAdmin, RoleLabel.Admin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // const paginationParam = parsePaginationRequest(req.body);
      const id: string = parseStringInput(req.body.id);
      const eventId: string = parseStringInput(req.body.eventId);
      const sessionId: string = parseStringInput(req.body.sessionId);
      const participantId: string = parseStringInput(req.body.participantId);
      const status: string = parseStringInput(req.body.status);
      const updatedBy: string = parseStringInput(req.body.updatedBy);

      const attendances = await AttendanceService.search(req.session.data.me,
        { id, eventId, sessionId, participantId, status, updatedBy });

      return res.status(200).send(createApiResponse<AttendanceAttributes[]>(null, attendances));
    } catch (err) {
      return next(err);
    }
  }
);

router.post('/exportAttendances',
  requireRole([RoleLabel.SystemAdmin, RoleLabel.Admin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const eventId: string = parseStringInput(req.body.eventId);

      console.log(req.body)
      console.log(eventId)

      const attendances = await AttendanceService.searchByEvent(req.session.data.me,
        { eventId });

      return res.status(200).send(createApiResponse<AttendanceAttributes[]>(null, attendances));
    } catch (err) {
      return next(err);
    }
  }
);

function parseEventId(eventIdInput: any): number {
  if (!eventIdInput) { return null; }
  let eventId: number = null;
  try { eventId = Number.parseInt(String(eventIdInput), 10); }
  catch (err) { throw new ApiError('Invalid Event ID'); }
  return eventId;
}

function parseStringInput(input: any): string {
  if (!input) { return null; }
  return String(input);
}

function parseStringOrStringArrayInput(input: any): string[] | string {
  if (!input) { return null; }

  const output: string[] | string = Array.isArray(input) ?
    input.map((item: any) => { return String(item) }) :
    String(input);

  return output;
}

export default router;

// router.post('/register', requireRole([RoleLabel.HoU, RoleLabel.HoUDelegate, RoleLabel.ServiceAdmin]), async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const eventId: number = parseEventId(req.body.eventId);
//     if (!eventId) { return next(new ApiError('Missing Event Date')); }

//     const netIds: string[] | string = parseStringOrStringArrayInput(req.body.netIds);
//     if (!netIds) { return next(new ApiError('Invalid NetID')); }

//     const deptAbbr: string = !!req.body.deptAbbr ? String(req.body.deptAbbr) : null;
//     if (!deptAbbr) { return next(new ApiError('Missing Department')); }

//     await AttendanceService.register(req.session.data.me, eventId, deptAbbr, Array.isArray(netIds) ? netIds : [netIds]);

//     return res.status(200).send(createApiResponse(`Registered ${eventId}`, null));
//   } catch (err) {
//     return next(err);
//   }
// });

// router.post('/attend', requireRole([RoleLabel.HoU, RoleLabel.HoUDelegate, RoleLabel.ServiceAdmin]), async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const eventId: number = parseEventId(req.body.eventId);

//     if (!eventId) {
//       return next(new ApiError('Missing Event Date'));
//     }

//     const userIds: string[] | string = parseStringOrStringArrayInput(req.body.userIds);

//     if (!userIds) {
//       return next(new ApiError('Invalid Univeristy ID'));
//     }

//     await AttendanceService.attend(req.session.data.me, eventId, Array.isArray(userIds) ? userIds : [userIds]);

//     return res.status(200).send(createApiResponse(`Marked attended ${eventId}`, null));
//   } catch (err) {
//     return next(err);
//   }
// });

// router.post('/unregister', requireRole([RoleLabel.HoU, RoleLabel.HoUDelegate, RoleLabel.ServiceAdmin]), async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const eventId: number = parseEventId(req.body.eventId);

//     if (!eventId) {
//       return next(new ApiError('Missing Event Date'));
//     }

//     const netIds: string[] | string = parseStringOrStringArrayInput(req.body.netIds);

//     if (!netIds) {
//       return next(new ApiError('Invalid NetID'));
//     }

//     await AttendanceService.unregister(req.session.data.me, eventId, Array.isArray(netIds) ? netIds : [netIds]);

//     return res.status(200).send(createApiResponse(`Unregistered ${eventId}`, null));
//   } catch (err) {
//     return next(err);
//   }
// });