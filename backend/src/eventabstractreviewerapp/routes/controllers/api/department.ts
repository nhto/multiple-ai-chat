import express, { NextFunction, Request, Response } from 'express';
// import { requireRole } from '../../middlewares/authn';
// import { createApiResponse, RoleLabel } from '../../../../models/model';

// import * as DepartmentService from '../../../../services/department';
// import { ApiError, apiInternalServerError } from '../../../../models/error';
// import { DepartmentAttributes } from '../../../../repo/department';
// import logger from '../../../../utilities/logger';

const router = express.Router();


// router.get('/', requireRole([RoleLabel.HoU, RoleLabel.HoUDelegate, RoleLabel.ServiceAdmin]), async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const departments = await DepartmentService.search();

//     const result: DepartmentAttributes[] = departments.map((dept) => {
//       return {
//         deptAbbr: dept.deptAbbr,
//         staffQuota: dept.staffQuota,
//         studentQuota: dept.studentQuota
//       }
//     });

//     return res.status(200).send(createApiResponse<DepartmentAttributes[]>(null, result));
//   } catch (err) {
//     return next(err);
//   }
// });

// router.get('/:deptAbbr', requireRole([RoleLabel.HoU, RoleLabel.HoUDelegate, RoleLabel.ServiceAdmin]), async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const deptAbbr: string = String(req.params.deptAbbr);

//     const departments = await DepartmentService.search(deptAbbr);

//     if (!departments || departments.length === 0) {
//       logger.warn(`Departments not found: ${deptAbbr}`);
//       throw new ApiError(`Department not exists: ${deptAbbr}`);
//     }
//     else if (departments.length === 1) {
//       return res.status(200).send(createApiResponse<DepartmentAttributes>(null, { deptAbbr, staffQuota: departments[0].staffQuota, studentQuota: departments[0].studentQuota }));
//     }
//     else {
//       logger.warn(`Multiple departments found: ${departments}`);
//       throw apiInternalServerError;
//     }

//   } catch (err) {
//     return next(err);
//   }
// });

// router.post('/:deptAbbr/set-quota', requireRole([RoleLabel.ServiceAdmin]), async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const deptAbbr: string = String(req.params.deptAbbr);
//     const staffQuota: number = Number.parseInt(req.body.staffQuota, 10);
//     const studentQuota: number = Number.parseInt(req.body.studentQuota, 10);

//     await DepartmentService.setQuota(deptAbbr, staffQuota, studentQuota);

//     return res.status(200).send(createApiResponse(`Quota updated: ${deptAbbr}`, null));
//   } catch (err) {
//     return next(err);
//   }
// });

// router.post('/:deptAbbr/delete', requireRole([RoleLabel.ServiceAdmin]), async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const deptAbbr: string = String(req.params.deptAbbr);

//     await DepartmentService.destroy(deptAbbr);

//     return res.status(200).send(createApiResponse(`Department deleted: ${deptAbbr}`, null));
//   } catch (err) {
//     return next(err);
//   }
// });


export default router;
