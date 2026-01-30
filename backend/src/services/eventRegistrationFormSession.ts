import {
  Op,
  WhereOptions,
  WhereAttributeHash,
} from "sequelize";
import { ApiError } from "../models/error";
import {
  EventRegistrationFormSession,
  EventRegistrationFormSessionAttributes
} from "../repo/eventRegistrationFormSession";
import {
  EventRegistrationFormSessionSummary,
  MeSummary,
} from "../models/model";

async function search(me: MeSummary, filter?: { id?: string, eventId?: string, formId?: string, sessionId?: string }): Promise<EventRegistrationFormSessionSummary[]> {
  const whereOptions: WhereOptions<EventRegistrationFormSessionAttributes> = {};
  if (!!filter?.id) { whereOptions.id = filter.id; }
  if (!!filter?.eventId) { whereOptions.formId = filter.eventId; }
  if (!!filter?.formId) { whereOptions.formId = filter.formId; }
  if (!!filter?.sessionId) { whereOptions.sessionId = filter.sessionId; }

  const eventRegistrationFormSession = await EventRegistrationFormSession.findAll({
    where: { [Op.and]: [whereOptions] } as WhereAttributeHash,
  });

  return eventRegistrationFormSession.map((eRFS) => {
    return {
      id: eRFS.id,
      eventId: eRFS.eventId,
      formId: eRFS.formId,
      sessionId: eRFS.sessionId,
      createdAt: eRFS.createdAt,
      updatedAt: eRFS.updatedAt,
      mandatory: eRFS.mandatory,
    };
  });
}

async function create(me: MeSummary, eventId: string, formId: string, sessionId: string, mandatory?: boolean): Promise<EventRegistrationFormSessionAttributes> {
  const eRFSCount = await EventRegistrationFormSession.count({ where: { eventId, formId, sessionId } });
  if (eRFSCount > 0) { throw new ApiError(`Event Registration Form Session already exists!`); }

  const eRFS = await EventRegistrationFormSession.create({ eventId, formId, sessionId, mandatory });
  return eRFS.get();
}

export { search, create };