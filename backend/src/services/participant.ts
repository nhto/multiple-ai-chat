import {
  Op,
  WhereOptions,
  WhereValue,
  literal,
  WhereAttributeHash,
} from "sequelize";
import moment from "moment";
import { ApiError, apiUnauthorizedError } from "../models/error";
import {
  ParticipantSummary,
  MeSummary,
  RoleLabel,
  RoleUserSummary,
  PaymentStatusLabel,
} from "../models/model";
import { hasAnyRole } from "./authn";
import { Attendance } from "../repo/attendance";
import { Event, EventAttributes } from "../repo/event";
import { EventSession, EventSessionAttributes } from "../repo/eventSession";
import { EventRegistrationFormSession } from "../repo/eventRegistrationFormSession";
import { Participant, ParticipantAttributes } from "../repo/participant";
import { ParticipantSession, ParticipantSessionAttributes } from "../repo/participantSession";
import { CustomPaymentItem, CustomPaymentItemAttributes } from "../repo/customPaymentItem";
import { EventRegistration } from "../repo/eventRegistration";
import { ParticipantAttachments } from "../repo/participantAttachments";
import { send } from "./olpp";
import * as config from '../utilities/config';

async function generatePaymentRefId() {
  const datetimeString = moment(new Date()).format('YYMMDDHHmmss');
  const index = await Participant.count({
    where: { paymentRefId: { [Op.like]: "CEMS_" + datetimeString + '%' } },
  });
  return "CEMS_" + datetimeString + String(index + 1).padStart(3, '0');
}

