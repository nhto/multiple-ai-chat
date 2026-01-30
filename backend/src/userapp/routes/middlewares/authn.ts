import { Request, Response, NextFunction } from "express";
import { ApiError, apiSessionTimeoutError, apiUnauthorizedError } from './../../../models/error';
import * as config from '../../../utilities/config';

function hasActiveSession(req: Request): boolean {
  if (!req.session?.data?.isAuthenticated) {
    return false;
  }

  if (!req.session?.data?.lastActivityAt) {
    return false;
  }

  // TODO: Make session timeout configurable
  const activityExpiryTimestamp = Date.parse(req.session.data.lastActivityAt) + (config.SESSION_TIMEOUT * 60 * 1000);
  const currentTimestamp = new Date().getTime();

  if (activityExpiryTimestamp < currentTimestamp) {
    return false;
  }

  return true;
}


function requireActiveSession(req: Request, res: Response, next: NextFunction) {
  if (!hasActiveSession(req)) {
    req.session.destroy(() => null);
    return next(apiSessionTimeoutError);
  }

  return next();
}

function requireRole(roleLabel: string[] | string) {
  let roleLabels: string[] = [];
  if (!!roleLabel) {
    if (Array.isArray(roleLabel)) {
      roleLabels = [...roleLabels, ...roleLabel];
    }
    else {
      roleLabels = [...roleLabels, String(roleLabel)];
    }
  }

  return async (req: Request, res: Response, next: NextFunction) => {
    if (!hasActiveSession(req)) {
      req.session.destroy(() => null);
      return next(apiSessionTimeoutError);
    }

    const me = req.session.data.me;

    for (const meRole of me?.roles) {
      if (roleLabels.indexOf(meRole.roleLabel) >= 0) {
        return next();
      }
    }

    return next(apiUnauthorizedError);
  }
}

function extendActiveSession(req: Request, res: Response, next: NextFunction) {
  if (!hasActiveSession(req)) {
    req.session.destroy(() => null);
    return next(apiSessionTimeoutError);
  }

  req.session.data.lastActivityAt = (new Date()).toISOString();

  return next();
}

export { requireActiveSession, extendActiveSession, requireRole };
