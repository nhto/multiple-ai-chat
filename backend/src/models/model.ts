import { EventRegistration } from "../repo/eventRegistration";
import { EventRegistrationFormSession } from "../repo/eventRegistrationFormSession";
import { EventSession } from "../repo/eventSession";
import { RoleUser } from "../repo/roleUser";
import { Event } from "../repo/event";
import { CustomPaymentItem } from "../repo/customPaymentItem";
import { ParticipantSession } from "../repo/participantSession";
import { EventPhotos } from "../repo/eventPhotos";


enum RoleLabel {
  // Automatically created for all logged in users
  User = "User",
  // Common Event Management Platform specifics
  SystemAdmin = "System Admin",
  EventAdmin = "Event Admin",
  Admin = "Admin",
  EventOrganizer = "Event Organizer",
  EventSupporter = "Event Supporter",
  EventHelper = "Event Helper",
  // Session Role
  Alumni = "Alumni",
  Staff = "Staff",
  Student = "Student",
  Guests = "Guests",
}

enum KeycloakLoginType {
  alumni = "alumni",
  public = "public"
}

enum AppConfigLabel {
  PublicWebUrlFull = "public.web.url.full",
  PublicWebUrlPreview = "public.web.url.preview",
  UserWebUrlFileSubmission = "user.web.url.filesubmission",
  UserFileSubmissionUpdateLimit = "user.filesubmission.update.limit",
}

enum FileSubmissionAcceptedExt {
  pdf = ".pdf",
  doc = ".doc",
  docx = ".docx",
  txt = ".txt",
  jpg = ".jpg",
  jpeg = ".jpeg",
  png = ".png",
}

const FileSubmissionCharLimit = 10000000;

enum FileSubmissionType {
  abstract = "abstract",
  paper = "paper"
}

enum FileSubmissionUrl {
  abstract = "init",
  paper = "sup"
}

enum FileSubmissionApprovalStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
}

enum RegistrationStatusLabel {
  Registered = "Registered",
  InWaitList = "In Wait List",
  EasyWalkinCard = "Easy Walk-in(Card)",
}

enum MessagePlaceholderLabel {
  title = "[%title%]",
  firstname = "[%firstname%]",
  lastname = "[%lastname%]",
  position = "[%position%]",
  institution = "[%organization%]",
  dept = "[%dept%]",
  paymentLink = "[%paymentLink%]",
  session = "[%session%]",
  qrCode = "[%qrCode%]",
}

enum PaymentStatusLabel {
  WaitingForPayment = "Waiting for Payment",
  // InWaitList = "In Wait List",
  OlppInProgress = "OLPP In Progress",
  Paid = "Paid",
  Waived = "Waived"
}

enum OlppRequestType {
  FullPayment = '0',
  ItemsPayment = '1'
}

enum OlppPaymentMessage {
  Succeed = "paymentsucceed",
  Failed = "paymentfailed",
  Paid = "paid",
  NoPayment = "nopayment",
  Expired = "expired",
  NotRegistered = "notregistered",
  Proceed = "proceed"
}

enum AttendanceStatusLabel {
  NotAttended = "Not Attended",
  Attended = "Attended",
}

enum PublicWebManagementTypeLabel {
  Preview = "preview",
  Public = "public",
}

enum PublicWebPageTabDisplayLabel {
  Header,
  Footer,
  Hidden
}

interface MeSummary {
  netId: string,
  userType: string,
  userId: string,
  deptAbbr?: string,
  name: {
    surname: string,
    givenName: string,
  },
  email: string,
  roles: {
    roleLabel: string, // TODO: Rename to roleLabel
    eventId: string
  }[],
};

interface User {
  netId: string,
  userType: string,
  userId: string,
  fullName: string,
  displayName: string,
  surname: string,
  givenName: string,
  deptAbbr: string,
  postTitle?: string,
  email: string,
}

interface RoleUserSummary {
  id: number;
  roleLabel: string;
  roleEventId: string;
  netId: string,
  userType: string,
  userId: string,
  fullName: string,
  displayName: string,
  deptAbbr: string,
  email: string,
  createdAt?: Date,
  updatedAt?: Date,
};

