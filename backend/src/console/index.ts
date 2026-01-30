import '../repo';
import { renderEmail, sendEmail } from "../utilities/email";
import logger from '../utilities/logger';
import job1 from './job1';
import job2 from './job2';
import job3 from './job3';
import job_payment_status_update from './job_payment_status_update';
import job_handle_payment_interface_file from './job_handle_payment_interface_file';
import job_delete_event from './job_delete_event';
import job_handle_payment_interface_file_auto from './job_handle_payment_interface_file_auto';
import { sendAbstractSubmissionReminder } from '../services/abstractSubmissionReminder';

async function main() {
  try {
    if (!Array.isArray(process.argv) || process.argv.length < 3) {
      console.error('Usage: npm run console -- job1|job2|job3|job_payment_status_update|interfaces|ams_submission_reminder');
      throw new Error('Invalid command line argument: ' + JSON.stringify(process.argv));
    }

    console.debug("Received process.argv[2]: " + process.argv[2]);

    switch (process.argv[2]) {
      case 'job1': await job1(); break;
      case 'job2': await job2(); break;
      case 'job3': await job3(); break;
      case 'job_payment_status_update': await job_payment_status_update(); break;
      case 'interfaces': await job_handle_payment_interface_file(); break;
      case 'interfaces_auto': await job_handle_payment_interface_file_auto(); break;
      case 'ams_submission_reminder': await sendAbstractSubmissionReminder(); break;
      // for local use, try this: DOTENV_CONFIG_PATH=./.env.dev npm run console de 49D375E6-E67B-428C-8CC1-5A4AAB9C9C45
      case 'de': await job_delete_event(process?.argv[3]); break;
      default:
        console.error('Usage: npm run console -- job1|job2|job3|job_payment_status_update|interfaces|ams_submission_reminder');
        throw new Error('Invalid command line argument: ' + JSON.stringify(process.argv));
    }
  }
  catch (err) {
    // await sendAlert(err);
    throw err;
  }
};

async function sendAlert(err: any) {
  for (let i = 0; i < 3; i++) {
    try {
      const email = await renderEmail('console_alert', ["bill.lam@polyu.edu.hk"], [], [], { message: err });
      await sendEmail(email);
      return;
    }
    catch (error) {
      logger.warn('Error sending console alert email. Retrying...');
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

main().then(
  result => {
    logger.warn('Console job finished.');
  },
  err => {
    logger.warn('Error running console job: ' + err?.message);
  }
);