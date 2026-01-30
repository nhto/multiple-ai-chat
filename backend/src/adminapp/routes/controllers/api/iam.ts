import express, { NextFunction, Request, Response } from 'express';
import { requireRole } from "../../middlewares/authn";
import { createApiResponse, RoleLabel, } from "../../../../models/model";
import { ApiError } from '../../../../models/error';
import { getUserDetailsByNetId } from '../../../../utilities/iamapi'
import { User } from '../../../../models/model';

const router = express.Router();

router.post("/search", requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer]),
    async (req: Request, res: Response, next: NextFunction) => {
        // TODO: Search by department deptAbbr
        try {
            const netId: string = parseStringInput(req.body.netId);
            if (!netId) { return next(new ApiError("Missing NetID.")); }
            const response = await getUserDetailsByNetId(netId)
            return res.status(200).send(createApiResponse<User>(null, response));
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