interface EmailTemplateSummary {
  id: string,
  eventId: string,
  name: string,
  from: string,
  bcc: string,
  subject: string,
  details: string,
  updatedBy: string,
  createdAt?: Date,
  updatedAt?: Date,
};

interface CustomPaymentEventSummary {
  eventId: string,
  eventTitle: string,
  eventCode: string,
  deptAbbr: string,
  department: string,
  contactPerson: string,
  contactEmail: string,
  contactTelephone: string,
  duplicatePaymentAllowed: boolean,
  eventStartDate: Date,
  eventEndDate: Date,
  activeEventStatus: boolean,
  payerNameRequired: boolean,
  payerEmailRequired: boolean,
  items?: CustomPaymentItem[],
  createdAt?: Date,
  updatedAt?: Date,
};

interface CustomPaymentItemSummary {
  itemId: string,
  eventId: string,
  itemCode: string,
  itemName: string,
  multiSelect: boolean,
  itemNature: string,
  enableRemark: boolean,
  defaultAmount: number,
  defaultQuantity: number,
  editAmountEnabled: boolean,
  paymentItemStartDate: Date,
  paymentItemEndDate: Date,
  createdAt?: Date,
  updatedAt?: Date,
};

interface EventSummary {
  id: string,
  topic: string,
  subtopic: string,
  start: Date,
  end: Date,
  remark: string,
  eventMode: string,
  quota: number,
  waitingListQuota: number,
  used: number,
  contactName: string,
  contactEmail: string,
  contactPhoneNumber: string,
  contactDept: string,
  banner: string,
  createdAt?: Date,
  updatedAt?: Date,
  roles?: RoleUser[],
};

interface UserTypesSummary {
  acceptAnyone: boolean,
  acceptAlumni: boolean,
  acceptStudent: boolean,
  acceptStaff: boolean,
  acceptGuest: boolean,
};

