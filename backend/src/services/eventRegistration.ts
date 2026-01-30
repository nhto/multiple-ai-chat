import {
  Op,
  WhereOptions,
  WhereValue,
  literal,
  WhereAttributeHash,
} from "sequelize";
import * as config from "../utilities/config";
import { ApiError, apiUnauthorizedError } from "../models/error";
import {
  EventSummary,
  MeSummary,
  RoleLabel,
  EventRegistrationSummary,
} from "../models/model";
import { hasAnyRole } from "./authn";
import { Event, EventAttributes } from "../repo/event";
import {
  EventRegistration,
  EventRegistrationAttributes,
} from "../repo/eventRegistration";
import { CustomPaymentItem } from "../repo/customPaymentItem";
import { Participant } from "../repo/participant";
import { ParticipantAttachments } from "../repo/participantAttachments";
import { EventSession } from "../repo/eventSession";
import { EventRegistrationFormSession } from "../repo/eventRegistrationFormSession";
import * as s3 from "../utilities/s3client";

async function search(
  me: MeSummary,
  filter?: {
    id?: string;
    eventId?: string;
    topic?: string;
    subtopic?: string;
    start?: Date;
    earlyBirdEnd?: Date;
    end?: Date;
    containPosition?: string;
    containInstitution?: string;
    containDept?: string;
    containAddress?: string;
    containCountry?: string;
    containOfficePhoneNumber?: string;
    containMobilePhoneNumber?: string;
    containPayment?: boolean;
    sendEmail?: boolean;
  }
): Promise<EventRegistrationSummary[]> {
  const eventWhereOptions: WhereOptions<EventRegistrationAttributes> = {};
  // const departmentWhereOptions: WhereOptions<DepartmentAttributes> = {};

  if (!!filter?.id) { eventWhereOptions.id = filter.id; }
  if (!!filter?.eventId) { eventWhereOptions.eventId = filter.eventId; }
  if (!!filter?.topic) { eventWhereOptions.topic = filter.topic; }
  if (!!filter?.subtopic) { eventWhereOptions.subtopic = filter.subtopic; }
  if (!!filter?.start) { eventWhereOptions.start = filter.start; }
  if (!!filter?.earlyBirdEnd) { eventWhereOptions.earlyBirdEnd = filter.earlyBirdEnd; }
  if (!!filter?.end) { eventWhereOptions.end = filter.end; }
  if (!!filter?.containPosition) { eventWhereOptions.containPosition = filter.containPosition; }
  if (!!filter?.containInstitution) { eventWhereOptions.containInstitution = filter.containInstitution; }
  if (!!filter?.containDept) { eventWhereOptions.containDept = filter.containDept; }
  if (!!filter?.containAddress) { eventWhereOptions.containAddress = filter.containAddress; }
  if (!!filter?.containCountry) { eventWhereOptions.containCountry = filter.containCountry; }
  if (!!filter?.containOfficePhoneNumber) { eventWhereOptions.containOfficePhoneNumber = filter.containOfficePhoneNumber; }
  if (!!filter?.containMobilePhoneNumber) { eventWhereOptions.containMobilePhoneNumber = filter.containMobilePhoneNumber; }

  const forms = await EventRegistration.findAll({
    where: {
      [Op.and]: [evalReadAcl(me), eventWhereOptions],
    } as WhereAttributeHash,
    include: [{
      model: EventRegistrationFormSession,
      as: 'eventRegistrationFormSession',
      include: [{
        model: EventSession,
        as: 'eventSession'
      }]
    }, {
      model: CustomPaymentItem,
      as: 'paymentTitle1Obj',
    }, {
      model: CustomPaymentItem,
      as: 'paymentTitle2Obj',
    }, {
      model: CustomPaymentItem,
      as: 'paymentTitle3Obj',
    }, {
      model: CustomPaymentItem,
      as: 'paymentTitle4Obj',
    }, {
      model: CustomPaymentItem,
      as: 'paymentTitle5Obj',
    }, {
      model: CustomPaymentItem,
      as: 'paymentTitle6Obj',
    }, {
      model: CustomPaymentItem,
      as: 'paymentTitle7Obj',
    }, {
      model: CustomPaymentItem,
      as: 'paymentTitle8Obj',
    }, {
      model: CustomPaymentItem,
      as: 'paymentTitle9Obj',
    }, {
      model: CustomPaymentItem,
      as: 'paymentTitle10Obj',
    },],
  });

  return forms.map((form) => {
    const paymentTitleQuantityEnables = JSON.parse(form.paymentTitleQuantityEnables);

    return {
      id: form.id,
      eventId: form.eventId,
      disabled: form.disabled,
      topic: form.topic,
      subtopic: form.subtopic,
      start: form.start,
      earlyBirdEnd: form.earlyBirdEnd,
      end: form.end,
      description: form.description,
      acceptAnyone: form.acceptAnyone,
      acceptAlumni: form.acceptAlumni,
      acceptStudent: form.acceptStudent,
      acceptStaff: form.acceptStaff,
      acceptGuest: form.acceptGuest,
      banner: form.banner ? form.banner.toString("utf8") : "",
      bannerAltText: form.bannerAltText,
      bannerHyperlink: form.bannerHyperlink,
      pics: form.pics,
      picsAcceptBox: form.picsAcceptBox,
      picsAcceptBoxMsg: form.picsAcceptBoxMsg,
      marketingAcceptBox: form.marketingAcceptBox,
      marketingAcceptBoxMsg: form.marketingAcceptBoxMsg,
      containPosition: form.containPosition,
      containInstitution: form.containInstitution,
      containDept: form.containDept,
      containAddress: form.containAddress,
      containCountry: form.containCountry,
      containOfficePhoneNumber: form.containOfficePhoneNumber,
      containMobilePhoneNumber: form.containMobilePhoneNumber,
      containAttachment: form.containAttachment,
      containPayment: form.containPayment,
      paymentCode: form.paymentCode,
      containPaymentTitle1: form.containPaymentTitle1,
      paymentTitle1: form.paymentTitle1,
      paymentTitle1Obj: form?.paymentTitle1Obj,
      paymentTitle1Price: form.paymentTitle1Price,
      paymentTitle1Price_EB: form.paymentTitle1Price_EB,
      containPaymentTitle2: form.containPaymentTitle2,
      paymentTitle2: form.paymentTitle2,
      paymentTitle2Obj: form?.paymentTitle2Obj,
      paymentTitle2Price: form.paymentTitle2Price,
      paymentTitle2Price_EB: form.paymentTitle2Price_EB,
      containPaymentTitle3: form.containPaymentTitle3,
      paymentTitle3: form.paymentTitle3,
      paymentTitle3Obj: form?.paymentTitle3Obj,
      paymentTitle3Price: form.paymentTitle3Price,
      paymentTitle3Price_EB: form.paymentTitle3Price_EB,
      containPaymentTitle4: form.containPaymentTitle4,
      paymentTitle4: form.paymentTitle4,
      paymentTitle4Obj: form?.paymentTitle4Obj,
      paymentTitle4Price: form.paymentTitle4Price,
      paymentTitle4Price_EB: form.paymentTitle4Price_EB,
      containPaymentTitle5: form.containPaymentTitle5,
      paymentTitle5: form.paymentTitle5,
      paymentTitle5Obj: form?.paymentTitle5Obj,
      paymentTitle5Price: form.paymentTitle5Price,
      paymentTitle5Price_EB: form.paymentTitle5Price_EB,
      containPaymentTitle6: form.containPaymentTitle6,
      paymentTitle6: form.paymentTitle6,
      paymentTitle6Obj: form?.paymentTitle6Obj,
      paymentTitle6Price: form.paymentTitle6Price,
      paymentTitle6Price_EB: form.paymentTitle6Price_EB,
      containPaymentTitle7: form.containPaymentTitle7,
      paymentTitle7: form.paymentTitle7,
      paymentTitle7Obj: form?.paymentTitle7Obj,
      paymentTitle7Price: form.paymentTitle7Price,
      paymentTitle7Price_EB: form.paymentTitle7Price_EB,
      containPaymentTitle8: form.containPaymentTitle8,
      paymentTitle8: form.paymentTitle8,
      paymentTitle8Obj: form?.paymentTitle8Obj,
      paymentTitle8Price: form.paymentTitle8Price,
      paymentTitle8Price_EB: form.paymentTitle8Price_EB,
      containPaymentTitle9: form.containPaymentTitle9,
      paymentTitle9: form.paymentTitle9,
      paymentTitle9Obj: form?.paymentTitle9Obj,
      paymentTitle9Price: form.paymentTitle9Price,
      paymentTitle9Price_EB: form.paymentTitle9Price_EB,
      containPaymentTitle10: form.containPaymentTitle10,
      paymentTitle10: form.paymentTitle10,
      paymentTitle10Obj: form?.paymentTitle10Obj,
      paymentTitle10Price: form.paymentTitle10Price,
      paymentTitle10Price_EB: form.paymentTitle10Price_EB,
      paymentTitle1Mandatory: form.paymentTitle1Mandatory,
      paymentTitle2Mandatory: form.paymentTitle2Mandatory,
      paymentTitle3Mandatory: form.paymentTitle3Mandatory,
      paymentTitle4Mandatory: form.paymentTitle4Mandatory,
      paymentTitle5Mandatory: form.paymentTitle5Mandatory,
      paymentTitle6Mandatory: form.paymentTitle6Mandatory,
      paymentTitle7Mandatory: form.paymentTitle7Mandatory,
      paymentTitle8Mandatory: form.paymentTitle8Mandatory,
      paymentTitle9Mandatory: form.paymentTitle9Mandatory,
      paymentTitle10Mandatory: form.paymentTitle10Mandatory,
      eventRegistrationFormSession: form.eventRegistrationFormSession,
      customQuestions: form.customQuestions,
      successfulMsgtoReg: form.successfulMsgtoReg,
      successfulMsgtoWaitingList: form.successfulMsgtoWaitingList,
      sendEmail: form.sendEmail,
      emailFrom: form.emailFrom,
      emailBcc: form.emailBcc,
      emailSubjectSuccessfulReg: form.emailSubjectSuccessfulReg,
      emailDetailsSuccessfulReg: form.emailDetailsSuccessfulReg,
      emailSubjectSuccessfulWaiting: form.emailSubjectSuccessfulWaiting,
      emailDetailsSuccessfulWaiting: form.emailDetailsSuccessfulWaiting,
      err_msg_userType: form.err_msg_userType,
      err_msg_quotaExceed: form.err_msg_quotaExceed,
      limitItemCount: form.limitItemCount,
      minItemCount: form.minItemCount,
      maxItemCount: form.maxItemCount,
      paymentTitle1QuantityEnable: paymentTitleQuantityEnables ? paymentTitleQuantityEnables[0] ?? null : null,
      paymentTitle2QuantityEnable: paymentTitleQuantityEnables ? paymentTitleQuantityEnables[1] ?? null : null,
      paymentTitle3QuantityEnable: paymentTitleQuantityEnables ? paymentTitleQuantityEnables[2] ?? null : null,
      paymentTitle4QuantityEnable: paymentTitleQuantityEnables ? paymentTitleQuantityEnables[3] ?? null : null,
      paymentTitle5QuantityEnable: paymentTitleQuantityEnables ? paymentTitleQuantityEnables[4] ?? null : null,
      paymentTitle6QuantityEnable: paymentTitleQuantityEnables ? paymentTitleQuantityEnables[5] ?? null : null,
      paymentTitle7QuantityEnable: paymentTitleQuantityEnables ? paymentTitleQuantityEnables[6] ?? null : null,
      paymentTitle8QuantityEnable: paymentTitleQuantityEnables ? paymentTitleQuantityEnables[7] ?? null : null,
      paymentTitle9QuantityEnable: paymentTitleQuantityEnables ? paymentTitleQuantityEnables[8] ?? null : null,
      paymentTitle10QuantityEnable: paymentTitleQuantityEnables ? paymentTitleQuantityEnables[9] ?? null : null,

      isSessionCountLimit: form.limitSession,
      minSessionCount: form.minSession,
      maxSessionCount: form.maxSession,

      createdAt: form.createdAt,
      updatedAt: form.updatedAt,
      updatedBy: form.updatedBy,
    };
  });
}

