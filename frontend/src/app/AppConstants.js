export const PROFILE_TITLE = {
  IR: "Ir",
  IRPROF: "Ir Prof",
  IRDR: "Ir Dr",
  PROF: "Prof",
  DR: "Dr",
  MR: "Mr",
  MRS: "Mrs",
  MS: "Ms",
  MISS: "Miss",
}

export const FILE_SUBMISSION_PATHNAME = "file-submission";
export const FILE_SUBMISSION_SIZE_LIMIT = 20;
export const FILE_SUBMISSION_CHAR_LIMIT = 10000000;
export const ABSTRACT_SUBMISSION_TITLE = "Abstract Submission Profile";
export const ENDORSE_COMMENT_TITLE = "Notification";
export const UNDER_DISCUSSION_TITLE = "Under Discussion";
export const PAPER_SUBMISSION_TITLE = "Paper/Poster Submission";

export const FILE_COLLECTION_PROFILE_FIELD_LABEL = {
  profile_title: "Title",
  profile_firstname: "First Name",
  profile_lastname: "Last Name",
  profile_email: "Email",
  profile_yearOfGraduation: "Year Of Graduation",
  profile_graduationProgram: "Graduation Program",
  profile_graduationDept: "Graduation Department",
  profile_position: "Position",
  profile_institution: "Organization",
  profile_dept: "Department/Unit",
  profile_address: "Address",
  profile_country: "City/Country/Region",
  profile_officePhoneNumber: "Office Phone Number",
  profile_mobilePhoneNumber: "Contact Phone Number",
  abstract_title: "Abstract Title",
  abstract_description: "Abstract Description",
  abstract_urls: "Abstract File Link",
  abstract_files: "Abstract Files Upload",
  paper_title: "Paper Title",
  paper_description: "Paper Description",
  paper_urls: "Paper File Link",
  paper_files: "Paper Files Upload",
}

export const FILE_SUBMISSION_ACCEPTED_EXT = {
  PDF: { EXT: ".pdf", MIME: "application/pdf" },
  DOC: { EXT: ".doc", MIME: "application/msword" },
  DOCX: { EXT: ".docx", MIME: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
  TXT: { EXT: ".txt", MIME: "text/plain" },
  JPG: { EXT: ".jpg", MIME: "image/jpeg" },
  JPEG: { EXT: ".jpeg", MIME: "image/jpeg" },
  PNG: { EXT: ".png", MIME: "image/png" },
  XLS: { EXT: ".xls", MIME: "application/vnd.ms-excel" }, // Excel file format
  XLSX: { EXT: ".xlsx", MIME: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }, // Excel file format
  PPT: { EXT: ".ppt", MIME: "application/vnd.ms-powerpoint" }, // PowerPoint file format
  PPTX: { EXT: ".pptx", MIME: "application/vnd.openxmlformats-officedocument.presentationml.presentation" } // PowerPoint file format
}


export const FILE_SUBMISSION_TYPE = {
  ABSTRACT: { TYPE: "abstract", DEFAULT_TITLE: "Abstract", PATH: "init" },
  PAPER: { TYPE: "paper", DEFAULT_TITLE: "Paper", PATH: "sup" },
}

export const FILE_SUBMISSION_APPROVAL_STATUS = {
  PENDING: { ID: 0, NAME: "Pending" },
  APPROVED: { ID: 1, NAME: "Approved" },
  REJECTED: { ID: 2, NAME: "Rejected" },
}

export const KEYCLOAK_LOGIN_TYPE = {
  ALUMNI: "alumni",
  PUBLIC: "public",
}

export const PAYMENT_PATHNAME = "payment";

export const PAYMENT_STATUS_LABEL = {
  WAITING_FOR_PAYMENT: "Waiting for Payment",
  IN_WAITLIST: "In Wait List",
  OLPP_IN_PROGRESS: "OLPP In Progress",
  PAID: "Paid"
}

export const OLPP_PAYMENT_MESSAGE = {
  SUCCEED: "paymentsucceed",
  FAILED: "paymentfailed",
  PAID: "paid",
  NO_PAYMENT: "nopayment",
  EXPIRED: "expired",
  NOT_REGISTERED: "notregistered",
  PROCEED: "proceed"
}