import { sequelize } from '../utilities/database';
import { DataTypes, Model, Optional } from 'sequelize';
import { EventRegistrationFormSession } from './eventRegistrationFormSession';
import { EventSession } from './eventSession';
import { Event } from './event';
import { CustomPaymentItem } from './customPaymentItem';

interface EventRegistrationAttributes {
  id: string;
  eventId: string;
  disabled: boolean;

  topic: string;
  subtopic: string;
  start: Date;
  earlyBirdEnd: Date;
  end: Date;
  description: string;
  acceptAnyone: boolean;
  acceptAlumni: boolean;
  acceptStudent: boolean;
  acceptStaff: boolean;
  acceptGuest: boolean;

  banner: Buffer;
  bannerAltText: string;
  bannerHyperlink: string;

  pics: string;
  picsAcceptBox: boolean;
  picsAcceptBoxMsg: string;
  marketingAcceptBox: boolean;
  marketingAcceptBoxMsg: string;

  containPosition: string;
  containInstitution: string;
  containDept: string;
  containAddress: string;
  containCountry: string;
  containOfficePhoneNumber: string;
  containMobilePhoneNumber: string;
  containAttachment: string;

  containPayment: boolean;
  paymentCode: string;
  containPaymentTitle1: boolean;
  paymentTitle1: string;
  paymentTitle1Price: number;
  paymentTitle1Price_EB: number;
  containPaymentTitle2: boolean;
  paymentTitle2: string;
  paymentTitle2Price: number;
  paymentTitle2Price_EB: number;
  containPaymentTitle3: boolean;
  paymentTitle3: string;
  paymentTitle3Price: number;
  paymentTitle3Price_EB: number;
  containPaymentTitle4: boolean;
  paymentTitle4: string;
  paymentTitle4Price: number;
  paymentTitle4Price_EB: number;
  containPaymentTitle5: boolean;
  paymentTitle5: string;
  paymentTitle5Price: number;
  paymentTitle5Price_EB: number;
  containPaymentTitle6: boolean;
  paymentTitle6: string;
  paymentTitle6Price: number;
  paymentTitle6Price_EB: number;
  containPaymentTitle7: boolean;
  paymentTitle7: string;
  paymentTitle7Price: number;
  paymentTitle7Price_EB: number;
  containPaymentTitle8: boolean;
  paymentTitle8: string;
  paymentTitle8Price: number;
  paymentTitle8Price_EB: number;
  containPaymentTitle9: boolean;
  paymentTitle9: string;
  paymentTitle9Price: number;
  paymentTitle9Price_EB: number;
  containPaymentTitle10: boolean;
  paymentTitle10: string;
  paymentTitle10Price: number;
  paymentTitle10Price_EB: number;
  paymentTitle1Mandatory: boolean;
  paymentTitle2Mandatory: boolean;
  paymentTitle3Mandatory: boolean;
  paymentTitle4Mandatory: boolean;
  paymentTitle5Mandatory: boolean;
  paymentTitle6Mandatory: boolean;
  paymentTitle7Mandatory: boolean;
  paymentTitle8Mandatory: boolean;
  paymentTitle9Mandatory: boolean;
  paymentTitle10Mandatory: boolean;

  customQuestions: string;

  successfulMsgtoReg: string;
  successfulMsgtoWaitingList: string;
  sendEmail: boolean;
  emailFrom: string;
  emailBcc: string;
  emailSubjectSuccessfulReg: string;
  emailDetailsSuccessfulReg: string;
  emailSubjectSuccessfulWaiting: string;
  emailDetailsSuccessfulWaiting: string;

  err_msg_userType: string;
  err_msg_quotaExceed: string;

  limitItemCount: boolean;
  minItemCount: number;
  maxItemCount: number;

  paymentTitleQuantityEnables: string;

  limitSession: boolean;
  minSession: number;
  maxSession: number;
  updatedBy: string;
};