async function create(
  me: MeSummary,
  eventId: string,
  topic: string,
  subtopic: string,
  start: Date,
  end: Date,
  description: string,
  acceptAnyone: boolean,
  acceptAlumni: boolean,
  acceptStudent: boolean,
  acceptStaff: boolean,
  acceptGuest: boolean,
  banner: Buffer,
  bannerAltText: string,
  bannerHyperlink: string,
  pics: string,
  picsAcceptBox: boolean,
  picsAcceptBoxMsg: string,
  marketingAcceptBox: boolean,
  marketingAcceptBoxMsg: string,
  containPosition: string,
  containInstitution: string,
  containDept: string,
  containAddress: string,
  containCountry: string,
  containOfficePhoneNumber: string,
  containMobilePhoneNumber: string,
  containAttachment: string,
  containPayment: boolean,
  paymentCode: string,
  earlyBirdEnd: Date,
  containPaymentTitle1: boolean,
  paymentTitle1: string,
  paymentTitle1Price: number,
  paymentTitle1Price_EB: number,
  containPaymentTitle2: boolean,
  paymentTitle2: string,
  paymentTitle2Price: number,
  paymentTitle2Price_EB: number,
  containPaymentTitle3: boolean,
  paymentTitle3: string,
  paymentTitle3Price: number,
  paymentTitle3Price_EB: number,
  containPaymentTitle4: boolean,
  paymentTitle4: string,
  paymentTitle4Price: number,
  paymentTitle4Price_EB: number,
  containPaymentTitle5: boolean,
  paymentTitle5: string,
  paymentTitle5Price: number,
  paymentTitle5Price_EB: number,
  containPaymentTitle6: boolean,
  paymentTitle6: string,
  paymentTitle6Price: number,
  paymentTitle6Price_EB: number,
  containPaymentTitle7: boolean,
  paymentTitle7: string,
  paymentTitle7Price: number,
  paymentTitle7Price_EB: number,
  containPaymentTitle8: boolean,
  paymentTitle8: string,
  paymentTitle8Price: number,
  paymentTitle8Price_EB: number,
  containPaymentTitle9: boolean,
  paymentTitle9: string,
  paymentTitle9Price: number,
  paymentTitle9Price_EB: number,
  containPaymentTitle10: boolean,
  paymentTitle10: string,
  paymentTitle10Price: number,
  paymentTitle10Price_EB: number,
  paymentTitle1Mandatory: boolean,
  paymentTitle2Mandatory: boolean,
  paymentTitle3Mandatory: boolean,
  paymentTitle4Mandatory: boolean,
  paymentTitle5Mandatory: boolean,
  paymentTitle6Mandatory: boolean,
  paymentTitle7Mandatory: boolean,
  paymentTitle8Mandatory: boolean,
  paymentTitle9Mandatory: boolean,
  paymentTitle10Mandatory: boolean,
  customQuestions: string,
  successfulMsgtoReg: string,
  successfulMsgtoWaitingList: string,
  sendEmail: boolean,
  emailFrom: string,
  emailBcc: string,
  emailSubjectSuccessfulReg: string,
  emailDetailsSuccessfulReg: string,
  emailSubjectSuccessfulWaiting: string,
  emailDetailsSuccessfulWaiting: string,
  err_msg_userType: string,
  err_msg_quotaExceed: string,
  limitItemCount: boolean,
  minItemCount: number,
  maxItemCount: number,
  paymentTitle1QuantityEnable: boolean,
  paymentTitle2QuantityEnable: boolean,
  paymentTitle3QuantityEnable: boolean,
  paymentTitle4QuantityEnable: boolean,
  paymentTitle5QuantityEnable: boolean,
  paymentTitle6QuantityEnable: boolean,
  paymentTitle7QuantityEnable: boolean,
  paymentTitle8QuantityEnable: boolean,
  paymentTitle9QuantityEnable: boolean,
  paymentTitle10QuantityEnable: boolean,
  isSessionCountLimit: boolean,
  minSessionCount: number,
  maxSessionCount: number
): Promise<EventRegistrationAttributes> {
  if (!canUpdate(me)) { throw apiUnauthorizedError; }

  // const eventRegistrationCount = await EventRegistration.count({ where: { topic, start, end } });
  // if (eventRegistrationCount > 0) { throw new ApiError(`Event already exists!`); }

  const paymentTitleQuantityEnablesArray = [
    paymentTitle1QuantityEnable,
    paymentTitle2QuantityEnable,
    paymentTitle3QuantityEnable,
    paymentTitle4QuantityEnable,
    paymentTitle5QuantityEnable,
    paymentTitle6QuantityEnable,
    paymentTitle7QuantityEnable,
    paymentTitle8QuantityEnable,
    paymentTitle9QuantityEnable,
    paymentTitle10QuantityEnable,
  ];
  const paymentTitleQuantityEnables = JSON.stringify(paymentTitleQuantityEnablesArray);
  let eventRegistration;
  if (!banner) {
    eventRegistration = await EventRegistration.create({
      eventId,
      disabled: false,
      topic,
      subtopic,
      start,
      end,
      description,
      acceptAnyone,
      acceptAlumni,
      acceptStudent,
      acceptStaff,
      acceptGuest,
      bannerAltText,
      bannerHyperlink,
      pics,
      picsAcceptBox,
      picsAcceptBoxMsg,
      marketingAcceptBox,
      marketingAcceptBoxMsg,
      containPosition,
      containInstitution,
      containDept,
      containAddress,
      containCountry,
      containOfficePhoneNumber,
      containMobilePhoneNumber,
      containAttachment,
      containPayment,
      paymentCode,
      earlyBirdEnd,
      containPaymentTitle1,
      paymentTitle1,
      paymentTitle1Price,
      paymentTitle1Price_EB,
      containPaymentTitle2,
      paymentTitle2,
      paymentTitle2Price,
      paymentTitle2Price_EB,
      containPaymentTitle3,
      paymentTitle3,
      paymentTitle3Price,
      paymentTitle3Price_EB,
      containPaymentTitle4,
      paymentTitle4,
      paymentTitle4Price,
      paymentTitle4Price_EB,
      containPaymentTitle5,
      paymentTitle5,
      paymentTitle5Price,
      paymentTitle5Price_EB,
      containPaymentTitle6,
      paymentTitle6,
      paymentTitle6Price,
      paymentTitle6Price_EB,
      containPaymentTitle7,
      paymentTitle7,
      paymentTitle7Price,
      paymentTitle7Price_EB,
      containPaymentTitle8,
      paymentTitle8,
      paymentTitle8Price,
      paymentTitle8Price_EB,
      containPaymentTitle9,
      paymentTitle9,
      paymentTitle9Price,
      paymentTitle9Price_EB,
      containPaymentTitle10,
      paymentTitle10,
      paymentTitle10Price,
      paymentTitle10Price_EB,
      paymentTitle1Mandatory,
      paymentTitle2Mandatory,
      paymentTitle3Mandatory,
      paymentTitle4Mandatory,
      paymentTitle5Mandatory,
      paymentTitle6Mandatory,
      paymentTitle7Mandatory,
      paymentTitle8Mandatory,
      paymentTitle9Mandatory,
      paymentTitle10Mandatory,
      customQuestions,
      successfulMsgtoReg,
      successfulMsgtoWaitingList,
      sendEmail,
      emailFrom,
      emailBcc,
      emailSubjectSuccessfulReg,
      emailDetailsSuccessfulReg,
      emailSubjectSuccessfulWaiting,
      emailDetailsSuccessfulWaiting,
      err_msg_userType,
      err_msg_quotaExceed,
      limitItemCount,
      minItemCount,
      maxItemCount,
      paymentTitleQuantityEnables,
      updatedBy: me.netId,
      limitSession: isSessionCountLimit,
      minSession: minSessionCount,
      maxSession: maxSessionCount,
    });
  } else {
    eventRegistration = await EventRegistration.create({
      eventId,
      disabled: false,
      topic,
      subtopic,
      start,
      end,
      description,
      acceptAnyone,
      acceptAlumni,
      acceptStudent,
      acceptStaff,
      acceptGuest,
      banner,
      bannerAltText,
      bannerHyperlink,
      pics,
      picsAcceptBox,
      picsAcceptBoxMsg,
      marketingAcceptBox,
      marketingAcceptBoxMsg,
      containPosition,
      containInstitution,
      containDept,
      containAddress,
      containCountry,
      containOfficePhoneNumber,
      containMobilePhoneNumber,
      containAttachment,
      containPayment,
      paymentCode,
      earlyBirdEnd,
      containPaymentTitle1,
      paymentTitle1,
      paymentTitle1Price,
      paymentTitle1Price_EB,
      containPaymentTitle2,
      paymentTitle2,
      paymentTitle2Price,
      paymentTitle2Price_EB,
      containPaymentTitle3,
      paymentTitle3,
      paymentTitle3Price,
      paymentTitle3Price_EB,
      containPaymentTitle4,
      paymentTitle4,
      paymentTitle4Price,
      paymentTitle4Price_EB,
      containPaymentTitle5,
      paymentTitle5,
      paymentTitle5Price,
      paymentTitle5Price_EB,
      containPaymentTitle6,
      paymentTitle6,
      paymentTitle6Price,
      paymentTitle6Price_EB,
      containPaymentTitle7,
      paymentTitle7,
      paymentTitle7Price,
      paymentTitle7Price_EB,
      containPaymentTitle8,
      paymentTitle8,
      paymentTitle8Price,
      paymentTitle8Price_EB,
      containPaymentTitle9,
      paymentTitle9,
      paymentTitle9Price,
      paymentTitle9Price_EB,
      containPaymentTitle10,
      paymentTitle10,
      paymentTitle10Price,
      paymentTitle10Price_EB,
      paymentTitle1Mandatory,
      paymentTitle2Mandatory,
      paymentTitle3Mandatory,
      paymentTitle4Mandatory,
      paymentTitle5Mandatory,
      paymentTitle6Mandatory,
      paymentTitle7Mandatory,
      paymentTitle8Mandatory,
      paymentTitle9Mandatory,
      paymentTitle10Mandatory,
      customQuestions,
      successfulMsgtoReg,
      successfulMsgtoWaitingList,
      sendEmail,
      emailFrom,
      emailBcc,
      emailSubjectSuccessfulReg,
      emailDetailsSuccessfulReg,
      emailSubjectSuccessfulWaiting,
      emailDetailsSuccessfulWaiting,
      err_msg_userType,
      err_msg_quotaExceed,
      limitItemCount,
      minItemCount,
      maxItemCount,
      paymentTitleQuantityEnables,
      updatedBy: me.netId,
      limitSession: isSessionCountLimit,
      minSession: minSessionCount,
      maxSession: maxSessionCount,
    });
  }
  return eventRegistration.get();
}

