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
    EventSessionSummary,
    MeSummary,
    RoleLabel,
    RoleUserSummary,
} from "../models/model";
import { hasAnyRole } from "./authn";
import { renderEmail, sendEmail } from "../utilities/email";

import { RoleUser } from "../repo/roleUser";
import { Event, EventAttributes } from "../repo/event";
import { EventSession, EventSessionAttributes } from "../repo/eventSession";

import * as RoleService from "./role";

async function search(
    me: MeSummary,
    filter?: {
        eventId?: string;
        venue?: string;
        quota?: number;
        used?: number;
        details?: string;
        // needPayment?: boolean;
        // price?: number;
        // price_eb?: number;
        allowWalkIn?: boolean;
        from?: Date;
        to?: Date;
    }
): Promise<EventSessionSummary[]> {
    const eventSessionWhereOptions: WhereOptions<EventSessionAttributes> = {};
    // const departmentWhereOptions: WhereOptions<DepartmentAttributes> = {};

    if (!!filter?.eventId) { eventSessionWhereOptions.eventId = filter.eventId; }
    if (!!filter?.venue) { eventSessionWhereOptions.venue = filter.venue; }
    if (!!filter?.quota) { eventSessionWhereOptions.quota = filter.quota; }
    if (!!filter?.used) { eventSessionWhereOptions.used = filter.used; }
    if (!!filter?.details) { eventSessionWhereOptions.details = filter.details; }
    // if (!!filter?.needPayment) { eventSessionWhereOptions.needPayment = filter.needPayment; }
    // if (!!filter?.price) { eventSessionWhereOptions.price = filter.price; }
    // if (!!filter?.price_eb) { eventSessionWhereOptions.price_eb = filter.price_eb; }
    if (!!filter?.allowWalkIn) { eventSessionWhereOptions.allowWalkIn = filter.allowWalkIn; }
    if (!!filter?.from) { eventSessionWhereOptions.from = filter.from; }
    if (!!filter?.to) { eventSessionWhereOptions.to = filter.to; }

    const eventSessions = await EventSession.findAll({
        where: {
            [Op.and]: [
                // evalReadAcl(me),
                eventSessionWhereOptions
            ],
        } as WhereAttributeHash,
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

    return eventSessions.map((session) => {
        return {
            id: session.id,
            eventId: session.eventId,
            venue: session.venue,
            quota: session.quota,
            used: session.used,
            details: session.details,
            // needPayment: session.needPayment,
            // price: session.price,
            // price_eb: session.price_eb,
            allowWalkIn: session.allowWalkIn,
            from: session.from,
            to: session.to,
            createdAt: session.createdAt,
            updatedAt: session.updatedAt,
            disabled: session.disabled,
        };
    });
}

async function create(
    me: MeSummary,
    eventId: string,
    details: string,
    venue: string,
    quota: number,
    used: number,
    // needPayment: boolean,
    // price: number,
    // price_eb: number,
    allowWalkIn: boolean | null,
    from: Date,
    to: Date
): Promise<EventSessionSummary> {
    if (!canUpdate(me)) { throw apiUnauthorizedError; }

    const eventSessionCount = await EventSession.count({ where: { eventId, details } });
    if (eventSessionCount > 0) { throw new ApiError(`Event Session already exists!`); }

    const eventSession = await EventSession.create({
        eventId,
        details,
        venue,
        quota,
        used,
        // needPayment,
        // price,
        // price_eb,
        allowWalkIn,
        from,
        to,
        disabled: false
    });

    return eventSession.get();
}

async function modify(
    me: MeSummary,
    id: string,
    eventId: string,
    venue: string,
    quota: number,
    // used: number,
    details: string,
    allowWalkIn: boolean,
    from: Date,
    to: Date
): Promise<EventSessionAttributes> {
    if (!canUpdate(me)) { throw apiUnauthorizedError; }

    const eventSession = await EventSession.findOne({ where: { id } });
    if (!eventSession) { throw new ApiError(`Event Session not found!`); }

    eventSession.eventId = eventId;
    eventSession.venue = venue;
    eventSession.quota = quota;
    // eventSession.used = used;
    eventSession.details = details;
    eventSession.allowWalkIn = allowWalkIn;
    eventSession.from = from;
    eventSession.to = to;
    await eventSession.save();

    return eventSession.get();
}

async function disable(
    me: MeSummary,
    id: string,
): Promise<EventSessionAttributes> {
    if (!canUpdate(me)) { throw apiUnauthorizedError; }

    const eventSession = await EventSession.findOne({ where: { id } });
    if (!eventSession) { throw new ApiError(`Event Session not found!`); }

    eventSession.disabled = !!eventSession.disabled ? false : true;
    await eventSession.save();

    return eventSession.get();
}

function evalReadAcl(me: MeSummary): WhereValue<EventSessionAttributes> {
    const aclFilters: WhereValue<EventSessionAttributes>[] = [];

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
    return hasAnyRole(me, [RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]);
}

function toLocalDateForEmail(date: Date): string {
    return moment(date).tz("Asia/Hong_Kong").format("DD/MM/YY");
}

// async function listFRCManagers(): Promise<RoleUserSummary[]> {
//     return await RoleService.search(null, { roleLabel: RoleLabel.FRCManager });
// }

export {
    search,
    create,
    modify,
    disable
    // updateEventDateTime,
    // updateRoster,
    // listHoUForEvent
};
