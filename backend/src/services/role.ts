
import { literal, Op, OrOperator, WhereOptions, WhereValue, WhereAttributeHash } from 'sequelize';
import { ApiError, apiUnauthorizedError } from '../models/error';
import { Role } from '../repo/role';
import { MeSummary, RoleLabel, RoleUserSummary } from '../models/model';
import { hasAnyRole } from './authn';
import { getUserDetailsByNetId } from '../utilities/iamapi';
import { RoleUserAttributes } from '../repo/roleUser';
import { RoleUser } from '../repo/roleUser';
import { User } from '../repo/user';
import { PaginationParam, PaginationResult } from '../utilities/pagination';

interface SearchFilter {
  roleLabel?: string[] | string,
  netId?: string[] | string,
  eventId?: string[] | string
}

async function search(doer: MeSummary, filter: SearchFilter): Promise<RoleUserSummary[]> {
  return (await searchPaginated(doer, filter, {})).rows;
}

async function searchPaginated(doer: MeSummary, filter: SearchFilter, paginationParam: NonNullable<PaginationParam>): Promise<PaginationResult<RoleUserSummary[]>> {
  const searchFilters: WhereOptions<RoleUserAttributes>[] = [];

  if (!!filter.roleLabel) { searchFilters.push({ [Op.and]: { '$role.roleLabel$': filter.roleLabel } }); }
  if (!!filter.netId) { searchFilters.push({ [Op.and]: { '$user.netId$': filter.netId } }); }
  if (!!filter.eventId) { searchFilters.push({ eventId: filter.eventId }); }

  const dbRoleUsers = await RoleUser.findAndCountAll({
    where: {
      [Op.and]:
        [
          evalReadAcl(doer),
          ...searchFilters
        ]
    } as WhereAttributeHash,
    include: [
      {
        model: Role,
        as: 'role',
        required: true,
      },
      {
        model: User,
        as: 'user',
        required: true,
      },
    ],
    ...paginationParam,
  });

  return {
    rows: dbRoleUsers.rows.map((roleAssignment => {
      return {
        id: roleAssignment.id,
        roleLabel: roleAssignment.role.roleLabel,
        roleEventId: roleAssignment.eventId,
        netId: roleAssignment.user.netId,
        userType: roleAssignment.user.userType,
        userId: roleAssignment.user.userId,
        fullName: roleAssignment.user.fullName,
        displayName: roleAssignment.user.displayName,
        deptAbbr: roleAssignment.user.deptAbbr,
        email: roleAssignment.user.email,
        createdAt: roleAssignment.createdAt,
        updatedAt: roleAssignment.updatedAt,
      };
    })),
    totalCount: dbRoleUsers.count
  };
}

async function assign(doer: MeSummary, roleLabel: string, netId: string, eventId?: string): Promise<void> {
  if (!canUpdate(doer, roleLabel, eventId)) { throw apiUnauthorizedError; }

  const iamUser = await getUserDetailsByNetId(netId);
  if (!iamUser) { throw new ApiError("NetID not found."); }
  const [dbUser, created] = await User.findOrCreate({
    where: {
      netId,
    },
    defaults: {
      userType: iamUser.userType,
      userId: iamUser.userId,
      fullName: iamUser.fullName,
      displayName: iamUser.displayName,
      deptAbbr: iamUser.deptAbbr,
      email: iamUser.email,
      surname: iamUser.surname,
      givenName: iamUser.givenName,
      isTermOfUseAccepted: false
    }
  });
  if (!dbUser) { throw new ApiError("User not found."); }

  const dbRole = await Role.findByPk(roleLabel);
  if (!dbRole) { throw new ApiError("Role not found."); }

  const roleAssignments = await RoleUser.findAll({
    where: {
      roleLabel: dbRole.roleLabel,
      netId: dbUser.netId,
      eventId
    }
  });

  if (roleAssignments.length > 0) {
    throw new ApiError(`Role already assigned before: ${roleLabel} ${!!eventId ? eventId : ''}.`);
  }

  if (!hasAnyRole(doer, [RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter])) {
    throw new ApiError(`You have no right to assign roles.`);
  }
  // else {
  //   const meSummaryDeptAbbrArray = doer?.roles?.map((role) => role?.eventId)
  //   if (meSummaryDeptAbbrArray?.indexOf(user?.deptAbbr) < 0) {
  //     throw new ApiError(`NetID ${netId} and you are not in the same Department. Action aborted.`);
  //   }
  // }

  await RoleUser.create({
    roleLabel: dbRole.roleLabel,
    netId: dbUser.netId,
    eventId,
  });
}