async function modify(
  me: MeSummary,
  id: string,
  eventId: string,
  disabled: boolean,
  topic: string,
  subtopic: string,
  start: Date,
  end: Date,
  description: string,
  acceptAnyone: boolean,
  acceptAlumni: boolean,
  acceptStudent: boolean,
  acceptStaff: boolean,
  acceptGuest: boolean,
  banner: Buffer,
  bannerAltText: string,
  bannerHyperlink: string,
  pics: string,
  picsAcceptBox: boolean,
  picsAcceptBoxMsg: string,
  marketingAcceptBox: boolean,
  marketingAcceptBoxMsg: string,
  containPosition: string,
  containInstitution: string,
  containDept: string,
  containAddress: string,
  containCountry: string,
  containOfficePhoneNumber: string,
  containMobilePhoneNumber: string,
  containAttachment: string,
  containPayment: boolean,
  paymentCode: string,
  earlyBirdEnd: Date,
  containPaymentTitle1: boolean,
  paymentTitle1: string,
  paymentTitle1Price: number,
  paymentTitle1Price_EB: number,
  containPaymentTitle2: boolean,
  paymentTitle2: string,
  paymentTitle2Price: number,
  paymentTitle2Price_EB: number,
  containPaymentTitle3: boolean,
  paymentTitle3: string,
  paymentTitle3Price: number,
  paymentTitle3Price_EB: number,
  containPaymentTitle4: boolean,
  paymentTitle4: string,
  paymentTitle4Price: number,
  paymentTitle4Price_EB: number,
  containPaymentTitle5: boolean,
  paymentTitle5: string,
  paymentTitle5Price: number,
  paymentTitle5Price_EB: number,
  containPaymentTitle6: boolean,
  paymentTitle6: string,
  paymentTitle6Price: number,
  paymentTitle6Price_EB: number,
  containPaymentTitle7: boolean,
  paymentTitle7: string,
  paymentTitle7Price: number,
  paymentTitle7Price_EB: number,
  containPaymentTitle8: boolean,
  paymentTitle8: string,
  paymentTitle8Price: number,
  paymentTitle8Price_EB: number,
  containPaymentTitle9: boolean,
  paymentTitle9: string,
  paymentTitle9Price: number,
  paymentTitle9Price_EB: number,
  containPaymentTitle10: boolean,
  paymentTitle10: string,
  paymentTitle10Price: number,
  paymentTitle10Price_EB: number,
  paymentTitle1Mandatory: boolean,
  paymentTitle2Mandatory: boolean,
  paymentTitle3Mandatory: boolean,
  paymentTitle4Mandatory: boolean,
  paymentTitle5Mandatory: boolean,
  paymentTitle6Mandatory: boolean,
  paymentTitle7Mandatory: boolean,
  paymentTitle8Mandatory: boolean,
  paymentTitle9Mandatory: boolean,
  paymentTitle10Mandatory: boolean,
  customQuestions: string,
  successfulMsgtoReg: string,
  successfulMsgtoWaitingList: string,
  sendEmail: boolean,
  emailFrom: string,
  emailBcc: string,
  emailSubjectSuccessfulReg: string,
  emailDetailsSuccessfulReg: string,
  emailSubjectSuccessfulWaiting: string,
  emailDetailsSuccessfulWaiting: string,
  err_msg_userType: string,
  err_msg_quotaExceed: string,
  limitItemCount: boolean,
  minItemCount: number,
  maxItemCount: number,
  paymentTitle1QuantityEnable: boolean,
  paymentTitle2QuantityEnable: boolean,
  paymentTitle3QuantityEnable: boolean,
  paymentTitle4QuantityEnable: boolean,
  paymentTitle5QuantityEnable: boolean,
  paymentTitle6QuantityEnable: boolean,
  paymentTitle7QuantityEnable: boolean,
  paymentTitle8QuantityEnable: boolean,
  paymentTitle9QuantityEnable: boolean,
  paymentTitle10QuantityEnable: boolean,
  isSessionCountLimit: boolean,
  minSessionCount: number,
  maxSessionCount: number
): Promise<EventRegistrationAttributes> {
  if (!canUpdate(me)) { throw apiUnauthorizedError; }

  const eventReg = await EventRegistration.findOne({ where: { id, eventId } });
  if (!eventReg) { throw new ApiError(`Event Registration Form not found!`); }

  const paymentTitleQuantityEnablesArray = [
    paymentTitle1QuantityEnable,
    paymentTitle2QuantityEnable,
    paymentTitle3QuantityEnable,
    paymentTitle4QuantityEnable,
    paymentTitle5QuantityEnable,
    paymentTitle6QuantityEnable,
    paymentTitle7QuantityEnable,
    paymentTitle8QuantityEnable,
    paymentTitle9QuantityEnable,
    paymentTitle10QuantityEnable,
  ];
  const paymentTitleQuantityEnables = JSON.stringify(paymentTitleQuantityEnablesArray);

  // eventReg.disabled = disabled;
  eventReg.topic = topic;
  eventReg.subtopic = subtopic;
  eventReg.start = start;
  eventReg.end = end;
  eventReg.description = description;
  eventReg.acceptAnyone = acceptAnyone;
  eventReg.acceptAlumni = acceptAlumni;
  eventReg.acceptStudent = acceptStudent;
  eventReg.acceptStaff = acceptStaff;
  eventReg.acceptGuest = acceptGuest;
  eventReg.banner = banner;
  eventReg.bannerAltText = bannerAltText;
  eventReg.bannerHyperlink = bannerHyperlink;
  eventReg.pics = pics;
  eventReg.picsAcceptBox = picsAcceptBox;
  eventReg.picsAcceptBoxMsg = picsAcceptBoxMsg;
  eventReg.marketingAcceptBox = marketingAcceptBox;
  eventReg.marketingAcceptBoxMsg = marketingAcceptBoxMsg;
  eventReg.containPosition = containPosition;
  eventReg.containInstitution = containInstitution;
  eventReg.containDept = containDept;
  eventReg.containAddress = containAddress;
  eventReg.containCountry = containCountry;
  eventReg.containOfficePhoneNumber = containOfficePhoneNumber;
  eventReg.containMobilePhoneNumber = containMobilePhoneNumber;
  eventReg.containAttachment = containAttachment;
  eventReg.containPayment = containPayment;
  eventReg.paymentCode = paymentCode;
  eventReg.earlyBirdEnd = earlyBirdEnd;
  eventReg.containPaymentTitle1 = containPaymentTitle1;
  eventReg.paymentTitle1 = paymentTitle1;
  eventReg.paymentTitle1Price = paymentTitle1Price;
  eventReg.paymentTitle1Price_EB = paymentTitle1Price_EB;
  eventReg.containPaymentTitle2 = containPaymentTitle2;
  eventReg.paymentTitle2 = paymentTitle2;
  eventReg.paymentTitle2Price = paymentTitle2Price;
  eventReg.paymentTitle2Price_EB = paymentTitle2Price_EB;
  eventReg.containPaymentTitle3 = containPaymentTitle3;
  eventReg.paymentTitle3 = paymentTitle3;
  eventReg.paymentTitle3Price = paymentTitle3Price;
  eventReg.paymentTitle3Price_EB = paymentTitle3Price_EB;
  eventReg.containPaymentTitle4 = containPaymentTitle4;
  eventReg.paymentTitle4 = paymentTitle4;
  eventReg.paymentTitle4Price = paymentTitle4Price;
  eventReg.paymentTitle4Price_EB = paymentTitle4Price_EB;
  eventReg.containPaymentTitle5 = containPaymentTitle5;
  eventReg.paymentTitle5 = paymentTitle5;
  eventReg.paymentTitle5Price = paymentTitle5Price;
  eventReg.paymentTitle5Price_EB = paymentTitle5Price_EB;
  eventReg.containPaymentTitle6 = containPaymentTitle6;
  eventReg.paymentTitle6 = paymentTitle6;
  eventReg.paymentTitle6Price = paymentTitle6Price;
  eventReg.paymentTitle6Price_EB = paymentTitle6Price_EB;
  eventReg.containPaymentTitle7 = containPaymentTitle7;
  eventReg.paymentTitle7 = paymentTitle7;
  eventReg.paymentTitle7Price = paymentTitle7Price;
  eventReg.paymentTitle7Price_EB = paymentTitle7Price_EB;
  eventReg.containPaymentTitle8 = containPaymentTitle8;
  eventReg.paymentTitle8 = paymentTitle8;
  eventReg.paymentTitle8Price = paymentTitle8Price;
  eventReg.paymentTitle8Price_EB = paymentTitle8Price_EB;
  eventReg.containPaymentTitle9 = containPaymentTitle9;
  eventReg.paymentTitle9 = paymentTitle9;
  eventReg.paymentTitle9Price = paymentTitle9Price;
  eventReg.paymentTitle9Price_EB = paymentTitle9Price_EB;
  eventReg.containPaymentTitle10 = containPaymentTitle10;
  eventReg.paymentTitle10 = paymentTitle10;
  eventReg.paymentTitle10Price = paymentTitle10Price;
  eventReg.paymentTitle10Price_EB = paymentTitle10Price_EB;
  eventReg.paymentTitle1Mandatory = paymentTitle1Mandatory;
  eventReg.paymentTitle2Mandatory = paymentTitle2Mandatory;
  eventReg.paymentTitle3Mandatory = paymentTitle3Mandatory;
  eventReg.paymentTitle4Mandatory = paymentTitle4Mandatory;
  eventReg.paymentTitle5Mandatory = paymentTitle5Mandatory;
  eventReg.paymentTitle6Mandatory = paymentTitle6Mandatory;
  eventReg.paymentTitle7Mandatory = paymentTitle7Mandatory;
  eventReg.paymentTitle8Mandatory = paymentTitle8Mandatory;
  eventReg.paymentTitle9Mandatory = paymentTitle9Mandatory;
  eventReg.paymentTitle10Mandatory = paymentTitle10Mandatory;

  eventReg.limitSession = isSessionCountLimit;
  eventReg.minSession = minSessionCount;
  eventReg.maxSession = maxSessionCount;

  eventReg.customQuestions = customQuestions;
  eventReg.successfulMsgtoReg = successfulMsgtoReg;
  eventReg.successfulMsgtoWaitingList = successfulMsgtoWaitingList;
  eventReg.sendEmail = sendEmail;
  eventReg.emailFrom = emailFrom;
  eventReg.emailBcc = emailBcc;
  eventReg.emailSubjectSuccessfulReg = emailSubjectSuccessfulReg;
  eventReg.emailDetailsSuccessfulReg = emailDetailsSuccessfulReg;
  eventReg.emailSubjectSuccessfulWaiting = emailSubjectSuccessfulWaiting;
  eventReg.emailDetailsSuccessfulWaiting = emailDetailsSuccessfulWaiting;
  eventReg.err_msg_userType = err_msg_userType;
  eventReg.err_msg_quotaExceed = err_msg_quotaExceed;
  eventReg.limitItemCount = limitItemCount;
  eventReg.minItemCount = minItemCount;
  eventReg.maxItemCount = maxItemCount;
  eventReg.paymentTitleQuantityEnables = paymentTitleQuantityEnables;
  await eventReg.save();

  return eventReg.get();
}

