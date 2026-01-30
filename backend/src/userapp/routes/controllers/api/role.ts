// import express, { NextFunction, Request, Response } from 'express';
// import { requireRole } from '../../middlewares/authn';
// import { createApiResponse, RoleLabel, RoleUserSummary } from '../../../../models/model';
// import { ApiError } from '../../../../models/error';
// import * as RoleService from '../../../../services/role';
// import { parseLocalDateTime } from '../../../../utilities/date';
// import { parsePaginationRequest, PaginationResult } from '../../../../utilities/pagination';

// const router = express.Router();

// router.post('/search', requireRole([RoleLabel.HoU, RoleLabel.HoUDelegate, RoleLabel.ServiceAdmin]), async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const paginationParam = parsePaginationRequest(req.body);
//     const roleLabel: string[] | string = parseStringOrStringArrayInput(req.body.roleLabel);
//     const netId: string[] | string = parseStringOrStringArrayInput(req.body.netId);
//     const roleDeptAbbr: string[] | string = parseStringOrStringArrayInput(req.body.roleDeptAbbr);

//     const roleAssignments = await RoleService.searchPaginated(req.session.data.me, {roleLabel, netId, roleDeptAbbr}, paginationParam);

//     return res.status(200).send(createApiResponse<PaginationResult<RoleUserSummary[]>>(null, roleAssignments));
//   } catch (err) {
//     return next(err);
//   }
// });

// router.post('/assign', requireRole([RoleLabel.HoU, RoleLabel.HoUDelegate, RoleLabel.ServiceAdmin]), async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const roleLabel: string = parseStringInput(req.body.roleLabel);
//     const netId: string = parseStringInput(req.body.netId);
//     const roleDeptAbbr: string = parseStringInput(req.body.roleDeptAbbr);

//     if (!roleLabel) {
//       return next(new ApiError('Missing Role Label.'));
//     }

//     if (!netId) {
//       return next(new ApiError('Missing NetID.'));
//     }

//     if (roleLabel === 'HoU' || roleLabel === "HoU Delegate") {
//       if (!roleDeptAbbr) {
//         return next(new ApiError('Missing Department.'));
//       }
//     }

//     await RoleService.assign(req.session.data.me, roleLabel, netId, roleDeptAbbr);

//     return res.status(200).send(createApiResponse(`Assigned role ${roleLabel} ${!!roleDeptAbbr ? roleDeptAbbr : ""} to ${netId}`, null));
//   } catch (err) {
//     return next(err);
//   }
// });

// router.post('/revoke', requireRole([RoleLabel.HoU, RoleLabel.HoUDelegate, RoleLabel.ServiceAdmin]), async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const roleLabel: string = parseStringInput(req.body.roleLabel);
//     const netId: string = parseStringInput(req.body.netId);
//     const roleDeptAbbr: string = parseStringInput(req.body.roleDeptAbbr);

//     if (!roleLabel) {
//       return next(new ApiError('Missing Role Label.'));
//     }

//     if (!netId) {
//       return next(new ApiError('Missing NetID.'));
//     }

//     if (roleLabel === 'HoU' || roleLabel === "HoU Delegate") {
//       if (!roleDeptAbbr) {
//         return next(new ApiError('Missing Department.'));
//       }
//     }

//     await RoleService.revoke(req.session.data.me, roleLabel, netId, roleDeptAbbr);

//     return res.status(200).send(createApiResponse(`Revoked role ${roleLabel} ${!!roleDeptAbbr ? roleDeptAbbr : ""} from ${netId}`, null));
//   } catch (err) {
//     return next(err);
//   }
// });

// function parseEventDateTime(dateInput: any): Date {
//   if (!dateInput) {
//     return null;
//   }

//   let eventDateTime: Date = null;

//   try {
//     eventDateTime = parseLocalDateTime(String(dateInput));
//   }
//   catch (err) {
//     throw new ApiError('Invalid Event Date');
//   }

//   return eventDateTime;
// }


// function parseStringInput(input: any): string {
//   if (!input) {
//     return null;
//   }

//   return String(input);
// }


// function parseIntInput(input: any): number {
//   if (!input) {
//     return NaN;
//   }

//   return parseInt(input, 10);
// }

// function parseStringOrStringArrayInput(input: any): string[] | string {
//   if (!input) {
//     return null;
//   }

//   const output: string[] | string = Array.isArray(input) ?
//     input.map((item: any) => { return String(item) }) :
//     String(input);

//   return output;
// }

// export default router;