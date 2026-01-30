import { Op } from "sequelize";
import { renderEmail, sendEmail } from "../utilities/email";
import { Attendance } from "../repo/attendance";
import { Event } from "../repo/event";
import logger from '../utilities/logger';
import moment from "moment";
import * as config from '../utilities/config';
import '../repo';

export default async function main() {
  logger.info('job 3 started.');
};

function toLocalDateForEmail(date: Date): string {
  return moment(date).tz('Asia/Hong_Kong').format('DD/MM/YY');
}

// main().then(
//   result => {
//     // Do nothing
//   },
//   err => {
//     // Deal with the fact the chain failed
//   }
// );