// async function updateEventDateTime(me: MeSummary, eventId: number, eventDateTime: Date): Promise<void> {
//     if (!canUpdate(me)) {
//         throw apiUnauthorizedError;
//     }

//     const event = await Event.findByPk(
//         eventId
//     );

//     if (!event) {
//         throw new ApiError(`Event not found: ${eventId}`);
//     }

//     const clashEvents = await Event.findAll({
//         where: {
//             eventDateTime
//         }
//     });

//     if (clashEvents.length > 0) {
//         throw new ApiError(`Event date clash with another existing event.`);
//     }

//     event.eventDateTime = eventDateTime;
//     await event.save();

//     // Send email to attendee
//     const attendees = await Attendance.findAll({
//         where: {
//             eventId: event.eventId
//         }
//     });
//     const attendeeEmails = attendees.map(a => a.email).filter(e => !!e);
//     if (attendeeEmails.length > 0) {
//         try {
//             const email = await renderEmail('roster_reschedule_notification_attendees', null, null, attendeeEmails, { oldEventDate: toLocalDateForEmail(event.eventDateTime), newEventDate: toLocalDateForEmail(event.eventDateTime), appUrl: config.APP_URL });
//             sendEmail(email).catch(e => {
//                 // Do nothing
//             });
//         }
//         catch (err) {
//             logger.error(err);
//         }
//     }

