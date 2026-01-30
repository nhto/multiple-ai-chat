import * as AbstractReviewersService from "../abstractReviewers";
import { sendEmail } from "../../../utilities/email";
import {
  generateReviewerReminderEmailContent,
  getMailOptions,
  generateEmailDeliveryLogData,
} from "../../../utilities/payload";

function addPendingAbstractToReviewer(
  reviewerPendingAbstracts: Map<
    number,
    {
      reviewerEmail: string;
      abstracts: { abstractId: number; title: string }[];
    }
  >,
  reviewerId: number,
  reviewerEmail: string,
  abstractId: number,
  abstractTitle: string
) {
  if (!reviewerPendingAbstracts.has(reviewerId)) {
    reviewerPendingAbstracts.set(reviewerId, {
      reviewerEmail: reviewerEmail,
      abstracts: [],
    });
  }

  if (reviewerPendingAbstracts.has(reviewerId)) {
    reviewerPendingAbstracts.get(reviewerId)?.abstracts.push({
      abstractId: abstractId,
      title: abstractTitle,
    });
  }
}

// Sample data structure for reviewerPendingAbstracts
// [
//   [
//     1,
//     {
//       reviewerEmail: "reviewer1@example.com",
//       abstracts: [{ abstractId: 101, title: "Abstract 1" }],
//     },
//   ],
//   [
//     2,
//     {
//       reviewerEmail: "reviewer2@example.com",
//       abstracts: [
//         { abstractId: 102, title: "Abstract 2" },
//         { abstractId: 103, title: "Abstract 3" },
//       ],
//     },
//   ],
// ];

async function sendReminderEmail(
  reviewerEmail: string,
  eventTopic: string,
  abstracts: { abstractId: number; title: string }[],
  eventId: string,
  reviewerId: number
) {
  const emailContent = generateReviewerReminderEmailContent(
    eventTopic,
    abstracts
  );
  const subject = "Reminder: Timely Action for Abstract Review";
  const mailOptions = getMailOptions([reviewerEmail], emailContent, subject);
  await sendEmail(mailOptions);
  await logEmailDeliveries(
    eventId,
    reviewerId,
    mailOptions,
    emailContent,
    abstracts
  );
}

async function logEmailDeliveries(
  eventId: string,
  reviewerId: number,
  mailOptions: any,
  emailTemplate: any,
  abstracts: { abstractId: number; title: string }[]
) {
  for (const { abstractId } of abstracts) {
    await AbstractReviewersService.insertEmailDeliveryLog(
      generateEmailDeliveryLogData(
        eventId,
        abstractId,
        mailOptions.from,
        mailOptions.to,
        mailOptions.subject,
        emailTemplate,
        `Reviewer ${reviewerId}`
      )
    );
  }
}

export async function sendReviewReminder() {
  try {
    const allEventIds = await AbstractReviewersService.getAllEventIds();
    for (const eventId of allEventIds) {
      const incompleteReviews =
        await AbstractReviewersService.getIncompleteReviews(eventId);

      // Use a Map to track the list of pending abstracts for each reviewer
      const reviewerPendingAbstracts = new Map<
        number,
        {
          reviewerEmail: string;
          abstracts: { abstractId: number; title: string }[];
        }
      >();

      for (const review of incompleteReviews) {
        const abstractTitle =
          await AbstractReviewersService.getAbstractTitleById(
            review.abstractId
          );
        const reviewerEmail =
          await AbstractReviewersService.getReviewerEmailById(
            review.reviewerId
          );

        // Call the helper function to add the reviewer's pending abstract
        addPendingAbstractToReviewer(
          reviewerPendingAbstracts,
          review.reviewerId,
          reviewerEmail,
          review.abstractId,
          abstractTitle
        );
      }

      // Now loop over the reviewers and send reminder emails
      for (const [reviewerId, reviewerInfo] of reviewerPendingAbstracts) {
        // Call sendReminderEmail here for each reviewer
        const eventTopic = await AbstractReviewersService.getEventTopicById(
          eventId
        );
        await sendReminderEmail(
          reviewerInfo.reviewerEmail,
          eventTopic,
          reviewerInfo.abstracts,
          eventId,
          reviewerId
        );
      }
    }
  } catch (error) {
    console.error("Error sending review reminders:", error);
  }
}