interface EventRegistrationCreationAttributes extends Optional<EventRegistrationAttributes,
  "id" | "earlyBirdEnd" | "banner" | "bannerAltText" | "bannerHyperlink" |
  "pics" | "picsAcceptBoxMsg" | "marketingAcceptBoxMsg" | "paymentCode" |
  "paymentTitle1" | "paymentTitle1Price" | "paymentTitle1Price_EB" |
  "paymentTitle2" | "paymentTitle2Price" | "paymentTitle2Price_EB" |
  "paymentTitle3" | "paymentTitle3Price" | "paymentTitle3Price_EB" |
  "paymentTitle4" | "paymentTitle4Price" | "paymentTitle4Price_EB" |
  "paymentTitle5" | "paymentTitle5Price" | "paymentTitle5Price_EB" |
  "paymentTitle6" | "paymentTitle6Price" | "paymentTitle6Price_EB" |
  "paymentTitle7" | "paymentTitle7Price" | "paymentTitle7Price_EB" |
  "paymentTitle8" | "paymentTitle8Price" | "paymentTitle8Price_EB" |
  "paymentTitle9" | "paymentTitle9Price" | "paymentTitle9Price_EB" |
  "paymentTitle10" | "paymentTitle10Price" | "paymentTitle10Price_EB" |
  "successfulMsgtoReg" | "successfulMsgtoWaitingList" | "emailFrom" | "emailBcc" |
  "emailSubjectSuccessfulReg" | "emailDetailsSuccessfulReg" |
  "limitSession" | "minSession" | "maxSession" |
  "customQuestions" | "paymentTitleQuantityEnables" | "updatedBy"
> { }

class EventRegistration extends Model<EventRegistrationAttributes, EventRegistrationCreationAttributes> implements EventRegistrationAttributes {
  id: string;
  eventId: string;
  disabled: boolean;

  topic: string;
  subtopic: string;
  start: Date;
  earlyBirdEnd: Date;
  end: Date;
  description: string;
  acceptAnyone: boolean;
  acceptAlumni: boolean;
  acceptStudent: boolean;
  acceptStaff: boolean;
  acceptGuest: boolean;

  banner: Buffer;
  bannerAltText: string;
  bannerHyperlink: string;

  pics: string;
  picsAcceptBox: boolean;
  picsAcceptBoxMsg: string;
  marketingAcceptBox: boolean;
  marketingAcceptBoxMsg: string;

  containPosition: string;
  containInstitution: string;
  containDept: string;
  containAddress: string;
  containCountry: string;
  containOfficePhoneNumber: string;
  containMobilePhoneNumber: string;
  containAttachment: string;

  containPayment: boolean;
  paymentCode: string;
  containPaymentTitle1: boolean;
  paymentTitle1: string;
  paymentTitle1Price: number;
  paymentTitle1Price_EB: number;
  containPaymentTitle2: boolean;
  paymentTitle2: string;
  paymentTitle2Price: number;
  paymentTitle2Price_EB: number;
  containPaymentTitle3: boolean;
  paymentTitle3: string;
  paymentTitle3Price: number;
  paymentTitle3Price_EB: number;
  containPaymentTitle4: boolean;
  paymentTitle4: string;
  paymentTitle4Price: number;
  paymentTitle4Price_EB: number;
  containPaymentTitle5: boolean;
  paymentTitle5: string;
  paymentTitle5Price: number;
  paymentTitle5Price_EB: number;
  containPaymentTitle6: boolean;
  paymentTitle6: string;
  paymentTitle6Price: number;
  paymentTitle6Price_EB: number;
  containPaymentTitle7: boolean;
  paymentTitle7: string;
  paymentTitle7Price: number;
  paymentTitle7Price_EB: number;
  containPaymentTitle8: boolean;
  paymentTitle8: string;
  paymentTitle8Price: number;
  paymentTitle8Price_EB: number;
  containPaymentTitle9: boolean;
  paymentTitle9: string;
  paymentTitle9Price: number;
  paymentTitle9Price_EB: number;
  containPaymentTitle10: boolean;
  paymentTitle10: string;
  paymentTitle10Price: number;
  paymentTitle10Price_EB: number;
  paymentTitle1Mandatory: boolean;
  paymentTitle2Mandatory: boolean;
  paymentTitle3Mandatory: boolean;
  paymentTitle4Mandatory: boolean;
  paymentTitle5Mandatory: boolean;
  paymentTitle6Mandatory: boolean;
  paymentTitle7Mandatory: boolean;
  paymentTitle8Mandatory: boolean;
  paymentTitle9Mandatory: boolean;
  paymentTitle10Mandatory: boolean;

  customQuestions: string;

  successfulMsgtoReg: string;
  successfulMsgtoWaitingList: string;
  sendEmail: boolean;
  emailFrom: string;
  emailBcc: string;
  emailSubjectSuccessfulReg: string;
  emailDetailsSuccessfulReg: string;
  emailSubjectSuccessfulWaiting: string;
  emailDetailsSuccessfulWaiting: string;

