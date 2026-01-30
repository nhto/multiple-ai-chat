import express, { NextFunction, Request, Response } from 'express';
import { requireRole } from '../../middlewares/authn';
import { createApiResponse, RoleLabel, RoleUserSummary } from '../../../../models/model';
import { ApiError } from '../../../../models/error';
import * as RoleService from '../../../../services/role';
import { parseLocalDateTime } from '../../../../utilities/date';
import { parsePaginationRequest, PaginationResult } from '../../../../utilities/pagination';

const router = express.Router();

router.post('/search', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const roleLabel: string[] | string = parseStringOrStringArrayInput(req.body.roleLabel);
    const netId: string[] | string = parseStringOrStringArrayInput(req.body.netId);
    const eventId: string[] | string = parseStringOrStringArrayInput(req.body.eventId);

    const roleAssignments = await RoleService.search(req.session.data.me, { roleLabel, netId, eventId });

    return res.status(200).send(createApiResponse<RoleUserSummary[]>(null, roleAssignments));
  } catch (err) {
    return next(err);
  }
});

router.post('/assign', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const roleLabel: string = parseStringInput(req.body.roleLabel);
    const netId: string = parseStringInput(req.body.netId);
    const eventId: string = parseStringInput(req.body.eventId);

    if (!roleLabel) { return next(new ApiError('Missing Role Label.')); }
    if (!netId) { return next(new ApiError('Missing NetID.')); }
    if (!eventId) { return next(new ApiError('Missing EventId.')); }

    await RoleService.assign(req.session.data.me, roleLabel, netId, eventId);

    return res.status(200).send(createApiResponse(`Assigned role ${roleLabel} to ${netId}`, null));
  } catch (err) {
    return next(err);
  }
});

router.post('/revoke', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const roleLabel: string = parseStringInput(req.body.roleLabel);
    const netId: string = parseStringInput(req.body.netId);
    const eventId: string = parseStringInput(req.body.eventId);

    if (!roleLabel) { return next(new ApiError('Missing Role Label.')); }
    if (!netId) { return next(new ApiError('Missing NetID.')); }
    if (!eventId) { return next(new ApiError('Missing EventId.')); }

    await RoleService.revoke(req.session.data.me, roleLabel, netId, eventId);

    return res.status(200).send(createApiResponse(`Revoked role ${roleLabel} from ${netId}`, null));
  } catch (err) {
    return next(err);
  }
});

function parseEventDateTime(dateInput: any): Date {
  if (!dateInput) {
    return null;
  }

  let eventDateTime: Date = null;

  try {
    eventDateTime = parseLocalDateTime(String(dateInput));
  }
  catch (err) {
    throw new ApiError('Invalid Event Date');
  }

  return eventDateTime;
}


function parseStringInput(input: any): string {
  if (!input) {
    return null;
  }

  return String(input);
}


function parseIntInput(input: any): number {
  if (!input) {
    return NaN;
  }

  return parseInt(input, 10);
}

function parseStringOrStringArrayInput(input: any): string[] | string {
  if (!input) {
    return null;
  }

  const output: string[] | string = Array.isArray(input) ?
    input.map((item: any) => { return String(item) }) :
    String(input);

  return output;
}

export default router;