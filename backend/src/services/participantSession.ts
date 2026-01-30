import {
  Op,
  WhereOptions,
  WhereValue,
  literal,
  WhereAttributeHash,
} from "sequelize";
import { ApiError, apiUnauthorizedError } from "../models/error";
import { Participant } from "../repo/participant";
import { ParticipantSession, ParticipantSessionAttributes } from "../repo/participantSession";
import {
  ParticipantSessionSummary,
  MeSummary,
} from "../models/model";
import { EventSession } from "../repo/eventSession";

async function search(me: MeSummary, filter?: { id?: string; eventId?: string; sessionId?: string; participantId?: string; }): Promise<any[]> {
  const whereOptions: WhereOptions<ParticipantSessionAttributes> = {};
  if (!!filter?.id) { whereOptions.id = filter.id; }
  if (!!filter?.eventId) { whereOptions.eventId = filter.eventId; }
  if (filter.sessionId === null || !!filter?.sessionId) { whereOptions.sessionId = filter.sessionId; }
  if (!!filter?.participantId) { whereOptions.participantId = filter.participantId; }

  const participantSessions = await ParticipantSession.findAll({
    where: {
      [Op.and]: [
        // evalReadAcl(me),
        whereOptions
      ],
    } as WhereAttributeHash,
    include: [
      {
        model: Participant,
        as: 'participant',
        // attributes: ['userType', 'registrationStatus']
      },
      // {
      //   model: Event,
      //   as: 'event'
      // },
    ]
  });

  return participantSessions.map((pS) => {
    return {
      id: pS.id,
      eventId: pS.eventId,
      sessionId: pS.sessionId,
      participantId: pS.participantId,
      participant: pS.participant,
      createdAt: pS.createdAt,
      updatedAt: pS.updatedAt,
    };
  });
}

async function create(me: MeSummary, eventId: string, sessionId: string, participantId: string,): Promise<ParticipantSessionAttributes> {
  // if (!canUpdate(me)) { throw apiUnauthorizedError; }

  const psCount = await ParticipantSession.count({ where: { eventId, sessionId, participantId } });
  if (psCount > 0) { throw new ApiError(`Participant Session already exists!`); }

  const pS = await ParticipantSession.create({
    eventId,
    sessionId,
    participantId,
  });

  if (sessionId) {
    const selectedSession = await EventSession.findOne({ where: { id: sessionId } });
    selectedSession.used = selectedSession.used + 1;
    await selectedSession.save();
  }

  return pS.get();
}

// function evalReadAcl(me: MeSummary): WhereValue<EventAttributes> {
//   const aclFilters: WhereValue<EventAttributes>[] = [];

//   const roleLabels = me.roles.map((role) => {
//     return role.roleLabel;
//   });
//   const eventIds = me.roles
//     .filter((role) => {
//       return (
//         role.roleLabel === RoleLabel.EventOrganizer ||
//         role.roleLabel === RoleLabel.EventSupporter ||
//         role.roleLabel === RoleLabel.EventHelper
//       );
//     })
//     .map((role) => {
//       return role.eventId;
//     });

//   if (roleLabels.indexOf(RoleLabel.SystemAdmin) >= 0) {
//     return { [Op.or]: literal("1=1") } as WhereAttributeHash;
//   }

//   if (eventIds.length > 0) {
//     aclFilters.push({
//       [Op.and]: {
//         id: { [Op.in]: eventIds },
//       },
//     } as WhereAttributeHash);
//   }

//   if (aclFilters.length === 0) {
//     return { [Op.or]: literal("1=0") } as WhereAttributeHash;
//   } else {
//     return { [Op.or]: aclFilters } as WhereAttributeHash;
//   }
// }

// function canUpdate(me: MeSummary): boolean {
//   return hasAnyRole(me, [RoleLabel.SystemAdmin, RoleLabel.EventOrganizer]);
// }

// function toLocalDateForEmail(date: Date): string {
//   return moment(date).tz("Asia/Hong_Kong").format("DD/MM/YY");
// }

// async function listFRCManagers(): Promise<RoleUserSummary[]> {
//     return await RoleService.search(null, { roleLabel: RoleLabel.FRCManager });
// }

export {
  search,
  create,
};