interface EventRegistrationSummary {
  id: string,
  eventId: string,
  disabled: boolean,
  topic: string,
  subtopic: string,
  start: Date,
  earlyBirdEnd: Date,
  end: Date,
  description: string,
  acceptAnyone: boolean,
  acceptAlumni: boolean,
  acceptStudent: boolean,
  acceptStaff: boolean,
  acceptGuest: boolean,
  banner: string,
  bannerAltText: string,
  bannerHyperlink: string,
  pics: string,
  picsAcceptBox: boolean,
  picsAcceptBoxMsg: string,
  marketingAcceptBox: boolean,
  marketingAcceptBoxMsg: string,
  containPosition: string,
  containInstitution: string,
  containDept: string,
  containAddress: string,
  containCountry: string,
  containOfficePhoneNumber: string,
  containMobilePhoneNumber: string,
  containPayment: boolean,
  // eventSessions?: EventSession[],
  paymentCode: string,
  containPaymentTitle1: boolean,
  paymentTitle1: string,
  paymentTitle1Obj?: CustomPaymentItem,
  paymentTitle1Price: number,
  paymentTitle1Price_EB: number,
  containPaymentTitle2: boolean,
  paymentTitle2: string,
  paymentTitle2Obj?: CustomPaymentItem,
  paymentTitle2Price: number,
  paymentTitle2Price_EB: number,
  containPaymentTitle3: boolean,
  paymentTitle3: string,
  paymentTitle3Obj?: CustomPaymentItem,
  paymentTitle3Price: number,
  paymentTitle3Price_EB: number,
  containPaymentTitle4: boolean,
  paymentTitle4: string,
  paymentTitle4Obj?: CustomPaymentItem,
  paymentTitle4Price: number,
  paymentTitle4Price_EB: number,
  containPaymentTitle5: boolean,
  paymentTitle5: string,
  paymentTitle5Obj?: CustomPaymentItem,
  paymentTitle5Price: number,
  paymentTitle5Price_EB: number,
  containPaymentTitle6: boolean,
  paymentTitle6: string,
  paymentTitle6Obj?: CustomPaymentItem,
  paymentTitle6Price: number,
  paymentTitle6Price_EB: number,
  containPaymentTitle7: boolean,
  paymentTitle7: string,
  paymentTitle7Obj?: CustomPaymentItem,
  paymentTitle7Price: number,
  paymentTitle7Price_EB: number,
  containPaymentTitle8: boolean,
  paymentTitle8: string,
  paymentTitle8Obj?: CustomPaymentItem,
  paymentTitle8Price: number,
  paymentTitle8Price_EB: number,
  containPaymentTitle9: boolean,
  paymentTitle9: string,
  paymentTitle9Obj?: CustomPaymentItem,
  paymentTitle9Price: number,
  paymentTitle9Price_EB: number,
  containPaymentTitle10: boolean,
  paymentTitle10: string,
  paymentTitle10Obj?: CustomPaymentItem,
  paymentTitle10Price: number,
  paymentTitle10Price_EB: number,
  paymentTitle1Mandatory: boolean,
  paymentTitle2Mandatory: boolean,
  paymentTitle3Mandatory: boolean,
  paymentTitle4Mandatory: boolean,
  paymentTitle5Mandatory: boolean,
  paymentTitle6Mandatory: boolean,
  paymentTitle7Mandatory: boolean,
  paymentTitle8Mandatory: boolean,
  paymentTitle9Mandatory: boolean,
  paymentTitle10Mandatory: boolean,
  eventRegistrationFormSession?: EventRegistrationFormSession,
  customQuestions: string,
  successfulMsgtoReg: string,
  successfulMsgtoWaitingList: string,
  sendEmail: boolean,
  emailFrom: string,
  emailBcc: string,
  emailSubjectSuccessfulReg: string,
  emailDetailsSuccessfulReg: string,
  emailSubjectSuccessfulWaiting: string,
  emailDetailsSuccessfulWaiting: string,
  err_msg_userType: string,
  err_msg_quotaExceed: string,
  limitItemCount: boolean,
  minItemCount: number,
  maxItemCount: number,
  updatedBy: string,
  createdAt?: Date,
  updatedAt?: Date,
};

interface EventSessionSummary {
  id: string,
  eventId: string,
  venue: string,
  quota: number,
  used: number,
  details: string,
  // needPayment: boolean,
  // price: number,
  // price_eb: number,
  allowWalkIn: boolean,
  from: Date,
  to: Date,
  createdAt?: Date,
  updatedAt?: Date,
  disabled?: boolean,
  // inUseCount property is not part of the DB table structure for EventSession.
  // The value for inUseCount will be calculated dynamically in the backend.
  inUseCount?: number
};

interface RosterSummary {
  eventId: number;
  eventDateTime: Date;
  deptAbbr: string;
  staffQuota: number;
  studentQuota: number;
};

interface AttendanceSummary {
  id: string;
  eventId: string;
  sessionId: string;
  participantId: string;
  status: string;
  createdAt?: Date,
  updatedAt?: Date,
  updatedBy: string;
};

interface ParticipantSummary {
  id: string;
  eventId: string;
  formId: string;
  userType: string;
  userId: string;
  qrCode: string;
  disabled: boolean,

  registrationStatus: string,

  form?: EventRegistration,
  event?: Event,
  pSessions?: ParticipantSession[],
  formName?: string;

  firstname: string;
  lastname: string;
  email: string;

  picsAcceptBox: boolean,
  marketingAcceptBox: boolean,

  position: string;
  institution: string;
  dept: string;
  address: string;
  country: string;
  officePhoneNumber: string;
  mobilePhoneNumber: string;

