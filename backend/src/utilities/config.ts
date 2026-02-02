
/**
 * dotenv .env file import
 * TODO: Configure NODE_ENV in .env file, and set default to 'production'
 */
import dotenv from 'dotenv';

dotenv.config({ path: process.env.DOTENV_CONFIG_PATH });
process.env.NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV : 'production';

const NODE_ENV: string = process.env.NODE_ENV || 'production';
const LOGGING_LEVEL: string = process.env.LOGGING_LEVEL || 'info';
const APP_URL: string = process.env.APP_URL;
const HTTP_LISTEN_PORT: string | number = normalizePort(process.env.HTTP_LISTEN_PORT) || 3000;

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val: string) {
  const port = parseInt(val, 10);
  if (isNaN(port)) {
    // named pipe
    return val;
  }
  if (port >= 0) {
    // port number
    return port;
  }
  return false;
}

export {
  NODE_ENV,
  LOGGING_LEVEL,
  APP_URL,
  HTTP_LISTEN_PORT,
};
