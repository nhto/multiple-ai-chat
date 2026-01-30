
import session from 'express-session';
import sessionSequelize from 'connect-session-sequelize';

import { sequelize } from '../../utilities/database';
import { MeSummary } from '../../models/model';
import { IdTokenClaims } from 'openid-client';

import * as config from '../../utilities/config';

declare module 'express-session' {
  interface SessionData {
    netId: string;
    sub: string;
    data: {
      codeVerifier: string,
      originUrl: string,
      logoutUrl: string,
      lastActivityAt: string,
      idToken: IdTokenClaims,
      accessToken: string,
      refreshToken: string,
      isAuthenticated: boolean,
      me: MeSummary
    };
  }
}

function extendDefaultFields(defaults: any, sess: any) {
  return {
    data: defaults.data,
    expires: defaults.expires,
    netId: sess.netId,
  };
}

const SessionSequelizeStore = sessionSequelize(session.Store);
const store = new SessionSequelizeStore({
  db: sequelize,
  table: "Session",
  extendDefaultFields,
});

const sessionMiddleware = session({
  secret: '@#hnZ$uy7nv7Q7Eu#EcL',
  store,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: config.SESSION_TIMEOUT * 1000 }
});

export default sessionMiddleware;
