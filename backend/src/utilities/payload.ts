import * as config from "../utilities/config";
import { FolderFileAttributes } from "../services/eventFiles";
import * as AbstractReviewerService from "../services/eventAbstractReviews/abstractReviewers";
import * as AbstractDecidersService from "../services/eventAbstractReviews/abstractDeciders";
import { EmailDeliveryLogInput } from "../services/eventAbstractReviews/interfaces";
import { AbstractReviewConfigs, AbstractSubmitters, AbstractTopics, Abstracts, AbstractReviewers, AbstractReviewDeciders, AbstractReviews, AbstractReviewEmailTemplates, AbstractReviewFinalDecisions } from "../repo/eventAbstractReviews";
import { Event } from "../repo/event";
import { NewsInfo } from "../services/eventNews";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

export interface AlbumWithCoverPhotos {
  album_id: number;
  album_description: string;
  album_date: string;
  album_order: number;
  image_file_name?: string; // Optional because we will remove it later
  cover_image_url?: string; // This will be added
}

interface Album {
  album_id: number;
  album_description: string;
  album_date: string;
  album_order: number;
  "photos.image_file_name": string;
  album_name: string;
}

export interface AlbumPhoto {
  image_id: number;
  image_file_name?: string;
  image_url?: string;
}

export interface EnhancedFolderFileAttributes extends FolderFileAttributes {
  single_file_download_url: string;
  all_files_download_url?: string; // Optional since it's only on the first item
}

function flattenAlbums(albums: Album[]) {
  const flatAlbums: AlbumWithCoverPhotos[] = albums.map((album) => {
    return {
      album_id: album["album_id"],
      album_description: album["album_description"],
      album_date: album["album_date"],
      album_order: album["album_order"],
      image_file_name: album["photos.image_file_name"], // Disolving nested property
      album_name: album["album_name"],
    };
  });
  return flatAlbums;
}

function processAlbums(
  albums: AlbumWithCoverPhotos[],
  eventId: string
): AlbumWithCoverPhotos[] {
  const processedAlbums: AlbumWithCoverPhotos[] = albums.map((album) => {
    if (album.image_file_name) {
      album.cover_image_url = getImageUrl(
        eventId,
        album.album_id,
        album.image_file_name
      );
      delete album.image_file_name; // Remove the image_file_name key
    }
    return album;
  });
  return processedAlbums;
}

function processPhotos(
  photos: AlbumPhoto[],
  eventId: string,
  albumId: string
): AlbumPhoto[] {
  const processedPhotos: AlbumPhoto[] = photos.map((photo) => {
    if (photo.image_file_name) {
      photo.image_url = getImageUrl(
        eventId,
        parseInt(albumId, 10),
        photo.image_file_name
      );
      delete photo.image_file_name; // Remove the image_file_name key
    }
    return photo;
  });
  return processedPhotos;
}

function getImageUrl(
  eventId: string,
  albumId: number,
  imageFileName: string
): string {
  const baseURL: string = config.APP_URL + "/api/gallery";
  let imageURL = `${baseURL}/cover/${eventId.toString()}/${albumId.toString()}/${encodeURIComponent(
    imageFileName
  )}`;
  return imageURL;
}

dayjs.extend(utc);
dayjs.extend(timezone);

function formatDate(date: any): string {
  const newDate = dayjs(date).tz("Asia/Hong_Kong").format("YYYY-MM-DD");

  return newDate;
}

function formatDateV2(date: Date): string {
  // Formatting options to display date and time
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Singapore",
  };

  // Format date using toLocaleString to apply timezone
  const formattedString = date.toLocaleString("en-US", options);
  const [datePart, timePart] = formattedString.split(", ");

  // Converting date format from MM/DD/YYYY to YYYY-MM-DD
  const [month, day, year] = datePart.split("/");
  const formattedDatePart = `${year}-${month}-${day}`;

  return `${formattedDatePart} ${timePart}`; // Returns 'YYYY-MM-DD HH:MM'
}

