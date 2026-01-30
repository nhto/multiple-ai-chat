/**
 * Module dependencies.
 */
import '../utilities/config';
import '../repo';
import app from './framework/app'
import startServer from './framework/http';

startServer(app);