//     // Send email to HoU
//     const frcManagers = await listFRCManagers();
//     const frcManagerEmails = frcManagers.map(f => f.email).filter(e => !!e);
//     const hous = await listHoUForEvent(event.eventId);
//     const houEmails = hous.map(f => f.email).filter(e => !!e);

//     try {
//         const email = await renderEmail('roster_reschedule_notification', [], frcManagerEmails, houEmails, { eventDate: toLocalDateForEmail(event.eventDateTime), appUrl: config.APP_URL });
//         sendEmail(email).catch(e => {
//             // Do nothing
//         });
//     }
//     catch (err) {
//         logger.error(err);
//     }

// }

// async function updateRoster(me: MeSummary, eventId: number, deptAbbrs: string[]): Promise<void> {
//     if (!canUpdate(me)) {
//         throw apiUnauthorizedError;
//     }

//     const event = await Event.findByPk(eventId);

//     if (!event) {
//         throw new ApiError(`Event not found: ${eventId}`);
//     }

//     const frcManagers = await listFRCManagers();
//     const frcManagerEmails = frcManagers.map(f => f.email).filter(e => !!e);

//     const rosters = await Roster.findAll({
//         where: {
//             eventId
//         }
//     });

//     let newHouEmails: string[] = [];

//     for (const deptAbbr of deptAbbrs) {
//         if (rosters.filter(roster => roster.deptAbbr === deptAbbr).length === 0) {
//             logger.info(`Assigning ${deptAbbr} to event ${eventId}`);
//             await Roster.create({
//                 eventId,
//                 deptAbbr
//             });

