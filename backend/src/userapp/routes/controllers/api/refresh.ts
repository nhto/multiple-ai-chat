import express, { NextFunction, Request, Response } from 'express';
import { ApiError } from '../../../../models/error';
import { createApiResponse } from '../../../../models/model';

import { getTokenSetByRefreshTokenAsync } from '../../../../utilities/keycloak';
import { RoleLabel } from '../../../../models/model';

const router = express.Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!!req.session.data?.me) {
      if (req.session.data.me?.userType === RoleLabel.Alumni || req.session.data.me?.userType === RoleLabel.Guests) {
        // for user type login with keycloak
        const tokenSet = await getTokenSetByRefreshTokenAsync(req.session.data.me?.userType, req.session.data.refreshToken);
        if (!!tokenSet.refresh_token) {
          req.session.data.refreshToken = tokenSet.refresh_token;
        }
        if (!!tokenSet.access_token) {
          req.session.data.accessToken = tokenSet.access_token;
        }
      }
      return res.status(200).send(createApiResponse(null, req.session.data.me));
    }
    else {
      throw new ApiError('Session timed out.');
    }
  } catch (err) {
    return next(err);
  }
});

export default router;