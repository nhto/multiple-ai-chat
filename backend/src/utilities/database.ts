import { Sequelize, Options, DATE } from 'sequelize';
import logger from './logger';
import * as config from './config';

// Override timezone formatting
DATE.prototype._stringify = function (date: any, options: any) {
  date = this._applyTimezone(date, options);

  // Z here means current timezone, _not_ UTC
  // return date.format('YYYY-MM-DD HH:mm:ss.SSS Z');
  return date.format('YYYY-MM-DD HH:mm:ss');
};

// TODO: Timezone?
const sequelize = new Sequelize(
  config.DB_DB,
  config.DB_USER,
  config.DB_PASSWORD,
  {
    dialect: 'mssql',
    host: config.DB_SERVER,
    port: config.DB_PORT,
    database: config.DB_DB,
    timezone: '+08:00',
    dialectOptions: {
      options: {
        trustedConnection: true,
        encrypt: true,
        enableArithAbort: true,
        trustServerCertificate: true,
        useUTC: false,
      },
      connectionString: `Driver={ODBC Driver 17 for SQL Server};Data Source=${config.DB_SERVER},${config.DB_PORT};Database=${config.DB_DB};User ID=${config.DB_USER};Password=${config.DB_PASSWORD};Connect Timeout=60;Encrypt=True;TrustServerCertificate=True;ApplicationIntent=ReadWrite`
    },
    logging: (msg) => logger.debug(msg),
  },
);



export { sequelize };