async function search(
  me: MeSummary,
  filter?: {
    id?: string;
    eventId?: string;
    formId?: string;
    userType?: string;
    userId?: string;
    qrCode?: string;
    disabled?: boolean;
    registrationStatus?: string;
    title?: string;
    firstname?: string;
    lastname?: string;
    email?: string;
    position?: string;
    institution?: string;
    dept?: string;
    address?: string;
    country?: string;
    officePhoneNumber?: string;
    mobilePhoneNumber?: string;
    needPayment?: boolean;
    paymentStatus?: string;
    paymentRefId?: string;
  }
): Promise<any[]> {
  const eventWhereOptions: WhereOptions<ParticipantAttributes> = {};
  // const departmentWhereOptions: WhereOptions<DepartmentAttributes> = {};

  if (!!filter?.id) { eventWhereOptions.id = filter.id; }
  if (!!filter?.eventId) { eventWhereOptions.eventId = filter.eventId; }
  if (!!filter?.formId) { eventWhereOptions.formId = filter.formId; }
  if (!!filter?.userType) { eventWhereOptions.userType = filter.userType; }
  if (!!filter?.userId) { eventWhereOptions.userId = filter.userId; }
  if (!!filter?.qrCode) { eventWhereOptions.qrCode = filter.qrCode; }
  if (!!filter?.disabled) { eventWhereOptions.disabled = filter.disabled; }
  if (!!filter?.registrationStatus) { eventWhereOptions.registrationStatus = filter.registrationStatus; }
  if (!!filter?.firstname) { eventWhereOptions.firstname = filter.firstname; }
  if (!!filter?.lastname) { eventWhereOptions.lastname = filter.lastname; }
  if (!!filter?.email) { eventWhereOptions.email = filter.email; }
  if (!!filter?.position) { eventWhereOptions.position = filter.position; }
  if (!!filter?.institution) { eventWhereOptions.institution = filter.institution; }
  if (!!filter?.dept) { eventWhereOptions.dept = filter.dept; }
  if (!!filter?.address) { eventWhereOptions.address = filter.address; }
  if (!!filter?.country) { eventWhereOptions.country = filter.country; }
  if (!!filter?.officePhoneNumber) { eventWhereOptions.officePhoneNumber = filter.officePhoneNumber; }
  if (!!filter?.mobilePhoneNumber) { eventWhereOptions.mobilePhoneNumber = filter.mobilePhoneNumber; }
  if (!!filter?.needPayment) { eventWhereOptions.needPayment = filter.needPayment; }
  if (!!filter?.paymentStatus) { eventWhereOptions.paymentStatus = filter.paymentStatus; }
  if (!!filter?.paymentRefId) { eventWhereOptions.paymentRefId = filter.paymentRefId; }

  const participants = await Participant.findAll({
    where: {
      [Op.and]: [
        // evalReadAcl(me),
        eventWhereOptions
      ],
    } as WhereAttributeHash,
    include: [
      {
        model: EventRegistration,
        as: 'form',
        attributes: { exclude: ['banner'] },
        include: [
          {
            model: EventRegistrationFormSession,
            as: 'eventRegistrationFormSession',
            include: [{
              model: EventSession,
              as: 'eventSession'
            }]
          }
        ]
      }, {
        model: Event,
        as: 'event',
        attributes: { exclude: ['banner'] }
      }, {
        model: ParticipantSession,
        as: 'pSessions',
        // attributes: { exclude: ['banner'] }
        include: [
          {
            model: EventSession,
            as: 'eventSession'
          }
        ]
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
      },
    ],
    order: [['createdAt', 'DESC']]
  });

  //get custom question
  const registrationFormArray = await EventRegistration.findAll({ where: { eventId: filter?.eventId } });

  const participantCollection = await Promise.all(participants.map(async (participant) => {
    const attendanceRecord = await Attendance.findOne({ where: { participantId: participant.id, status: 'Attended' } });

    //get custom question
    // const registrationForm = await EventRegistration.findOne({ where: { id: participant?.formId } });
    const registrationForm = registrationFormArray.find(form => form.id === participant?.formId);
    let custAnsArray;

    if (registrationForm?.customQuestions) {
      const custQuestionArray = JSON.parse(registrationForm?.customQuestions);

      // Get custom answer
      if (participant?.customAnswers) {
        custAnsArray = JSON.parse(participant?.customAnswers);

        if (custAnsArray) {
          for (const custAns of custAnsArray) {
            if (custQuestionArray) {
              for (const custQuestion of custQuestionArray) {
                if (custQuestion?.id === custAns?.qid) {
                  if (custQuestion.type === "Multiple Choice") {
                    const sortedAnswers = custAns.answers.sort((a: any, b: any) => {
                      return custQuestion.choices.indexOf(a) - custQuestion.choices.indexOf(b);
                    });
                    custAns.answers = sortedAnswers;

                  }

                  custAns.question = custQuestion.question;

                }
              }
            }
          }
        }
      }
    }

    //Get Attachment
    const attachemntCollection = await ParticipantAttachments.findAll({where: {participantId: participant.id}});

    return {
      id: participant.id,
      eventId: participant.eventId,
      formId: participant.formId,
      userType: participant.userType,
      userId: participant.userId,
      qrCode: participant.qrCode,
      disabled: participant.disabled,

      registrationStatus: participant.registrationStatus,
      internalRemark: participant.internalRemark,

      form: participant.form,
      event: participant.event,
      pSessions: participant.pSessions,
      formName: participant.form?.topic ?? "",

      title: participant.title,
      firstname: participant.firstname,
      lastname: participant.lastname,
      email: participant.email,

      picsAcceptBox: participant.picsAcceptBox,
      marketingAcceptBox: participant.marketingAcceptBox,

      position: participant.position,
      institution: participant.institution,
      dept: participant.dept,
      address: participant.address,
      country: participant.country,
      officePhoneNumber: participant.officePhoneNumber,
      mobilePhoneNumber: participant.mobilePhoneNumber,

      orderPaymentTitle1: participant.orderPaymentTitle1,
      paymentTitle1Obj: participant.paymentTitle1Obj,
      paymentTitle1: participant.paymentTitle1,
      paymentTitle1Price: participant.paymentTitle1Price,
      orderPaymentTitle2: participant.orderPaymentTitle2,
      paymentTitle2Obj: participant.paymentTitle2Obj,
      paymentTitle2: participant.paymentTitle2,
      paymentTitle2Price: participant.paymentTitle2Price,
      orderPaymentTitle3: participant.orderPaymentTitle3,
      paymentTitle3Obj: participant.paymentTitle3Obj,
      paymentTitle3: participant.paymentTitle3,
      paymentTitle3Price: participant.paymentTitle3Price,
      orderPaymentTitle4: participant.orderPaymentTitle4,
      paymentTitle4Obj: participant.paymentTitle4Obj,
      paymentTitle4: participant.paymentTitle4,
      paymentTitle4Price: participant.paymentTitle4Price,
      orderPaymentTitle5: participant.orderPaymentTitle5,
      paymentTitle5Obj: participant.paymentTitle5Obj,
      paymentTitle5: participant.paymentTitle5,
      paymentTitle5Price: participant.paymentTitle5Price,
      orderPaymentTitle6: participant.orderPaymentTitle6,
      paymentTitle6Obj: participant.paymentTitle6Obj,
      paymentTitle6: participant.paymentTitle6,
      paymentTitle6Price: participant.paymentTitle6Price,
      orderPaymentTitle7: participant.orderPaymentTitle7,
      paymentTitle7Obj: participant.paymentTitle7Obj,
      paymentTitle7: participant.paymentTitle7,
      paymentTitle7Price: participant.paymentTitle7Price,
      orderPaymentTitle8: participant.orderPaymentTitle8,
      paymentTitle8Obj: participant.paymentTitle8Obj,
      paymentTitle8: participant.paymentTitle8,
      paymentTitle8Price: participant.paymentTitle8Price,
      orderPaymentTitle9: participant.orderPaymentTitle9,
      paymentTitle9Obj: participant.paymentTitle9Obj,
      paymentTitle9: participant.paymentTitle9,
      paymentTitle9Price: participant.paymentTitle9Price,
      orderPaymentTitle10: participant.orderPaymentTitle10,
      paymentTitle10Obj: participant.paymentTitle10Obj,
      paymentTitle10: participant.paymentTitle10,
      paymentTitle10Price: participant.paymentTitle10Price,

      orderPaymentQuantity1: participant.orderPaymentQuantity1,
      orderPaymentQuantity2: participant.orderPaymentQuantity2,
      orderPaymentQuantity3: participant.orderPaymentQuantity3,
      orderPaymentQuantity4: participant.orderPaymentQuantity4,
      orderPaymentQuantity5: participant.orderPaymentQuantity5,
      orderPaymentQuantity6: participant.orderPaymentQuantity6,
      orderPaymentQuantity7: participant.orderPaymentQuantity7,
      orderPaymentQuantity8: participant.orderPaymentQuantity8,
      orderPaymentQuantity9: participant.orderPaymentQuantity9,
      orderPaymentQuantity10: participant.orderPaymentQuantity10,

      customAnswers: participant.customAnswers,

      needPayment: participant.needPayment,
      totalPayment: participant.totalPayment,
      paymentStatus: participant.paymentStatus,
      paidAt: participant.paidAt,
      paymentRefId: participant.paymentRefId,
      paymentRemark: participant.paymentRemark,

      createdAt: participant.createdAt,
      updatedAt: participant.updatedAt,
      updatedBy: participant.updatedBy,
      attendanceRecord: attendanceRecord?.status ? attendanceRecord?.status : "Not Attended",
      customAnsArray: custAnsArray,
      attachemntCollection: attachemntCollection,
      attachmentDownloadUrl: `${config.APP_URL}/api/participant/${participant.eventId}/${participant.id}/download/attachment`, //Get attachment
      attachmentDownloadAllUrl: `${config.APP_URL}/api/participant/${participant.eventId}/download/all/attachment`, //Get All attachment
    };
  }));

  return participantCollection;
}

