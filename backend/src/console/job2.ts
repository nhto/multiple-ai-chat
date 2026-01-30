import { Op } from "sequelize";
import { renderEmail, sendEmail } from "../utilities/email";
import { Attendance } from "../repo/attendance";
import { Event } from "../repo/event";
import logger from '../utilities/logger';
import moment from "moment";
import { toLocalDate } from "../utilities/date";
import '../repo';

export default async function main() {
  logger.info('job 2 started.');
  // const events = await Event.findAll({
  //   where: {
  //     eventDateTime: { [Op.between]: [new Date(), new Date(Date.now() + 7 * 86400000)] }
  //   }
  // });

  // for (const event of events) {
  //   logger.info(`Sending email for event ${event.eventId} held on ${toLocalDate(event.eventDateTime)}`);
  //   const attendances = await Attendance.findAll({
  //     where: {
  //       eventId: event.eventId
  //     }
  //   });

  //   for (const attendance of attendances) {
  //     if (!!attendance.email) {
  //       try {
  //         const email = await renderEmail('attendance_reminder', [attendance.email], [], [], { eventDate: toLocalDateForEmail(event.eventDateTime), fullName: attendance.fullName });
  //         await sendEmail(email);
  //       }
  //       catch (err) {
  //         logger.error(err);
  //       }
  //     }
  //   }
  // }

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