  orderPaymentTitle1: boolean,
  paymentTitle1Obj?: CustomPaymentItem,
  paymentTitle1: string;
  paymentTitle1Price: number;
  orderPaymentTitle2: boolean,
  paymentTitle2Obj?: CustomPaymentItem,
  paymentTitle2: string;
  paymentTitle2Price: number;
  orderPaymentTitle3: boolean,
  paymentTitle3Obj?: CustomPaymentItem,
  paymentTitle3: string;
  paymentTitle3Price: number;
  orderPaymentTitle4: boolean,
  paymentTitle4Obj?: CustomPaymentItem,
  paymentTitle4: string;
  paymentTitle4Price: number;
  orderPaymentTitle5: boolean,
  paymentTitle5Obj?: CustomPaymentItem,
  paymentTitle5: string;
  paymentTitle5Price: number;
  orderPaymentTitle6: boolean,
  paymentTitle6Obj?: CustomPaymentItem,
  paymentTitle6: string;
  paymentTitle6Price: number;
  orderPaymentTitle7: boolean,
  paymentTitle7Obj?: CustomPaymentItem,
  paymentTitle7: string;
  paymentTitle7Price: number;
  orderPaymentTitle8: boolean,
  paymentTitle8Obj?: CustomPaymentItem,
  paymentTitle8: string;
  paymentTitle8Price: number;
  orderPaymentTitle9: boolean,
  paymentTitle9Obj?: CustomPaymentItem,
  paymentTitle9: string;
  paymentTitle9Price: number;
  orderPaymentTitle10: boolean,
  paymentTitle10Obj?: CustomPaymentItem,
  paymentTitle10: string;
  paymentTitle10Price: number;

  customAnswers: string;

  needPayment: boolean,
  totalPayment: number;
  paymentStatus: string;
  paidAt?: Date;
  paymentRefId: string;
  paymentRemark: string;

  createdAt?: Date,
  updatedAt?: Date,
  updatedBy: string;
};

interface EventRegistrationFormSessionSummary {
  id: string;
  eventId: string;
  formId: string;
  sessionId: string;

  createdAt?: Date,
  updatedAt?: Date,
};

interface ParticipantSessionSummary {
  id: string;
  eventId: string;
  sessionId: string;
  participantId: string;

  createdAt?: Date,
  updatedAt?: Date,
};

interface SessionSummary {
  id: string;
  expiryDateTime: Date;
  netId: string;
  meSummary: MeSummary;
};

interface WebSummary {
  id: string;
  eventId: number;
  content: string;
  imgs: string;
};

interface WebMenuSummary {
  secondLevel: any[];
  title: string;
  pageUrl: string;
  newTab: boolean;
};

interface ParticipantProfileSummary {
  title?: string;
  firstname?: string;
  lastname?: string;
  email: string;
  yearOfGraduation?: string;
  graduationProgram?: string;
  graduationDept?: string;
  position?: string;
  institution?: string;
  dept?: string;
  address?: string;
  country?: string;
  officePhoneNumber?: string;
  mobilePhoneNumber?: string;
}

interface FileSubmissionSummary {
  event: {
    title?: string;
    description?: string;
  }
  config: {
    description: string;
    visibleFields: string[];
    mandatoryFields: string[];
  },
  profile: {
    title?: string;
    firstname?: string;
    lastname?: string;
    email: string;
    yearOfGraduation?: string;
    graduationProgram?: string;
    graduationDept?: string;
    position?: string;
    institution?: string;
    dept?: string;
    address?: string;
    country?: string;
    officePhoneNumber?: string;
    mobilePhoneNumber?: string;
  },
  custom: {
    questions?: string;
    ans?: string;
  }
  abstract: {
    altTitle?: string;
    acceptedFileType?: string[];
    startDate?: Date;
    endDate?: Date;
    title?: string;
    description?: string;
    charLimit: number;
    names?: string[];
    urls?: string;
    remainingUpdateCount: number;
    approvalStatus: number;
  },
  paper: {
    altTitle?: string;
    acceptedFileType?: string[];
    startDate?: Date;
    endDate?: Date;
    title?: string;
    description?: string;
    charLimit: number;
    names?: string[];
    urls?: string;
    remainingUpdateCount: number;
    approvalStatus: number;
  },
}

