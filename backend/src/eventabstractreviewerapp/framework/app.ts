import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';

import polyussoRouter from '../routes/controllers/polyusso';
import keycloakRouter from '../routes/controllers/keycloak';
import logoutRouter from '../routes/controllers/logout';
import spaRouter from '../routes/controllers/spa';
import olppCallbackRouter from '../routes/controllers/olpp';
import { handleError, logError } from '../routes/middlewares/error';

import pingRouter from '../routes/controllers/api/ping';
import refreshRouter from '../routes/controllers/api/refresh';
import meRouter from '../routes/controllers/api/me';
import configRouter from '../routes/controllers/api/config';
import roleRouter from '../routes/controllers/api/role';
import iamRouter from '../routes/controllers/api/iam';
import notfoundRouter from '../routes/controllers/api/notfound';
import filesRouter from "../routes/controllers/api/eventFiles"
import abstractReviewerRouter from "../routes/controllers/api/abstractReviewers"

import sessionMiddleware from './session';

import { extendActiveSession, requireActiveSession, requireRole } from '../routes/middlewares/authn';
import { RoleLabel } from '../../models/model';

function initHelmet(app: express.Express) {

  // Customize helmet filters to meet web security scan requirement
  // app.use(helmet());
  app.use(helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      imgSrc: ["'self'", "data:", "blob:"],
    }
  }));
  app.use(helmet.dnsPrefetchControl());
  app.use(helmet.expectCt());
  app.use(helmet.frameguard());
  app.use(helmet.hidePoweredBy());
  app.use(helmet.hsts());
  app.use(helmet.ieNoOpen());
  app.use(helmet.noSniff());
  app.use(helmet.permittedCrossDomainPolicies());
  app.use(helmet.referrerPolicy());

  // Web Security Scan report suggested not sending setting this header at all
  // app.use(helmet.xssFilter());
}

function initMorgan(app: express.Express) {
  morgan.token('x-forwarded-for', (req, res) => { return JSON.stringify(req.headers['x-forwarded-for']) });
  // log format: Apache Commoon with x-forwarded-for appended
  app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :x-forwarded-for'));
}

const expressApp = express();

// initHelmet(expressApp);
// initMorgan(expressApp);

expressApp.use(express.json({ limit: '50gb' }));
expressApp.use(express.urlencoded({ extended: false }));
expressApp.use(sessionMiddleware);

// All API requests require active session
// expressApp.use('/api', requireActiveSession);

// Handle API requests
expressApp.use('/api/ping', pingRouter);
expressApp.use('/api/files', filesRouter);
expressApp.use('/api/abstracts/reviewers', abstractReviewerRouter)
expressApp.use('/api/refresh', extendActiveSession, refreshRouter);
expressApp.use('/api/me', extendActiveSession, meRouter);
expressApp.use('/api/config', extendActiveSession, configRouter);
expressApp.use('/api/role', extendActiveSession, requireRole([RoleLabel.User]), roleRouter);
expressApp.use('/api/iam', extendActiveSession, requireRole([RoleLabel.User]), iamRouter);

// Special output should be returned if no API endpoints matched.
expressApp.use('/api', notfoundRouter);

// error handler
expressApp.use('/api', handleError);

// handle every other route with index.html, which will contain
// a script tag to your application's JavaScript file(s).
expressApp.use(polyussoRouter);
expressApp.use(keycloakRouter);
expressApp.use(logoutRouter);
expressApp.use(olppCallbackRouter);
expressApp.use(spaRouter);
// error handler
expressApp.use(logError);

export default expressApp;