function updateKey(data: any[], prefix: string): NewsInfo[] {
  return data.map((item) => {
    const newItem: any = {};
    Object.keys(item).forEach((key) => {
      // Check if the key starts with the prefix
      if (key.startsWith(prefix)) {
        // Remove the prefix and use the rest of the key
        const newKey = key.replace(prefix + ".", "");
        newItem[newKey] = item[key];
      } else {
        // Copy the key as is if it does not start with the prefix
        newItem[key] = item[key];
      }
    });
    return newItem;
  });
}

function enhanceFileObjects(
  files: FolderFileAttributes[],
  eventId: string,
  folderId: string
): EnhancedFolderFileAttributes[] {
  return files.map((file, index) => {
    // Construct the single file download URL
    const single_file_download_url = `${config.APP_URL}/api/files/${eventId}/download/${file.s3_file_name}`; // TODO update domain for deployment

    // Modify each object to include the single file download URL
    const enhancedFile: EnhancedFolderFileAttributes = {
      ...file,
      single_file_download_url,
      all_files_download_url: undefined, // Initialize as undefined
    };
    // Add the all files download URL only to the first object
    if (index === 0) {
      const all_files_download_url = `${config.APP_URL}/api/files/download/zip/${folderId}`; // TODO: Update domain for deployment
      enhancedFile.all_files_download_url = all_files_download_url;
    }

    return enhancedFile;
  });
}

interface AbstractReviewingLandingPageOutput {
  label: string;
  count: number;
  link: string;
}

/**
 * The helper functions below are for
 * Abstract Management System
 */

/**
 * Part I: For Revieweras
 */

function compileAbstractLandingPageOutput(
  eventId: string,
  availableAbstractCount: number,
  abstractUnderReviewCount: number,
  reviewedAbstractCount: number
): AbstractReviewingLandingPageOutput[] {
  return [
    {
      label: "Abstract\nPool",
      count: availableAbstractCount,
      link: `/reviewer-panel/${eventId}/available-abstracts`,
    },
    {
      label: "Abstracts\nPending Review",
      count: abstractUnderReviewCount,
      link: `/reviewer-panel/${eventId}/abstracts-under-review`,
    },
    {
      label: "Abstract Review\nDraft / Submission",
      count: reviewedAbstractCount,
      link: `/reviewer-panel/${eventId}/reviewed-abstracts`,
    },
  ];
}

async function getAbstractReviewerCounts(
  eventId: string,
  reviewerId: number,
  topicId: number
) {
  const availableAbstracts =
    await AbstractReviewerService.getAvailableAbstractsDetails(
      eventId,
      reviewerId,
      topicId
    );
  const pickedAbstracts = await AbstractReviewerService.getPickedAbstracts(
    reviewerId,
    eventId
  );
  const reviewedAbstracts = await AbstractReviewerService.getReviewedAbstracts(
    reviewerId,
    eventId
  );

  return {
    availableAbstractCount: availableAbstracts.abstractCollection.length,
    pickedAbstractCount: pickedAbstracts.abstractCollection.length,
    reviewedAbstractCount: reviewedAbstracts.abstractCollection.length,
  };
}

// Define a type for the input abstract reviews
interface AbstractReviewInput {
  eventId: string;
  reviewerId: number;
  abstractId: number;
}