//             const hous = await RoleUser.findAll({
//                 where: {
//                     [Op.and]: {
//                         deptAbbr,
//                         '$role.roleLabel$': [RoleLabel.HoU, RoleLabel.HoUDelegate]
//                     },
//                 }
//             });

//             newHouEmails = [...newHouEmails, ...hous.map(h => h.user.email).filter(f => !!f)];
//         }
//     }

//     for (const roster of rosters) {
//         if (deptAbbrs.filter(deptAbbr => deptAbbr === roster.deptAbbr).length === 0) {
//             logger.info(`Removing ${roster.deptAbbr} from event ${eventId}`);
//             await roster.destroy();
//         }
//     }

//     // Send email to HoUs
//     try {
//         const email = await renderEmail('roster_assignment_notification', [], frcManagerEmails, newHouEmails, { eventDate: toLocalDateForEmail(event.eventDateTime), appUrl: config.APP_URL });
//         sendEmail(email).catch(e => {
//             // Do nothing
//         });
//     }
//     catch (err) {
//         logger.error(err);
//     }
// }

// async function listHoUForEvent(eventId: number): Promise<RoleUserSummary[]> {
//     const event = await Event.findByPk(
//         eventId,
//         {
//             include: [{
//                 model: Roster,
//                 as: 'rosters',
//                 required: false,
//                 include: [{
//                     model: Department,
//                     as: 'department',
//                     required: true,
//                 }]
//             }]
//         }
//     );

