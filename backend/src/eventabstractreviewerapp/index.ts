/**
 * Module dependencies.
 */
import "../utilities/config";
import "../repo";
import app from "./framework/app";
import startServer from "./framework/http";
import { initAsync as initPolyuSsoAsync } from "../utilities/polyusso";
import { initAsync as initKeycloakAsync } from "../utilities/keycloak";
import { KeycloakLoginType } from "../models/model";
import cron from "node-cron";
import { sendReviewReminder } from "../services/eventAbstractReviews/cronjob/reviewerReminder";

(async () => {
  await initPolyuSsoAsync();
  await initKeycloakAsync(KeycloakLoginType.alumni);
  await initKeycloakAsync(KeycloakLoginType.public);
})();
startServer(app);

cron.schedule("0 0 */3 * *", async () => {
  console.log("Running cron job every 3 days...");
  try {
    await sendReviewReminder();
    console.log("Reminder emails sent successfully.");
  } catch (error) {
    console.error("Error sending reminder emails:", error);
  }
});