async function revoke(doer: MeSummary, roleLabel: string, netId: string, eventId?: string): Promise<void> {
  if (!canUpdate(doer, roleLabel, eventId)) { throw apiUnauthorizedError; }

  const dbUser = await User.findByPk(netId);
  if (!dbUser) { throw new ApiError("User not found."); }

  const dbRole = await Role.findByPk(roleLabel);
  if (!dbRole) { throw new ApiError("Role not found."); }

  const roleAssignments = await RoleUser.findAll({
    where: {
      roleLabel: dbRole.roleLabel,
      netId: dbUser.netId,
      eventId
    }
  });

  if (roleAssignments.length === 0) {
    throw new ApiError(`Role not assigned before: ${roleLabel} ${!!eventId ? eventId : ''}.`);
  }

  await roleAssignments[0].destroy();
}

function evalReadAcl(doer: MeSummary): OrOperator<RoleUserAttributes> {
  // Bypass ACL if me is null
  if (doer === null) {
    return { [Op.or]: literal('1=1') };
  }

  // Otherwise, evaluate ACL based on me
  const aclFilters: WhereValue<RoleUserAttributes>[] = [];

  const roleLabels = doer.roles.map(role => { return role.roleLabel });

  // Allow Service Admin to read HoU, HoU Delegates, and Service Admin
  if (roleLabels.indexOf(RoleLabel.SystemAdmin) >= 0) {
    aclFilters.push({
      [Op.and]: {
        '$role.roleLabel$': { [Op.in]: [RoleLabel.Admin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter, RoleLabel.EventHelper] }
      }
    } as WhereAttributeHash);
  }

  // Allow EventOrganizers & EventSupporters to read EventSupporter and EventHelper of their events
  const houDeptAbbr = doer.roles
    .filter(role => { return role.roleLabel === RoleLabel.EventOrganizer || role.roleLabel === RoleLabel.EventSupporter })
    .map(role => { return role.eventId });
  if (houDeptAbbr.length > 0) {
    aclFilters.push({
      [Op.and]: {
        '$role.roleLabel$': { [Op.in]: [RoleLabel.EventSupporter, RoleLabel.EventHelper] },
        eventId: { [Op.in]: houDeptAbbr }
      }
    } as WhereAttributeHash);
  }

  // Return "deny all" ACL if no ACL is granted
  if (aclFilters.length === 0) {
    return { [Op.or]: literal('1=0') };
  }
  // Return granted ACL
  else {
    return { [Op.or]: aclFilters };
  }
}

function canUpdate(doer: MeSummary, roleLabel: string, eventId: string): boolean {
  if (roleLabel !== RoleLabel.EventHelper && roleLabel !== RoleLabel.EventSupporter) {
    return false;
  }

  if (hasAnyRole(doer, [RoleLabel.SystemAdmin])) {
    return true;
  }

  if (hasAnyRole(doer, [RoleLabel.EventOrganizer, RoleLabel.EventSupporter])) {
    if (roleLabel === RoleLabel.EventHelper || roleLabel === RoleLabel.EventSupporter) {
      const allowedEvents = doer.roles.filter(r => r.roleLabel === RoleLabel.EventOrganizer || r.roleLabel === RoleLabel.EventSupporter).map(r => r.eventId);
      if (allowedEvents.indexOf(eventId) >= 0) {
        return true;
      }
    }
  }

  return false;
}

export { search, searchPaginated, assign, revoke }