interface FileCollectionSummary {
  id: string,
  submissionEnabled: boolean,
  acceptedUserType?: string[],
  description?: string,
  customQuestions?: any[],
  visibleFields?: string[],
  mandatoryFields?: string[],
  abstractAltTitle?: string,
  abstractFileType?: string[],
  abstractCharLimit?: number,
  abstractStartDate?: string,
  abstractEndDate?: string,
  paperAltTitle?: string,
  paperFileType?: string[],
  paperCharLimit?: number,
  paperStartDate?: string,
  paperEndDate?: string,
  bccAbstract: string,
  emailTemplateAbstract: string,
  bccPaper: string,
  emailTemplatePaper: string,
  apiURL?: string,

  // submissions?: FileSubmissionReviewSummary[],
}

interface FileSubmissionReviewSummary {
  id: string,
  profile: {
    netId?: string;
    userId?: string;
    fullname?: string;
    email: string;
    yearOfGraduation?: string;
    graduationProgram?: string;
    graduationDept?: string;
    position?: string;
    institution?: string;
    dept?: string;
    address?: string;
    country?: string;
    officePhoneNumber?: string;
    mobilePhoneNumber?: string;
  },
  customQuestionsAns?: any[],
  abstract: {
    title?: string;
    description?: string;
    files?: any[];
    urls?: string;
    approvalStatus: number;
    approvalUpdatedAt: Date;
    approvalUpdatedBy: string;
  },
  paper: {
    title?: string;
    description?: string;
    files?: any[];
    urls?: string;
    approvalStatus: number;
    approvalUpdatedAt: Date;
    approvalUpdatedBy: string;
  },
  createdAt: Date,
  updatedAt: Date,
}

interface EventAlbumsSummary {
  id: string,
  eventId: string;
  albumName: string;
  date: string;
  description: string;
  order: string;
  visibility: string;
  accessRight: string;
  createdBy: string;
  updatedBy: string;
  files?: EventPhotosSummary[];
  photos?: EventPhotos[];
}

interface EventPhotosSummary {
  name: string,
  order: string;
  isCoverPhoto: boolean;
}

interface EventFolderSummary {
  id: string | number,
  eventId: string;
  folderName: string;
  folderDescription: string;
  folderOrder: number;
  folderUrl: string;
  isFolderPublic: string;
  accessRight: string;
  createdBy: string;
  updatedBy: string;
  files?: EventFilesSummary[];
  photos?: EventPhotos[];
}

interface EventFilesSummary {
  fileDescription: string;
  newFileName: string;
  name: string,
  file_name: string,
  order: number;
  showFile?: boolean;
  isFileAccessible?: boolean;
  file_id?: number;
}

interface S3Data {
  [key: string]: any;
}

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
}

function createApiResponse<T>(message: string | null, data: T): ApiResponse<T> {
  return {
    success: true,
    message,
    data
  };
}

export {
  ApiResponse,
  createApiResponse,
  RoleLabel,
  KeycloakLoginType,
  AppConfigLabel,
  FileSubmissionAcceptedExt,
  FileSubmissionCharLimit,
  FileSubmissionType,
  FileSubmissionUrl,
  FileSubmissionApprovalStatus,
  RegistrationStatusLabel,
  MessagePlaceholderLabel,
  PaymentStatusLabel,
  OlppRequestType,
  OlppPaymentMessage,
  AttendanceStatusLabel,
  PublicWebManagementTypeLabel,
  PublicWebPageTabDisplayLabel,
  MeSummary,
  EmailTemplateSummary,
  CustomPaymentEventSummary,
  CustomPaymentItemSummary,
  EventSummary,
  UserTypesSummary,
  EventRegistrationSummary,
  EventSessionSummary,
  RosterSummary,
  AttendanceSummary,
  ParticipantSummary,
  EventRegistrationFormSessionSummary,
  ParticipantSessionSummary,
  ParticipantProfileSummary,
  FileSubmissionSummary,
  FileCollectionSummary,
  FileSubmissionReviewSummary,
  SessionSummary,
  User,
  RoleUserSummary,
  WebSummary,
  WebMenuSummary,
  EventAlbumsSummary,
  EventFolderSummary,
  EventFilesSummary,
  S3Data
}
