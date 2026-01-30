import express, { NextFunction, Request, Response } from "express";
import { requireRole } from "../../middlewares/authn";
import * as config from "../../../../utilities/config";
import {
  createApiResponse,
  EventRegistrationSummary,
  AttendanceStatusLabel,
  RegistrationStatusLabel,
  PaymentStatusLabel,
  RoleLabel,
  UserTypesSummary
} from "../../../../models/model";
import * as EventRegistrationService from "../../../../services/eventRegistration";
import * as ParticipantService from "../../../../services/participant";
import * as ParticipantSessionService from "../../../../services/participantSession";
import { ApiError } from "../../../../models/error";
import { Event } from "../../../../repo/event";
import { EventRegistration } from "../../../../repo/eventRegistration";
import { EventSession } from "../../../../repo/eventSession";
import { Participant } from "../../../../repo/participant";
import { ParticipantSession } from "../../../../repo/participantSession";
import { FileCollection } from "../../../../repo/fileCollection";
import { AbstractReviewConfigs } from "../../../../repo/eventAbstractReviews";
import { sendEmail } from "../../../../utilities/email";

const router = express.Router();

router.post("/search", async (req: Request, res: Response, next: NextFunction) => {
  // TODO: Search by department deptAbbr
  try {
    const id: string = parseStringInput(req.body.id);
    const pathname: string = parseStringInput(req.body.pathname);

    const userTypes = {
      acceptAnyone: false,
      acceptStudent: false,
      acceptStaff: false,
      acceptAlumni: false,
      acceptGuest: false,
    }

    if (pathname.includes("file-submission")) {
      const collection = await FileCollection.findByPk(id);
      if (!!collection?.acceptedUserType) {
        const acceptedUserTypes = collection?.acceptedUserType?.split(":::");
        userTypes.acceptStudent = acceptedUserTypes?.includes(RoleLabel.Student);
        userTypes.acceptStaff = acceptedUserTypes?.includes(RoleLabel.Staff);
        userTypes.acceptAlumni = acceptedUserTypes?.includes(RoleLabel.Alumni);
        userTypes.acceptGuest = acceptedUserTypes?.includes(RoleLabel.Guests);
      }
    }
    else if(pathname.includes("abstract-submission")){
      userTypes.acceptAnyone = true;
      userTypes.acceptStudent = true;
      userTypes.acceptStaff = true;
      userTypes.acceptAlumni = true;
      userTypes.acceptGuest = true;
    }
    else if(pathname.includes("endorse-comment") || pathname.includes("under-discussion") || pathname.includes("paper-submission")){
      userTypes.acceptAnyone = true;
      userTypes.acceptStudent = true;
      userTypes.acceptStaff = true;
      userTypes.acceptAlumni = true;
      userTypes.acceptGuest = true;
    }
    else {
      const event = await EventRegistration.findOne({
        where: { id }
      });
      // if (!event) { throw new ApiError("Registration Form Not Found"); }

      userTypes.acceptAnyone = event?.acceptAnyone;
      userTypes.acceptStudent = event?.acceptStudent;
      userTypes.acceptStaff = event?.acceptStaff;
      userTypes.acceptAlumni = event?.acceptAlumni;
      userTypes.acceptGuest = event?.acceptGuest;
    }

    return res.status(200).send(createApiResponse<UserTypesSummary>(null, userTypes));
  } catch (err) {
    return next(err);
  }
}
);

function parseStringInput(input: any): string {
  if (!input) {
    return null;
  }

  return String(input);
}

export default router;