// Define a type for the output with required fields added
interface AbstractReviewEnhanced extends AbstractReviewInput {
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function areAbstractReviewsDuplicated(
  abstractReviews: AbstractReviewInput[]
): Promise<boolean> {
  const checks = abstractReviews.map(async (abstractReview) => {
    const count =
      await AbstractReviewerService.checkAbstractReviewsDuplicatesForBulkSelect(
        abstractReview
      );
    return count === 0 ? false : true;
  });

  const results = await Promise.all(checks);
  const flag = results.filter((isDuplicated) => isDuplicated).length > 0;
  return flag;
}

export function abstractReviewsDataMarkedWithTimeStamp(
  abstractReviews: AbstractReviewInput[]
): AbstractReviewEnhanced[] {
  return abstractReviews.map((review) => ({
    ...review,
    createdBy: "system", // Default user or system account
    updatedBy: "system", // Default user or system account
    createdAt: new Date(), // Set current date as creation date
    updatedAt: new Date(), // Set current date as update date
  }));
}

function extractAbstractIds(data: AbstractReviewInput[]): number[] {
  return data.map((item) => item.abstractId);
}

export function createAbstractReviewInput(
  abstractId: string,
  eventId: string,
  reviewerId: string,
  comments: string,
  grades: string,
  isSubmission: boolean
): any {
  let inputData: any = {
    abstractId: parseInt(abstractId, 10),
    eventId: eventId,
    reviewerId: parseInt(reviewerId, 10),
    comments: comments,
    grades: grades,
    isSubmission,
  };

  return inputData;
}

export function getMailOptions(
  recipients: string[],
  content: string,
  subject: string
): any {
  return {
    from: config.SMTP_FROM_OVERRIDE,
    to: recipients,
    subject: subject,
    html: content,
  };
}

export function generateEmailDeliveryLogData(
  eventId: string,
  abstractId: number,
  emailFrom: string,
  emailTo: string[],
  subject: string,
  content: string,
  createdBy: string
): any {
  return {
    eventId: eventId,
    abstractId: abstractId,
    emailFrom: emailFrom,
    emailTo: emailTo.join(", "),
    subject: subject,
    content: content,
    createdBy: createdBy,
    updatedBy: createdBy,
  };
}

export function generateEmailDeliveryLogDataNew(
  eventId: string,
  abstractId: number,
  emailFrom: string,
  emailTo: string[],
  subject: string,
  content: string,
  createdBy: string,
  templateId: number,
  bcc: string[]
): any {
  return {
    eventId: eventId,
    abstractId: abstractId,
    emailFrom: emailFrom,
    emailTo: emailTo.join(", "),
    subject: subject,
    content: content,
    createdBy: createdBy,
    updatedBy: createdBy,
    templateId: templateId,
    bcc: bcc,
  };
}

export function getAbstractFileUrl(
  eventId: string,
  abstractId: number
): string {
  return `${config.APP_URL}/api/abstracts/reviewers/abstract-streaming/${eventId}/${abstractId}`;
}

export function getDeciderAbstractFileUrl(
  eventId: string,
  abstractId: number
): string {
  return `${config.APP_URL}/api/abstracts/deciders/abstract-streaming/${eventId}/${abstractId}`;
}

/**
 * Part II: For Deciders
 */

export function calculateTextRating(ratings: string[]): string {
  const uniqueRatings = new Set(ratings);

  // Construct a key for switch case selection based on the contents of the unique ratings set
  const key = Array.from(uniqueRatings).sort().join("-");

  switch (key) {
    case "accepted":
      return "accepted";
    case "rejected":
      return "rejected";
    case "conditional":
    case "accepted-conditional":
    case "rejected-conditional":
    case "accepted-rejected":
    case "accepted-rejected-conditional":
      return "conditional";
    default:
      return "conditional"; // Default case to handle unexpected combinations
  }
}

export function calculateScoringRating(ratings: number[]): number {
  const total = ratings.reduce((sum, rating) => sum + rating, 0);
  return ratings.length ? parseFloat((total / ratings.length).toFixed(2)) : 0;
}

export function extractTextGradesFromReviewers(abstractReviews: any) {
  return abstractReviews.map((review: any) => review.grades);
}

export function extractScoreGradesFromReviewers(abstractReviews: any) {
  return abstractReviews.map((review: any) => parseInt(review.grades, 10));
}

enum RatingType {
  Single,
  MultipleText,
  MultipleScore,
  Undefined,
}

function determineRatingType(
  isSingleReviewerRequired: boolean,
  isGradedByScoring: boolean
): RatingType {
  if (isSingleReviewerRequired) return RatingType.Single;
  if (!isSingleReviewerRequired && !isGradedByScoring)
    return RatingType.MultipleText;
  if (!isSingleReviewerRequired && isGradedByScoring)
    return RatingType.MultipleScore;
  return RatingType.Undefined;
}

export function getOverallRating(
  isSingleReviewerRequired: boolean,
  isGradedByScoring: boolean,
  abstractReviews: any[]
): string | number {
  let ratingType = determineRatingType(
    isSingleReviewerRequired,
    isGradedByScoring
  );

  switch (ratingType) {
    case RatingType.Single:
      return abstractReviews[0].grades;
    case RatingType.MultipleText:
      return calculateTextRating(
        extractTextGradesFromReviewers(abstractReviews)
      );
    case RatingType.MultipleScore:
      return calculateScoringRating(
        extractScoreGradesFromReviewers(abstractReviews)
      );
    default:
      console.log("Some issues on getting Rating Type");
      return "n/a"; // Optionally handle this case as an error or log it
  }
}

export async function processAbstractForFinalDecision(
  abstract: any,
  eventId: string,
  isSingleReviewerRequired: boolean,
  isGradedByScoring: boolean,
  scenario: string
): Promise<any> {
  const overallRating = getOverallRating(
    isSingleReviewerRequired,
    isGradedByScoring,
    abstract.AbstractReviews
  );
  const finalDecision = await getFinalDecision(scenario, eventId, abstract);

  return formatAbstractDetailsForFinalDecision(
    abstract,
    overallRating,
    finalDecision,
    eventId
  );
}

async function getFinalDecision(
  scenario: string,
  eventId: string,
  abstract: any
) {
  if (scenario === "pending")
    return (
      (await AbstractDecidersService.getAbstractReviewFinalDecisionsByIds(
        eventId,
        abstract.id
      )) || {}
    );

  if (scenario === "submitted")
    return (
      (await AbstractDecidersService.getSubmittedAbstractReviewFinalDecisionsByIds(
        eventId,
        abstract.id
      )) || {}
    );
}

export function formatAbstractDetailsForFinalDecision(
  abstract: any,
  overallRating: any,
  finalDecision: any,
  eventId: string
): any {
  return {
    id: abstract.id,
    title: abstract.title,
    description: abstract.description,
    presentationMode: abstract.dataValues.presentationMode ?? "",
    topic: abstract.AbstractTopic?.topic,
    fileUrl: getDeciderAbstractFileUrl(eventId, abstract.id),
    submitterName: `${abstract.AbstractSubmitter?.title} ${abstract.AbstractSubmitter?.firstName} ${abstract.AbstractSubmitter?.lastName}`,
    submitterInstitution: abstract.AbstractSubmitter?.institution,
    submitterPosition: abstract.AbstractSubmitter?.position,
    submitterEmail: abstract.AbstractSubmitter?.email,
    assessment: abstract.AbstractReviews.map((review: any) => ({
      reviewer: `${review.AbstractReviewer.title} ${review.AbstractReviewer.firstName} ${review.AbstractReviewer.lastName}`,
      reviewerPosition: review.AbstractReviewer.position,
      reviewerInstitution: review.AbstractReviewer.institution,
      reviewerEmail: review.AbstractReviewer.email,
      comment: review.comments,
      rating: review.grades,
    })),
    overallRating: overallRating,
    finalComments:
      finalDecision && finalDecision.comments ? finalDecision.comments : "n/a",
    finalGrades:
      finalDecision && finalDecision.grades ? finalDecision.grades : "n/a",
    finalDecisionCreatedAt:
      finalDecision && finalDecision.createdAt
        ? formatDateV2(finalDecision.createdAt)
        : null,
    finalDecisionUpdatedAt:
      finalDecision && finalDecision.updatedAt
        ? formatDateV2(finalDecision.updatedAt)
        : null,
    // Conditionally add `isDraft` and `isUnderDiscussionWithSubmitter` only if they exist in finalDecision
    ...(finalDecision && typeof finalDecision.isDraft !== "undefined"
      ? { isDraft: finalDecision.isDraft }
      : {}),
    ...(finalDecision &&
      typeof finalDecision.isUnderDiscussionWithSubmitter !== "undefined"
      ? {
        isUnderDiscussionWithSubmitter:
          finalDecision.isUnderDiscussionWithSubmitter,
      }
      : {}),
    suggestedPresentationMode:
      finalDecision && finalDecision.suggestedPresentationMode
        ? finalDecision.suggestedPresentationMode
        : "n/a",
    isUnderDiscussionWithSubmitter: finalDecision && finalDecision.isUnderDiscussionWithSubmitter ? finalDecision.isUnderDiscussionWithSubmitter : false,
    customQuestion0: abstract.dataValues.customQuestion0 ?? "",
    customQuestion1: abstract.dataValues.customQuestion1 ?? "",
    customQuestion2: abstract.dataValues.customQuestion2 ?? "",
    customQuestion3: abstract.dataValues.customQuestion3 ?? "",
    customQuestion4: abstract.dataValues.customQuestion4 ?? "",
    customQuestion5: abstract.dataValues.customQuestion5 ?? "",
    customQuestion6: abstract.dataValues.customQuestion6 ?? "",
    customQuestion7: abstract.dataValues.customQuestion7 ?? "",
    customQuestion8: abstract.dataValues.customQuestion8 ?? "",
    customQuestion9: abstract.dataValues.customQuestion9 ?? "",
  };
}

export function compileAbstractDeciderLandingPageOutput(
  eventId: string,
  masterlistAbstractCount: number,
  abstractUnderFinalReviewCount: number,
  finalizedAbstractCount: number
): any[] {
  return [
    {
      label: "Abstract Reviews\nMasterlist",
      count: masterlistAbstractCount,
      link: `/decider-panel/${eventId}/abstracts-masterlist`,
    },
    {
      label: "Abstracts\nUnder Finalization",
      count: abstractUnderFinalReviewCount,
      link: `/decider-panel/${eventId}/abstracts-under-final-review`,
    },
    {
      label: "Abstracts\nFinalized",
      count: finalizedAbstractCount,
      link: `/decider-panel/${eventId}/finalized-abstracts`,
    },
  ];
}

export async function getAbstractDeciderCounts(
  eventId: string,
  isSingleReviewerRequired: boolean,
  isGradedByScoring: boolean
) {
  const masterlistAbstracts =
    await AbstractDecidersService.getAbstractsWithReviewResults(
      eventId,
      isSingleReviewerRequired,
      isGradedByScoring
    );
  const abstractsUnderFinalReview =
    await AbstractDecidersService.getPendingAbstractFinalDecisions(
      eventId,
      isSingleReviewerRequired,
      isGradedByScoring
    );
  const abstractsFinalized =
    await AbstractDecidersService.getSubmittedAbstractFinalDecisions(
      eventId,
      isSingleReviewerRequired,
      isGradedByScoring
    );

  return {
    mnasterlistAbstractCount: masterlistAbstracts.abstracts.length,
    abstractsUnderFinalReviewCount: abstractsUnderFinalReview.abstracts.length,
    finalizedAbstractCount: abstractsFinalized.abstracts.length,
  };
}

export function wrapUpAssessmentRecordSubmission(
  assessmentSubmission: any,
  eventId: string,
  abstractId: number,
  reviewerId: number
) {
  assessmentSubmission["reviewerId"] = reviewerId;
  assessmentSubmission["eventId"] = eventId;
  assessmentSubmission["abstractId"] = abstractId;
  return assessmentSubmission;
}

export function generateReviewerReminderEmailContent(
  eventTopic: string,
  abstracts: { abstractId: number; title: string }[]
): string {
  // Start the email content
  let emailContent = `
    Dear Reviewer,<br/><br/>
    This is a reminder to complete your review for the following abstracts under the event "<strong>${eventTopic}</strong>":<br/><br/>
    <ul>
  `;

  // Loop through the abstracts and append each abstract to the list
  abstracts.forEach((abstract) => {
    emailContent += `<li><strong>${abstract.title}</strong> (ID: ${abstract.abstractId})</li>`;
  });

  // Close the unordered list and finish the email content
  emailContent += `
    </ul>
    <br/>
    Please ensure that you provide your comments and grades at your earliest convenience.<br/><br/>
    Thank you.<br/><br/>
    <em>(This is a system-generated email. No replies.)</em><br/><br/>
  `;

  return emailContent;
}

export async function generateReviewerReviewEndContent(content: string, recipentEmail: string, eventId: string): Promise<string> {
  let decider = await AbstractReviewDeciders.findOne({
    where: {
      email: recipentEmail,
      eventId: eventId
    }
  });

  let event = await Event.findOne({
    where: {
      id: eventId,
    }
  });

  let emailContent = '<p>' + content
    .replace(/<p><br><\/p>/g, '<br>')
    .replace(/<\/p>/g, '<br>')
    .replace(/<p>/g, '')
    ?.replaceAll('[%chairmanTitle%]', decider?.title)
    ?.replaceAll('[%chairmanFirstname%]', decider?.firstName)
    ?.replaceAll('[%chairmanLastname%]', decider?.lastName)
    ?.replaceAll('[%chairmanPosition%]', decider?.position)
    ?.replaceAll('[%chairmanOrganization%]', decider?.institution)
    ?.replaceAll('[%chairmanDept%]', decider?.department)
    ?.replaceAll('[%chairmanUrl%]', `<a href="${config.APP_AMS_DECIDER_URL}/decider-panel/${eventId}/abstracts-masterlist" alt="Review Coordinator Link">Review Coordinator View Url</a>`)
    ?.replaceAll('[%event%]', event.topic)
    + '</p>';

  return emailContent;
}

export async function generateUnderDiscussionContent(content: string, recipentEmail: string, eventId: string, abstractId: string): Promise<string> {
  let submitter = await AbstractSubmitters.findOne({
    where: {
      email: recipentEmail,
      eventId: eventId
    }
  });

  let event = await Event.findOne({
    where: {
      id: eventId,
    }
  });

  let abstractFinalDecision = await AbstractReviewFinalDecisions.findOne({
    where: {
      abstractId: abstractId,
    }
  });
  let abstract = await Abstracts.findOne({ where: { id: abstractId } });

  let emailContent = '<p>' + content
    .replace(/<p><br><\/p>/g, '<br>')
    .replace(/<\/p>/g, '<br>')
    .replace(/<p>/g, '')
    ?.replaceAll('[%title%]', submitter?.title)
    ?.replaceAll('[%firstname%]', submitter?.firstName)
    ?.replaceAll('[%lastname%]', submitter?.lastName)
    ?.replaceAll('[%position%]', submitter?.position)
    ?.replaceAll('[%organization%]', submitter?.institution)
    ?.replaceAll('[%dept%]', submitter?.department)
    ?.replaceAll('[%event%]', event.topic)
    ?.replaceAll('[%result%]', abstractFinalDecision?.grades)
    ?.replaceAll('[%comment%]', abstractFinalDecision?.comments)
    ?.replaceAll('[%discussionUrl%]', `<a href="${config.APP_USER_URL}/under-discussion/${eventId}/${abstractId}?id=1" alt="Under Discussion Link">Under Discussion Url</a>`)
    ?.replaceAll('[%endorseUrl%]', `<a href="${config.APP_USER_URL}/endorse-comment/${eventId}/${abstractId}?id=1" alt="Endorse Comment Link">Endorse Comment Url</a>`)
    //replace with abstract placeholder
    ?.replaceAll('[%abstractId%]', abstract?.id?.toString())
    ?.replaceAll('[%abstractTitle%]', abstract?.title)
    + '</p>';

  return emailContent;
}

export {
  flattenAlbums,
  processAlbums,
  processPhotos,
  formatDate,
  formatDateV2,
  enhanceFileObjects,
  compileAbstractLandingPageOutput,
  getAbstractReviewerCounts,
  extractAbstractIds,
  updateKey
};
