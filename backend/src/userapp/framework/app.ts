import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import spaRouter from '../routes/controllers/spa';
import chatRouter from '../routes/controllers/api/chat';
import handleError from '../routes/middlewares/error';
import * as config from '../../utilities/config'

function initHelmet(app: express.Express) {

  // Customize helmet filters to meet web security scan requirement
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
  morgan.token('user-agent', (req, res) => { return req.headers['user-agent'] || 'unknown'; });
  // log format: Apache Common with x-forwarded-for and user-agent appended
  app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :x-forwarded-for ":user-agent"'));
}

const expressApp = express();

initHelmet(expressApp);
initMorgan(expressApp);

// Enable CORS for frontend
expressApp.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Allow large JSON payloads for chat with images (base64); 5 images × 10MB ≈ 66MB base64
expressApp.use(express.json({ limit: '70mb' }));
expressApp.use(express.urlencoded({ extended: false, limit: '70mb' }));

// API routes
expressApp.use('/api/chat', chatRouter);

// SPA routes (should be last)
expressApp.use(spaRouter);

// error handler
expressApp.use(handleError);

export default expressApp;