  err_msg_userType: string;
  err_msg_quotaExceed: string;

  limitItemCount: boolean;
  minItemCount: number;
  maxItemCount: number;

  updatedBy: string;

  paymentTitleQuantityEnables: string;
  limitSession: boolean;
  minSession: number;
  maxSession: number;

  public readonly eventSessions?: EventSession[];
  public readonly eventRegistrationFormSession?: EventRegistrationFormSession;
  public readonly event?: Event;
  public readonly paymentTitle1Obj?: CustomPaymentItem;
  public readonly paymentTitle2Obj?: CustomPaymentItem;
  public readonly paymentTitle3Obj?: CustomPaymentItem;
  public readonly paymentTitle4Obj?: CustomPaymentItem;
  public readonly paymentTitle5Obj?: CustomPaymentItem;
  public readonly paymentTitle6Obj?: CustomPaymentItem;
  public readonly paymentTitle7Obj?: CustomPaymentItem;
  public readonly paymentTitle8Obj?: CustomPaymentItem;
  public readonly paymentTitle9Obj?: CustomPaymentItem;
  public readonly paymentTitle10Obj?: CustomPaymentItem;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

EventRegistration.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    eventId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    disabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },

    topic: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    subtopic: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    start: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    earlyBirdEnd: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    end: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    acceptAnyone: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    acceptAlumni: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    acceptStudent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    acceptStaff: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    acceptGuest: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },

    banner: {
      type: DataTypes.BLOB,
      allowNull: true,
    },
    bannerAltText: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    bannerHyperlink: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    pics: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    picsAcceptBox: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    picsAcceptBoxMsg: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    marketingAcceptBox: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    marketingAcceptBoxMsg: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    containPosition: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    containInstitution: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    containDept: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    containAddress: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    containCountry: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    containOfficePhoneNumber: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    containMobilePhoneNumber: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    containAttachment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    containPayment: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    paymentCode: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    containPaymentTitle1: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    paymentTitle1: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    paymentTitle1Price: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    paymentTitle1Price_EB: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    containPaymentTitle2: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    paymentTitle2: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    paymentTitle2Price: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    paymentTitle2Price_EB: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    containPaymentTitle3: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    paymentTitle3: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    paymentTitle3Price: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    paymentTitle3Price_EB: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    containPaymentTitle4: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    paymentTitle4: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    paymentTitle4Price: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    paymentTitle4Price_EB: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    containPaymentTitle5: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    paymentTitle5: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    paymentTitle5Price: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    paymentTitle5Price_EB: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    containPaymentTitle6: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    paymentTitle6: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    paymentTitle6Price: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    paymentTitle6Price_EB: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    containPaymentTitle7: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    paymentTitle7: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    paymentTitle7Price: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    paymentTitle7Price_EB: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    containPaymentTitle8: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    paymentTitle8: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    paymentTitle8Price: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    paymentTitle8Price_EB: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    containPaymentTitle9: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    paymentTitle9: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    paymentTitle9Price: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    paymentTitle9Price_EB: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    containPaymentTitle10: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    paymentTitle10: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    paymentTitle10Price: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    paymentTitle10Price_EB: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    paymentTitle1Mandatory: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    paymentTitle2Mandatory: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    paymentTitle3Mandatory: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    paymentTitle4Mandatory: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    paymentTitle5Mandatory: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    paymentTitle6Mandatory: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    paymentTitle7Mandatory: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    paymentTitle8Mandatory: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    paymentTitle9Mandatory: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    paymentTitle10Mandatory: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },

    customQuestions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    successfulMsgtoReg: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    successfulMsgtoWaitingList: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    sendEmail: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    emailFrom: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    emailBcc: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    emailSubjectSuccessfulReg: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    emailDetailsSuccessfulReg: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    emailSubjectSuccessfulWaiting: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    emailDetailsSuccessfulWaiting: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    err_msg_userType: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    err_msg_quotaExceed: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    limitItemCount: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    minItemCount: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    maxItemCount: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },

    paymentTitleQuantityEnables: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    limitSession: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    minSession: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    maxSession: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },

    updatedBy: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "EventRegistrationForm",
  }
);

export { EventRegistration, EventRegistrationAttributes };