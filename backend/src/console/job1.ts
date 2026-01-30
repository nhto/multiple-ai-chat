import { Op } from "sequelize";
import { renderEmail, sendEmail } from "../utilities/email";
import { Attendance } from "../repo/attendance";
import { Event } from "../repo/event";
import logger from '../utilities/logger';
import moment from "moment";
import { toLocalDate } from "../utilities/date";
// import { listHoUForEvent } from "../services/event";
import * as config from '../utilities/config';
import '../repo';

export default async function main() {
  logger.info('job 1 started.');

  // const events = await Event.findAll({
  //   where: {
  //     eventDateTime: { [Op.between]: [new Date(), new Date(Date.now() + 7 * 86400000)] }
  //   }
  // });

  // for (const event of events) {
  //   logger.info(`Sending email to HoU for event ${event.eventId} held on ${toLocalDate(event.eventDateTime)}`);

  //   const hous = await listHoUForEvent(event.eventId);

  //   for (const hou of hous) {
  //     if (!!hou.email) {
  //       try {
  //         const email = await renderEmail('attendance_registration_reminder', [hou.email], [], [], { eventDate: toLocalDateForEmail(event.eventDateTime), appUrl: config.APP_URL });
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
