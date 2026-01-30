import {
  Op,
  WhereOptions,
  WhereValue,
  literal,
  WhereAttributeHash,
} from "sequelize";
import moment from "moment";

import * as config from "../utilities/config";
import logger from "./../utilities/logger";

import { ApiError, apiUnauthorizedError } from "../models/error";

import {
  EventSummary,
  MeSummary,
  RoleLabel,
  RoleUserSummary,
} from "../models/model";
import { hasAnyRole } from "./authn";
import { renderEmail, sendEmail } from "../utilities/email";

import { Roster } from "../repo/roster";
import { Attendance } from "../repo/attendance";
import { RoleUser } from "../repo/roleUser";
import { User } from "../repo/user";
import { Event, EventAttributes } from "../repo/event";
import { Participant } from "../repo/participant";
import { Department, DepartmentAttributes } from "../repo/department";

import * as RoleService from "./role";

interface EventDetail {
  topic: string;
  contactName: string;
  contactEmail: string;
  contactPhoneNumber: string;
  contactDept: string;
}

async function search(
  me: MeSummary,
  filter?: {
    id?: string;
    topic?: string;
    subtopic?: string;
    start?: Date;
    end?: Date;
    eventMode?: string;
    quota?: string;
    waitingListQuota?: string;
    contactName?: string;
    contactEmail?: string;
    contactPhoneNumber?: string;
    contactDept?: string;
  }
): Promise<EventSummary[]> {
  const eventWhereOptions: WhereOptions<EventAttributes> = {};
  // const departmentWhereOptions: WhereOptions<DepartmentAttributes> = {};

  if (!!filter?.id) {
    eventWhereOptions.id = filter.id;
  }
  if (!!filter?.topic) {
    eventWhereOptions.topic = filter.topic;
  }
  if (!!filter?.subtopic) {
    eventWhereOptions.subtopic = filter.subtopic;
  }
  if (!!filter?.start) {
    eventWhereOptions.start = filter.start;
  }
  if (!!filter?.end) {
    eventWhereOptions.end = filter.end;
  }
  if (!!filter?.eventMode) {
    eventWhereOptions.eventMode = filter.eventMode;
  }
  if (!!filter?.quota) {
    eventWhereOptions.quota = filter.quota;
  }
  if (!!filter?.waitingListQuota) {
    eventWhereOptions.waitingListQuota = filter.waitingListQuota;
  }
  if (!!filter?.contactName) {
    eventWhereOptions.contactName = filter.contactName;
  }
  if (!!filter?.contactEmail) {
    eventWhereOptions.contactEmail = filter.contactEmail;
  }
  if (!!filter?.contactPhoneNumber) {
    eventWhereOptions.contactPhoneNumber = filter.contactPhoneNumber;
  }
  if (!!filter?.contactDept) {
    eventWhereOptions.contactDept = filter.contactDept;
  }

  await RoleUser.update(
    { eventId: null }, // Set eventId to null
    { where: { eventId: '' }, returning: true } // Condition to update empty eventId
  );

  const events = await Event.findAll({
    where: {
      [Op.and]: [evalReadAcl(me), eventWhereOptions],
    } as WhereAttributeHash,
    include: [
      {
        model: RoleUser,
        as: "roles",
        attributes: ["netId", "roleLabel"],
        include: [
          {
            model: User,
            as: "user",
            attributes: ["deptAbbr"],
          },
        ],
      },
    ],
    // include: [{
    //     model: Roster,
    //     as: 'rosters',
    //     required: !!departmentWhereOptions.deptAbbr,
    //     include: [{
    //         model: Department,
    //         as: 'department',
    //         required: true,
    //         where: departmentWhereOptions
    //     }]
    // }]
  }); 
  
  const eventCollection = await Promise.all(events.map(async (event) => {
    const registrant = await Participant.findAll({where: {eventId: event.id}});

    return {
      id: event.id,
      topic: event.topic,
      subtopic: event.subtopic,
      start: event.start,
      end: event.end,
      remark: event.remark,
      eventMode: event.eventMode,
      quota: event.quota,
      waitingListQuota: event.waitingListQuota,
      used: event.used,
      contactName: event.contactName,
      contactEmail: event.contactEmail,
      contactPhoneNumber: event.contactPhoneNumber,
      contactDept: event.contactDept,
      banner: event.banner ? await event.banner.toString("utf8") : null, // Example of using await
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      roles: event.roles,
      registrantNum: registrant?.length
    };
  }));

  return eventCollection;
}