async function create(
  me: MeSummary,
  sub: string,
  eventId: string,
  formId: string,
  userType: string,
  userId: string | null,
  // qrCode: string,
  // disabled: boolean,

  registrationStatus: string,
  internalRemark: string,

  title: string,
  firstname: string,
  lastname: string,
  email: string,

  picsAcceptBox: boolean,
  marketingAcceptBox: boolean,

  position: string,
  institution: string,
  dept: string,
  address: string,
  country: string,
  officePhoneNumber: string,
  mobilePhoneNumber: string,

  orderPaymentTitle1: boolean,
  paymentTitle1: string,
  paymentTitle1Price: number,
  orderPaymentTitle2: boolean,
  paymentTitle2: string,
  paymentTitle2Price: number,
  orderPaymentTitle3: boolean,
  paymentTitle3: string,
  paymentTitle3Price: number,
  orderPaymentTitle4: boolean,
  paymentTitle4: string,
  paymentTitle4Price: number,
  orderPaymentTitle5: boolean,
  paymentTitle5: string,
  paymentTitle5Price: number,
  orderPaymentTitle6: boolean,
  paymentTitle6: string,
  paymentTitle6Price: number,
  orderPaymentTitle7: boolean,
  paymentTitle7: string,
  paymentTitle7Price: number,
  orderPaymentTitle8: boolean,
  paymentTitle8: string,
  paymentTitle8Price: number,
  orderPaymentTitle9: boolean,
  paymentTitle9: string,
  paymentTitle9Price: number,
  orderPaymentTitle10: boolean,
  paymentTitle10: string,
  paymentTitle10Price: number,

  paymentStatus: string,

  customAnswers: string,
  orderPaymentQuantity1?: number,
  orderPaymentQuantity2?: number,
  orderPaymentQuantity3?: number,
  orderPaymentQuantity4?: number,
  orderPaymentQuantity5?: number,
  orderPaymentQuantity6?: number,
  orderPaymentQuantity7?: number,
  orderPaymentQuantity8?: number,
  orderPaymentQuantity9?: number,
  orderPaymentQuantity10?: number,
): Promise<ParticipantAttributes> {
  // if (!canUpdate(me)) { throw apiUnauthorizedError; }

  const participantCount = await Participant.count({ where: { eventId, formId, email } });
  if (participantCount > 0) { throw new ApiError(`Participant already exists! Uesr Email: ${email}`); }

  // for Easy Walk-in user, formId will be null
  let form = null;
  if (!!formId) {
    form = await EventRegistration.findOne({ where: { id: formId } })
    if (!form) { throw new ApiError(`Can't find corresponding form!`); }
  }

  let paymentTotal = 0;
  const isEBDisabled = form?.earlyBirdEnd === null
  const isEarlyBirdPassed = isEBDisabled ? true : moment(form?.earlyBirdEnd).valueOf() < moment().valueOf() ? true : false
  // if (form?.paymentTitle1Mandatory || orderPaymentTitle1) { paymentTotal += paymentTitle1Price}
  // if (form?.paymentTitle2Mandatory || orderPaymentTitle2) { paymentTotal += paymentTitle2Price }
  // if (form?.paymentTitle3Mandatory || orderPaymentTitle3) { paymentTotal += paymentTitle3Price }
  // if (form?.paymentTitle4Mandatory || orderPaymentTitle4) { paymentTotal += paymentTitle4Price }
  // if (form?.paymentTitle5Mandatory || orderPaymentTitle5) { paymentTotal += paymentTitle5Price }
  // if (form?.paymentTitle6Mandatory || orderPaymentTitle6) { paymentTotal += paymentTitle6Price }
  // if (form?.paymentTitle7Mandatory || orderPaymentTitle7) { paymentTotal += paymentTitle7Price }
  // if (form?.paymentTitle8Mandatory || orderPaymentTitle8) { paymentTotal += paymentTitle8Price }
  // if (form?.paymentTitle9Mandatory || orderPaymentTitle9) { paymentTotal += paymentTitle9Price }
  // if (form?.paymentTitle10Mandatory || orderPaymentTitle10) { paymentTotal += paymentTitle10Price }

  if (form?.paymentTitle1Mandatory || orderPaymentTitle1) {
    const price = paymentTitle1Price;
    const quantity = orderPaymentQuantity1 > 0 ? orderPaymentQuantity1 : 1;
    paymentTotal += price * quantity;
  }
  if (form?.paymentTitle2Mandatory || orderPaymentTitle2) {
    const price = paymentTitle2Price;
    const quantity = orderPaymentQuantity2 > 0 ? orderPaymentQuantity2 : 1;
    paymentTotal += price * quantity;
  }
  if (form?.paymentTitle3Mandatory || orderPaymentTitle3) {
    const price = paymentTitle3Price;
    const quantity = orderPaymentQuantity3 > 0 ? orderPaymentQuantity3 : 1;
    paymentTotal += price * quantity;
  }
  if (form?.paymentTitle4Mandatory || orderPaymentTitle4) {
    const price = paymentTitle4Price;
    const quantity = orderPaymentQuantity4 > 0 ? orderPaymentQuantity4 : 1;
    paymentTotal += price * quantity;
  }
  if (form?.paymentTitle5Mandatory || orderPaymentTitle5) {
    const price = paymentTitle5Price;
    const quantity = orderPaymentQuantity5 > 0 ? orderPaymentQuantity5 : 1;
    paymentTotal += price * quantity;
  }
  if (form?.paymentTitle6Mandatory || orderPaymentTitle6) {
    const price = paymentTitle6Price;
    const quantity = orderPaymentQuantity6 > 0 ? orderPaymentQuantity6 : 1;
    paymentTotal += price * quantity;
  }
  if (form?.paymentTitle7Mandatory || orderPaymentTitle7) {
    const price = paymentTitle7Price;
    const quantity = orderPaymentQuantity7 > 0 ? orderPaymentQuantity7 : 1;
    paymentTotal += price * quantity;
  }
  if (form?.paymentTitle8Mandatory || orderPaymentTitle8) {
    const price = paymentTitle8Price;
    const quantity = orderPaymentQuantity8 > 0 ? orderPaymentQuantity8 : 1;
    paymentTotal += price * quantity;
  }
  if (form?.paymentTitle9Mandatory || orderPaymentTitle9) {
    const price = paymentTitle9Price;
    const quantity = orderPaymentQuantity9 > 0 ? orderPaymentQuantity9 : 1;
    paymentTotal += price * quantity;
  }
  if (form?.paymentTitle10Mandatory || orderPaymentTitle10) {
    const price = paymentTitle10Price;
    const quantity = orderPaymentQuantity10 > 0 ? orderPaymentQuantity10 : 1;
    paymentTotal += price * quantity;
  }

  const newPaymentRefId = await generatePaymentRefId();

  const participant = await Participant.create({
    eventId,
    formId,
    userType,
    // userId: me.userId,
    userId,
    sub,
    qrCode: null,
    disabled: false,

    registrationStatus,
    internalRemark,

    title,
    firstname,
    lastname,
    email,
    yearOfGraduation: null,
    graduationProgram: null,
    graduationDept: null,

    picsAcceptBox,
    marketingAcceptBox,

    position,
    institution,
    dept,
    address,
    country,
    officePhoneNumber,
    mobilePhoneNumber,

    orderPaymentTitle1,
    paymentTitle1,
    paymentTitle1Price,
    orderPaymentTitle2,
    paymentTitle2,
    paymentTitle2Price,
    orderPaymentTitle3,
    paymentTitle3,
    paymentTitle3Price,
    orderPaymentTitle4,
    paymentTitle4,
    paymentTitle4Price,
    orderPaymentTitle5,
    paymentTitle5,
    paymentTitle5Price,
    orderPaymentTitle6,
    paymentTitle6,
    paymentTitle6Price,
    orderPaymentTitle7,
    paymentTitle7,
    paymentTitle7Price,
    orderPaymentTitle8,
    paymentTitle8,
    paymentTitle8Price,
    orderPaymentTitle9,
    paymentTitle9,
    paymentTitle9Price,
    orderPaymentTitle10,
    paymentTitle10,
    paymentTitle10Price,

    customAnswers,

    needPayment: paymentTotal > 0 ? true : false,
    totalPayment: paymentTotal,
    paymentStatus,
    paidAt: null,
    paymentRefId: paymentTotal > 0 ? newPaymentRefId
      : `NP_${lastname.toUpperCase().replace(/ /g, '').slice(-2)}${Date.now().toString()}`,
    paymentRemark: null,

    orderPaymentQuantity1: orderPaymentQuantity1 ?? 0,
    orderPaymentQuantity2: orderPaymentQuantity2 ?? 0,
    orderPaymentQuantity3: orderPaymentQuantity3 ?? 0,
    orderPaymentQuantity4: orderPaymentQuantity4 ?? 0,
    orderPaymentQuantity5: orderPaymentQuantity5 ?? 0,
    orderPaymentQuantity6: orderPaymentQuantity6 ?? 0,
    orderPaymentQuantity7: orderPaymentQuantity7 ?? 0,
    orderPaymentQuantity8: orderPaymentQuantity8 ?? 0,
    orderPaymentQuantity9: orderPaymentQuantity9 ?? 0,
    orderPaymentQuantity10: orderPaymentQuantity10 ?? 0,

    updatedBy: me.netId
  });

  return participant.get();
}

