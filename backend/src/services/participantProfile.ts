
import moment from 'moment';
import { Op } from "sequelize";
import { ApiError, apiUnauthorizedError } from '../models/error';

import { hasAnyRole } from "./authn";
import { MeSummary, RoleLabel, ParticipantProfileSummary } from '../models/model';
import { Participant } from '../repo/participant';
import { FileSubmission } from '../repo/fileSubmission';
import { ParticipantProfile, ParticipantProfileAttributes } from '../repo/participantProfile';

import * as iamapi from '../utilities/iamapi';
import logger from "../utilities/logger";

async function get(me: MeSummary, sub: NonNullable<string>): Promise<ParticipantProfileSummary> {
  if (!hasAnyRole(me, RoleLabel.User)) throw apiUnauthorizedError;
  if (!sub) throw new ApiError("Invalid sub.");

  const profile = await ParticipantProfile.findByPk(sub);

  const participant = await Participant.findOne({
    where: { sub },
    order: [['updatedAt', 'DESC']],
  });
  const abstract = await FileSubmission.findOne({
    where: { sub },
    order: [['updatedAt', 'DESC']],
  });

  if (!profile && !participant && !abstract) {
    const newProfile: ParticipantProfileSummary = {
      firstname: me.name.givenName,
      lastname: me.name.surname,
      email: me.email
    };
    if (me.userType === RoleLabel.Staff || me.userType === RoleLabel.Student) {
      const iamapiNetId = await iamapi.getIamDetailsByNetId(me.netId);
      newProfile.institution = "The Hong Kong Polytechnic University";
      newProfile.dept = iamapiNetId?.department;
      newProfile.officePhoneNumber = iamapiNetId?.officePhone;
      newProfile.position = iamapiNetId?.postTitle;
    }
    return await save(me, sub, newProfile);
  }
  else if (!profile && !!participant && (!abstract
    || moment(abstract?.updatedAt).valueOf() <= moment(participant?.updatedAt).valueOf())) {
    return await save(me, sub, participant);
  }
  else if (!profile && !!abstract && (!participant
    || moment(participant?.updatedAt).valueOf() <= moment(abstract?.updatedAt).valueOf())) {
    return await save(me, sub, abstract);
  }
  else if (!!profile && !!participant && (!abstract
    || moment(abstract?.updatedAt).valueOf() <= moment(participant?.updatedAt).valueOf())
    && moment(profile?.updatedAt).valueOf() < moment(participant?.updatedAt).valueOf()) {
    profile.title = participant.title;
    profile.firstname = participant.firstname;
    profile.lastname = participant.lastname;
    profile.email = participant.email;
    profile.yearOfGraduation = participant.yearOfGraduation;
    profile.graduationProgram = participant.graduationProgram;
    profile.graduationDept = participant.graduationDept;
    profile.position = participant.position;
    profile.institution = participant.institution;
    profile.dept = participant.dept;
    profile.address = participant.address;
    profile.country = participant.country;
    profile.officePhoneNumber = participant.officePhoneNumber;
    profile.mobilePhoneNumber = participant.mobilePhoneNumber;
    profile.updatedBy = me.netId;
    await profile.save();
  }
  else if (!!profile && !!abstract && (!participant
    || moment(participant?.updatedAt).valueOf() <= moment(abstract?.updatedAt).valueOf())
    && moment(profile?.updatedAt).valueOf() < moment(abstract?.updatedAt).valueOf()) {
    profile.title = abstract.title;
    profile.firstname = abstract.firstname;
    profile.lastname = abstract.lastname;
    profile.email = abstract.email;
    profile.yearOfGraduation = abstract.yearOfGraduation;
    profile.graduationProgram = abstract.graduationProgram;
    profile.graduationDept = abstract.graduationDept;
    profile.position = abstract.position;
    profile.institution = abstract.institution;
    profile.dept = abstract.dept;
    profile.address = abstract.address;
    profile.country = abstract.country;
    profile.officePhoneNumber = abstract.officePhoneNumber;
    profile.mobilePhoneNumber = abstract.mobilePhoneNumber;
    profile.updatedBy = me.netId;
    await profile.save();
  }

  return mapInputReturnValue(profile.get());
}

async function save(me: MeSummary, sub: NonNullable<string>, input: any): Promise<ParticipantProfileSummary> {
  if (!hasAnyRole(me, RoleLabel.User)) throw apiUnauthorizedError;
  if (!input) throw new ApiError("Invalid input.");

  const profile = await ParticipantProfile.findByPk(sub);
  if (!profile) {
    const newProfile = await ParticipantProfile.create({
      sub,
      netId: me.netId,
      title: input.title,
      firstname: input.firstname,
      lastname: input.lastname,
      email: input.email,
      yearOfGraduation: input.yearOfGraduation,
      graduationProgram: input.graduationProgram,
      graduationDept: input.graduationDept,
      position: input.position,
      institution: input.institution,
      dept: input.dept,
      address: input.address,
      country: input.country,
      officePhoneNumber: input.officePhoneNumber,
      mobilePhoneNumber: input.mobilePhoneNumber,
      createdBy: me.netId,
      updatedBy: me.netId,
    });

    logger.info(`Participant profile of ${me.netId} (Sub: ${sub}) has been created successfully.`);
    return mapInputReturnValue(newProfile.get());
  }
  else {
    profile.title = input.title;
    profile.firstname = input.firstname;
    profile.lastname = input.lastname;
    profile.email = input.email;
    profile.yearOfGraduation = input.yearOfGraduation;
    profile.graduationProgram = input.graduationProgram;
    profile.graduationDept = input.graduationDept;
    profile.position = input.position;
    profile.institution = input.institution;
    profile.dept = input.dept;
    profile.address = input.address;
    profile.country = input.country;
    profile.officePhoneNumber = input.officePhoneNumber;
    profile.mobilePhoneNumber = input.mobilePhoneNumber;
    profile.updatedBy = me.netId;
    await profile.save();

    logger.info(`Participant profile of ${me.netId} (Sub: ${sub}) has been updated successfully.`);
    return mapInputReturnValue(profile.get());
  }
}

function mapInputReturnValue(profile: ParticipantProfileAttributes): ParticipantProfileSummary {
  return {
    title: profile.title,
    firstname: profile.firstname,
    lastname: profile.lastname,
    email: profile.email,
    yearOfGraduation: profile.yearOfGraduation,
    graduationProgram: profile.graduationProgram,
    graduationDept: profile.graduationDept,
    position: profile.position,
    institution: profile.institution,
    dept: profile.dept,
    address: profile.address,
    country: profile.country,
    officePhoneNumber: profile.officePhoneNumber,
    mobilePhoneNumber: profile.mobilePhoneNumber,
  };
}

export { get, save };