//     if (!event) {
//         throw new ApiError('Invalid Event.');
//     }

//     const deptAbbrs = event?.rosters?.map(r => r.deptAbbr);

//     if (!deptAbbrs) {
//         return [];
//     }

//     if (Array.isArray(deptAbbrs) && deptAbbrs.length === 0) {
//         return [];
//     }

//     return await RoleService.search(null, { roleLabel: [RoleLabel.HoU, RoleLabel.HoUDelegate], roleDeptAbbr: deptAbbrs });
// }

function evalReadAcl(me: MeSummary): WhereValue<EventRegistrationAttributes> {
  const aclFilters: WhereValue<EventRegistrationAttributes>[] = [];

  const roleLabels = me.roles.map((role) => {
    return role.roleLabel;
  });
  const eventIds = me.roles
    .filter((role) => {
      return (
        role.roleLabel === RoleLabel.EventOrganizer ||
        role.roleLabel === RoleLabel.EventSupporter
      );
    })
    .map((role) => {
      return role.eventId;
    });

  if (roleLabels.indexOf(RoleLabel.SystemAdmin) >= 0) {
    return { [Op.or]: literal("1=1") } as WhereAttributeHash;
  }

  if (eventIds.length > 0) {
    aclFilters.push({
      [Op.and]: {
        eventId: { [Op.in]: eventIds },
      },
    } as WhereAttributeHash);
  }

  if (aclFilters.length === 0) {
    return { [Op.or]: literal("1=0") } as WhereAttributeHash;
  } else {
    return { [Op.or]: aclFilters } as WhereAttributeHash;
  }
}

