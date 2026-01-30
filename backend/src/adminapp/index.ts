/**
 * Module dependencies.
 */
import '../utilities/config';
import '../repo';
import app from './framework/app'
import startServer from './framework/http';
import cron from "node-cron";
import { initAsync as initPolyuSsoAsync } from '../utilities/polyusso';
import { sendAbstractSubmissionReminder } from '../services/abstractSubmissionReminder';

(async () => {
  await initPolyuSsoAsync();
})();
startServer(app);

// Schedule cron job for every day at 4 AM
// cron.schedule("0 8 * * *", async () => {
//   console.log("Running cron job every day at 8 AM...");
//   try {
//     await sendAbstractSubmissionReminder();
//     console.log("Reminder emails- abstract submission sent successfully.");
//   } catch (error) {
//     console.error("Error sending reminder emails:", error);
//   }
// });