async function modify(
  me: MeSummary,
  participantId: string,
  userType: string,
  registrationStatus: string,
  internalRemark: string,

  title: string,
  firstname: string,
  lastname: string,
  email: string,

  position: string,
  institution: string,
  dept: string,
  address: string,
  country: string,
  officePhoneNumber: string,
  mobilePhoneNumber: string,

  paymentStatus: string,

  customAnswers: string,
): Promise<ParticipantAttributes> {
  // if (!canUpdate(me)) { throw apiUnauthorizedError; }

  const participant = await Participant.findOne({ where: { id: participantId } });
  if (!participant) { throw new ApiError(`Participant not found!`); }

  participant.userType = userType;
  participant.registrationStatus = registrationStatus;
  participant.internalRemark = internalRemark;
  participant.title = title;
  participant.firstname = firstname;
  participant.lastname = lastname;
  participant.email = email;
  participant.position = position;
  participant.institution = institution;
  participant.dept = dept;
  participant.address = address;
  participant.country = country;
  participant.officePhoneNumber = officePhoneNumber;
  participant.mobilePhoneNumber = mobilePhoneNumber;
  participant.paymentStatus = paymentStatus;
  participant.customAnswers = customAnswers;
  await participant.save();

  return participant.get();
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

function evalReadAcl(me: MeSummary): WhereValue<EventAttributes> {
  const aclFilters: WhereValue<EventAttributes>[] = [];

  const roleLabels = me.roles.map((role) => {
    return role.roleLabel;
  });
  const eventIds = me.roles
    .filter((role) => {
      return (
        role.roleLabel === RoleLabel.EventOrganizer ||
        role.roleLabel === RoleLabel.EventSupporter ||
        role.roleLabel === RoleLabel.EventHelper
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
        id: { [Op.in]: eventIds },
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
  return hasAnyRole(me, [RoleLabel.SystemAdmin, RoleLabel.EventOrganizer]);
}

function toLocalDateForEmail(date: Date): string {
  return moment(date).tz("Asia/Hong_Kong").format("DD/MM/YY");
}

// async function listFRCManagers(): Promise<RoleUserSummary[]> {
//     return await RoleService.search(null, { roleLabel: RoleLabel.FRCManager });
// }

async function testingSendEmail(me: MeSummary, input: any): Promise<any> {
  console.log("testing message in testingSendEmail");
  console.log("input");
  console.log(input);
  const participant = await Participant.findOne({
    where: { id: input.id }
  });

  send("cems.admin@polyu.edu.hk", participant, false);
}

async function deleteParticipant(me: MeSummary, input: any): Promise<any> {
  const participant = await Participant.findOne({
    where: { id: input.id }
  });

  if (participant) {
    await participant.destroy();
  }
  else {
    throw new ApiError(`Participant not found!`);
  }
}

export {
  search,
  create,
  modify,
  testingSendEmail,
  deleteParticipant,
  // updateEventDateTime,
  // updateRoster,
  // listHoUForEvent
};