function canUpdate(me: MeSummary): boolean {
  return hasAnyRole(me, [RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]);
}

// function toLocalDateForEmail(date: Date): string {
//   return moment(date).tz("Asia/Hong_Kong").format("DD/MM/YY");
// }

// async function listFRCManagers(): Promise<RoleUserSummary[]> {
//     return await RoleService.search(null, { roleLabel: RoleLabel.FRCManager });
// }

async function getEvent(me: MeSummary, eventId: NonNullable<string>): Promise<any> {
  const event = await Event.findOne({
    where: {
      id: eventId,
    },
  });

  return event;
}

async function uploadFile(me: MeSummary, formId: any, email: any, file: any): Promise<any> {
  const existingParticipant = await Participant.findOne({ where: { formId: formId, email: email } });

  if (!existingParticipant) {
    throw new ApiError("Participant not exist. Please refresh and try again.");
  }

  if (file) {
    const fileSize = parseInt(String(file?.size), 10) / 1024 / 1024;

    const newAttachment = await ParticipantAttachments.create({
      eventId: existingParticipant.eventId,
      participantId: existingParticipant.id,
      fileName: file?.originalname,
      s3Key: '',
      fileSize: String(fileSize.toFixed(4)) + " MB",
      createdBy: me.netId,
      updatedBy: me.netId,
    });
    const refFileExt = file.originalname.slice(file.originalname.lastIndexOf('.'));
    const newFileName = `${newAttachment.id}${refFileExt}`;
    newAttachment.s3Key = config.S3CLIENT_ATTACHMENT_FOLDER + "/" + existingParticipant.eventId + "/" + existingParticipant.id + "/" + newFileName;
    await newAttachment.save();
    const response = await s3.upload(`${config.S3CLIENT_ATTACHMENT_FOLDER}/${existingParticipant.eventId}/${existingParticipant.id}/${newFileName}`, file.buffer);
    if (response.length === 0) {
      await newAttachment.destroy();
      const attachmentCollection = await ParticipantAttachments.findAll({ where: { participantId: existingParticipant.id } });
      for (const attachment of attachmentCollection) {
        await attachment.destroy();
      }
      await existingParticipant.destroy();
      throw new ApiError("Attachment upload fail. Please try again");
    }

    return newAttachment;
  }
}

export {
  search,
  create,
  modify,
  getEvent,
  uploadFile
  // updateEventDateTime,
  // updateRoster,
  // listHoUForEvent
};
