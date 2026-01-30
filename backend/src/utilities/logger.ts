import * as config from './config';
import winston from 'winston';

const transports = [];
if (config.NODE_ENV !== 'development') {
  transports.push(
    new winston.transports.Console()
  );
}
else {
  transports.push(
    new winston.transports.Console()
  );
  // TODO: Send log to splunk
  // transports.push(
  //  new winston.transports.Console({
  //    format: winston.format.combine(
  //      winston.format.cli(),
  //      winston.format.splat(),
  //    )
  //  })
  // )
}

// TODO: Configure log level in .env file, and set default to 'info'

const LoggerInstance = winston.createLogger({
  level: config.LOGGING_LEVEL,
  levels: winston.config.npm.levels,
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  transports
});

export default LoggerInstance;