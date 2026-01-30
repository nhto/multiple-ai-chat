export interface AvailableAbstractsDetails {
  id: number;
  title: string;
  description: string;
  eventId: string;
  submitterId: number;
  topicId: number;
  reviewerNumber: number;
  isReviewed: number;
  isReviewFinalized: number;
  isChairmanNotified: number;
  isReviewerNotified: number;
  isSubmitterNotified: number;
  createdAt: string;
  updatedAt: string;
  AbstractReviewConfig: {
    id: number;
    eventId: string;
    reviewerPerAbstract: number;
    gradingMethod: string;
    abstractSubmissionEndDate: Date;
    allowSameInstitution: number;
    createdAt: Date;
    updatedAt: Date;
  };
  AbstractSubmitter: {
    id: number;
    eventId: string;
    title?: string;
    firstName?: string;
    lastName?: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    institution: string;
  };
}

export interface PickedAbstractDetails {
  id: number;
  title: string;
  description: string;
  eventId: string;
  submitterId: number;
  topicId: number;
  reviewerNumber: number;
  isReviewed: number;
  isReviewFinalized: number;
  isChairmanNotified: number;
  isReviewerNotified: number;
  isSubmitterNotified: number;
  createdAt: Date;
  updatedAt: Date;
  fileUrl: string;
  AbstractReviews: {
    id: number;
    abstractId: number;
    reviewerId: number;
    comments: string | null;
    grades: string | null;
    createdAt: Date;
    updatedAt: Date;
    isDraft: number;
  }; // Ensuring this is a singular object
}

interface LandingPageBox {
  label: string;
  count: number;
  link: string;
}
export interface AbstractReviewerLandingPageData {
  landingPageBoxData: LandingPageBox[];
  topicId: string;
  reviewerId: string;
  topic: string;
  gradingMethod: string;
}

export interface AbstractReviewsAttributes {
  id: number;
  eventId: string;
  abstractId: number;
  reviewerId: number;
  comments?: string;
  grades?: string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

interface AbstractReviewDetails {
  id: number;
  eventId: string;
  abstractId: number;
  reviewerId: number;
  comments: string | null;
  grades: string | null;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface AbstractCounts {
  availableAbstractCount: number;
  pickedAbstractCount: number;
  reviewedAbstractCount: number;
  abstractReview: AbstractReviewDetails;
}

export interface BulkSelectedAbstractReviews {
  eventId: string;
  reviewerId: number;
  abstractId: number;
}

export interface AssessmentRecords {
  comments: string | null;
  grades: string | null;
}

export interface AbstractReviewInput {
  abstractId: number;
  eventId: string;
  reviewerId: number;
  comments: string | null;
  grades: string | null;
  isSubmission: boolean;
}

export interface UpdatedAbstractReview {
  id: number;
  abstractId: number;
  eventId: string;
  reviewerId: number;
  comments: string;
  grades: string;
  $action: "UPDATE";
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  isDraft: null | boolean; // Assuming isDraft can be either boolean or null
}

export interface ManageAbstractReview {
  updatedAbstractReview: UpdatedAbstractReview;
  counts: AbstractCounts;
}

export interface MasterListAbstract {
  id: number;
  title: string;
  description: string;
  topic: string;
  createdDate: string; // Using string to match the format provided, consider using Date type if actually using Date objects
  updatedDate: string; // Same as above
  submitterInstitution: string;
  submitterPosition: string;
  assessment: Review[];
  overallRating: number; // Assuming overallRating is a calculated field
}

interface Review {
  reviewer: string;
  reviewerPosition: string;
  reviewerInstitution: string;
  comment: string;
  rating: string; // Rating as string based on provided data, consider changing to number if applicable
}

export interface AbstractForDeciders {
  id: number;
  title: string;
  description: string;
  topic: string;
  submitterInstitution: string;
  submitterPosition: string;
  assessment: Assessment[];
  overallRating: string;
  finalComments: string;
  finalGrades: string;
  finalDecisionCreatedAt: string;
  finalDecisionUpdatedAt: string;
  isDraft?: boolean;
  isUnderDiscussionWithSubmitter?: boolean;
}

interface Assessment {
  reviewer: string;
  reviewerPosition: string;
  reviewerInstitution: string;
  comment: string;
  rating: string;
}

export interface AbstractDeciderLandingPageData {
  landingPageLoadingData: Array<{
    label: string;
    count: number;
    link: string;
  }>;
  gradingMethod: string;
  eventName: string;
  eventStartEndDates: {
    start: string;
    end: string;
  };
  deciderId: number;
}

export interface DeciderComment {
  abstractId: number;
  deciderId: number;
  eventId: string;
  comments: string;
}

export interface DeciderAssessment {
  comment: string;
  rating: string;
}

export interface DeciderRating {
  abstractId: number;
  eventId: string;
  rating: string;
  deciderId: number;
  suggestedPresentationMode: string;
}

export interface ReviewCheckResult {
  count: number;
  allNotDraft: boolean;
}

export interface EmailDeliveryLogInput {
  eventId: string;
  abstractId: number;
  emailFrom: string;
  emailTo: string;
  subject: string;
  content: string;
  createdBy: string;
  updatedBy: string;
  templateId: number;
  bcc: string[];
}

export interface EmailDeliveryLogInputNew {
  eventId: string;
  abstractId: number;
  emailFrom: string;
  emailTo: string;
  subject: string;
  content: string;
  createdBy: string;
  updatedBy: string;
  templateId: number;
}