async function create(
  me: MeSummary,
  topic: string,
  subtopic: string,
  start: Date,
  end: Date,
  remark: string,
  eventMode: string,
  quota: number,
  waitingListQuota: number,
  used: number,
  contactName: string,
  contactEmail: string,
  contactPhoneNumber: string,
  contactDept: string,
  banner: Buffer | null
): Promise<EventAttributes> {
  if (!canUpdate(me)) {
    throw apiUnauthorizedError;
  }

  const eventCount = await Event.count({ where: { topic } });

  if (eventCount > 0) {
    throw new ApiError(`Event already exists!`);
  }

  let event: Event;
  if (!!banner) {
    event = await Event.create({
      topic,
      subtopic,
      start,
      end,
      remark,
      eventMode,
      quota,
      waitingListQuota,
      used,
      contactName,
      contactEmail,
      contactPhoneNumber,
      contactDept,
      banner,
    });
  } else {
    event = await Event.create({
      topic,
      subtopic,
      start,
      end,
      remark,
      eventMode,
      quota,
      waitingListQuota,
      used,
      contactName,
      contactEmail,
      contactPhoneNumber,
      contactDept,
    });
  }

  await RoleUser.create({
    roleLabel: RoleLabel?.EventOrganizer,
    netId: me?.netId,
    eventId: event?.id,
  });

  return event.get();
}

async function modify(
  me: MeSummary,
  id: string,
  topic: string,
  subtopic: string,
  start: Date,
  end: Date,
  remark: string,
  eventMode: string,
  quota: number,
  waitingListQuota: number,
  used: number,
  contactName: string,
  contactEmail: string,
  contactPhoneNumber: string,
  contactDept: string,
  banner: Buffer
): Promise<EventAttributes> {
  if (!canUpdate(me)) {
    throw apiUnauthorizedError;
  }

  const event = await Event.findOne({ where: { id } });
  if (!event) {
    throw new ApiError(`Event not found!`);
  }

  event.topic = topic;
  event.subtopic = subtopic;
  event.start = start;
  event.end = end;
  event.remark = remark;
  event.eventMode = eventMode;
  event.quota = quota;
  event.waitingListQuota = waitingListQuota;
  event.used = used;
  event.contactName = contactName;
  event.contactEmail = contactEmail;
  event.contactPhoneNumber = contactPhoneNumber;
  event.contactDept = contactDept;
  event.banner = banner;
  await event.save();

  return event.get();
}

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

  // Allow System Admin to query all events
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
  return hasAnyRole(me, [
    RoleLabel.SystemAdmin,
    RoleLabel.Admin,
    RoleLabel.EventOrganizer,
    RoleLabel.EventSupporter,
  ]);
}

function toLocalDateForEmail(date: Date): string {
  return moment(date).tz("Asia/Hong_Kong").format("DD/MM/YY");
}

// async function listFRCManagers(): Promise<RoleUserSummary[]> {
//     return await RoleService.search(null, { roleLabel: RoleLabel.FRCManager });
// }

async function getEventDetailsById(
  eventId: string
): Promise<EventDetail | null> {
  try {
    const event = await Event.findByPk(eventId, {
      attributes: [
        "topic",
        "contactName",
        "contactEmail",
        "contactPhoneNumber",
        "contactDept",
      ], // Specify the fields you need
    });

    if (event) {
      // Extracting and returning the relevant details
      const {
        topic,
        contactName,
        contactEmail,
        contactPhoneNumber,
        contactDept,
      } = event;
      return {
        topic,
        contactName,
        contactEmail,
        contactPhoneNumber,
        contactDept,
      };
    }

    // If no event is found with the given id
    return null;
  } catch (error) {
    console.error("Error fetching event details by id:", error);
    throw error; // Consider how you want to handle errors; throwing might not always be the best approach depending on your application structure.
  }
}

async function getTermOfUseAccepted(me: MeSummary): Promise<any> {
  const user = await User.findOne({ where: { netId: me.netId } });

  return {
    isTermOfUseAccepted: user.isTermOfUseAccepted
  };
}

export {
  search,
  create,
  modify,
  getEventDetailsById,
  getTermOfUseAccepted
  // updateEventDateTime,
  // updateRoster,
  // listHoUForEvent
};
