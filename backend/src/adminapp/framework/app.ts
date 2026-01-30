import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';

import polyussoRouter from '../routes/controllers/polyusso';
import spaRouter from '../routes/controllers/spa';
import { handleError, logError } from '../routes/middlewares/error';

import pingRouter from '../routes/controllers/api/ping';
import refreshRouter from '../routes/controllers/api/refresh';

import meRouter from '../routes/controllers/api/me';
import configRouter from '../routes/controllers/api/config';
import webRouter from '../routes/controllers/api/web';
import webPageRouter from '../routes/controllers/api/webPage';
import webMenuRouter from '../routes/controllers/api/webMenu';
import roleRouter from '../routes/controllers/api/role';
import emailTemplateRouter from '../routes/controllers/api/emailTemplate';
import eventRegistrationRouter from '../routes/controllers/api/eventRegistration';
import eventRegistrationSessionRouter from '../routes/controllers/api/eventRegistrationSession';
import eventSessionRouter from '../routes/controllers/api/eventSession';
import participantRouter from '../routes/controllers/api/participant';
import attendanceRouter from '../routes/controllers/api/attendance';
import departmentRouter from '../routes/controllers/api/department';
import eventRouter from '../routes/controllers/api/event';
import iamRouter from '../routes/controllers/api/iam';
import fileCollectionRouter from '../routes/controllers/api/fileCollection';
import photoGalleryRouter from '../routes/controllers/api/photoGallery';
import eventFilesRouter from '../routes/controllers/api/eventFiles';
import eventNewsRouter from '../routes/controllers/api/eventNews';
import abstractManagementRouter from '../routes/controllers/api/abstractManagement';
import controlPanelRouter from '../routes/controllers/api/controlPanel';
import abstractSubmissionOverviewRouter from '../routes/controllers/api/abstractSubmissionOverview';
import screenAbstractSubmissionRouter from '../routes/controllers/api/screenAbstractSubmission';
import uploadReviewersDecidersRouter from '../routes/controllers/api/uploadReviewersDeciders';
import traceAbstractsPapersStatusRouter from '../routes/controllers/api/traceAbstractsPapersStatus';
import termOfUseRouter from '../routes/controllers/api/termOfUse';
import notfoundRouter from '../routes/controllers/api/notfound';

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

initHelmet(expressApp);
initMorgan(expressApp);

expressApp.use(express.json({ limit: '50gb' }));
expressApp.use(express.urlencoded({ extended: false }));
expressApp.use(sessionMiddleware);

// All API requests require active session
expressApp.use('/api', requireActiveSession);

// Handle API requests
expressApp.use('/api/ping', pingRouter);
expressApp.use('/api/refresh', extendActiveSession, refreshRouter);
expressApp.use('/api/me', extendActiveSession, meRouter);
expressApp.use('/api/config', extendActiveSession, configRouter);
expressApp.use('/api/event/web', extendActiveSession, webRouter);
expressApp.use('/api/event/web-pages', extendActiveSession, webPageRouter);
expressApp.use('/api/event/web-menu', extendActiveSession, webMenuRouter);
expressApp.use('/api/emailTemplate', extendActiveSession, requireRole([RoleLabel.User]), emailTemplateRouter);
expressApp.use('/api/attendance', extendActiveSession, requireRole([RoleLabel.User]), attendanceRouter);
expressApp.use('/api/eventRegistration', extendActiveSession, requireRole([RoleLabel.User]), eventRegistrationRouter);
expressApp.use('/api/eventRegistrationSession', extendActiveSession, requireRole([RoleLabel.User]), eventRegistrationSessionRouter);
expressApp.use('/api/eventSession', extendActiveSession, requireRole([RoleLabel.User]), eventSessionRouter);
expressApp.use('/api/participant', extendActiveSession, requireRole([RoleLabel.User]), participantRouter);
expressApp.use('/api/role', extendActiveSession, requireRole([RoleLabel.User]), roleRouter);
// expressApp.use('/api/department', extendActiveSession, requireRole([RoleLabel.User]), departmentRouter);
expressApp.use('/api/event', extendActiveSession, requireRole([RoleLabel.User]), eventRouter);
expressApp.use('/api/iam', extendActiveSession, requireRole([RoleLabel.User]), iamRouter);
expressApp.use('/api/file-collection', extendActiveSession, requireRole([RoleLabel.User]), fileCollectionRouter);
expressApp.use('/api/photo-gallery', extendActiveSession, requireRole([RoleLabel.User]), photoGalleryRouter);
expressApp.use('/api/event-files', extendActiveSession, requireRole([RoleLabel.User]), eventFilesRouter);
expressApp.use('/api/event-news', extendActiveSession, requireRole([RoleLabel.User]), eventNewsRouter);
expressApp.use('/api/abstract-management', extendActiveSession, requireRole([RoleLabel.User]), abstractManagementRouter);
expressApp.use('/api/control-panel', extendActiveSession, requireRole([RoleLabel.User]), controlPanelRouter);
expressApp.use('/api/abstractSubmissionOverview', extendActiveSession, requireRole([RoleLabel.User]), abstractSubmissionOverviewRouter);
expressApp.use('/api/screenAbstractSubmission', extendActiveSession, requireRole([RoleLabel.User]), screenAbstractSubmissionRouter);
expressApp.use('/api/uploadReviewersDeciders', extendActiveSession, requireRole([RoleLabel.User]), uploadReviewersDecidersRouter);
expressApp.use('/api/traceAbstractsPapersStatus', extendActiveSession, requireRole([RoleLabel.User]), traceAbstractsPapersStatusRouter);
expressApp.use('/api/termOfUse', extendActiveSession, requireRole([RoleLabel.User]), termOfUseRouter);

// Special output should be returned if no API endpoints matched.
expressApp.use('/api', notfoundRouter);

// error handler
expressApp.use('/api', handleError);

// handle every other route with index.html, which will contain
// a script tag to your application's JavaScript file(s).
expressApp.use(polyussoRouter);
expressApp.use(spaRouter);

// error handler
expressApp.use(logError);

export default expressApp;