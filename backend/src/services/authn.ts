import logger from './../utilities/logger';
import * as model from '../models/model';

import { MeSummary, RoleLabel } from '../models/model';

import { User } from '../repo/user';
import { ApiError } from '../models/error';

import * as RoleService from './role';

async function getMeSummary(netId: string): Promise<MeSummary> {

  const dbUser = await User.findByPk(netId);

  if (!dbUser) {
    throw new ApiError("Invalid NetID.");
  }

  const roleUserSummary = await RoleService.search(null, { netId });

  return {
    netId: dbUser.netId,
    userType: dbUser.userType,
    userId: dbUser.userId,
    deptAbbr: dbUser.deptAbbr,
    name: {
      surname: dbUser.surname,
      givenName: dbUser.givenName,
    },
    email: dbUser.email,
    roles: [
      {
        roleLabel: RoleLabel.User,
        eventId: null,
      },
      ...roleUserSummary.map(asm => {
        return {
          roleLabel: asm.roleLabel,
          eventId: asm.roleEventId,
        };
      }).filter((value, index, self) =>
        index === self.findIndex((t) => (
          t.roleLabel === value.roleLabel && t.eventId === value.eventId
        ))
      ),
    ],
  };
}

async function getNonRegisterUserMeSummary(): Promise<MeSummary> {
  return {
    netId: RoleLabel.Guests,
    userType: RoleLabel.Guests,
    userId: RoleLabel.Guests,
    deptAbbr: RoleLabel.Guests,
    name: {
      surname: null,
      givenName: null,
    },
    email: null,
    roles: [
      {
        roleLabel: RoleLabel.User,
        eventId: null,
      },
      {
        roleLabel: RoleLabel.Guests,
        eventId: null,
      },
    ],
  };
}

function hasAnyRole(me: MeSummary, roleLabel: RoleLabel[] | RoleLabel): boolean {
  const roleLabels = Array.isArray(roleLabel) ? roleLabel.map(r => String(r)) : [String(roleLabel)];

  for (const role of me.roles) {
    if (roleLabels.indexOf(role.roleLabel) >= 0) {
      return true;
    }
  }

  return false;
}

async function syncUser(user: model.User): Promise<void> {
  if (!user.netId) {
    throw new ApiError("Missing NetID.");
  }

  await User.upsert({
    netId: user.netId,
    userType: user.userType,
    userId: user.userId,
    fullName: user.fullName,
    displayName: user.displayName,
    surname: user.surname,
    givenName: user.givenName,
    deptAbbr: user.deptAbbr,
    email: user.email,
    // isTermOfUseAccepted: false,
  });
}

function isLoginAuthorized(user: model.User): boolean {
  if (user.userType === 'Staff' || user.userType === 'Student'|| user.userType === 'Functional') {
    return true;
  }
  else {
    return false;
  }
}

export { getMeSummary, getNonRegisterUserMeSummary, hasAnyRole, isLoginAuthorized, syncUser };
