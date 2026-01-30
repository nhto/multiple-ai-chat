import { sequelize } from '../utilities/database';
import { DataTypes, Model, Optional } from 'sequelize';
import { EventRegistration } from './eventRegistration';
import { Event } from './event';
import { MAX } from 'mssql';
import { CustomPaymentItem } from './customPaymentItem';
import { ParticipantSession } from './participantSession';

// TODO: status = "Not Attended", "Attended"
interface ParticipantAttributes {
  id: string;
  eventId: string;
  formId: string;
  userType: string;
  userId: string;
  sub: string;
  qrCode: string;
  disabled: boolean;

  registrationStatus: string;
  internalRemark: string;

  title: string;
  firstname: string;
  lastname: string;
  email: string;
  yearOfGraduation: string;
  graduationProgram: string;
  graduationDept: string;

  picsAcceptBox: boolean;
  marketingAcceptBox: boolean;

  position: string;
  institution: string;
  dept: string;
  address: string;
  country: string;
  officePhoneNumber: string;
  mobilePhoneNumber: string;

  orderPaymentTitle1: boolean;
  paymentTitle1: string;
  paymentTitle1Price: number;
  orderPaymentTitle2: boolean;
  paymentTitle2: string;
  paymentTitle2Price: number;
  orderPaymentTitle3: boolean;
  paymentTitle3: string;
  paymentTitle3Price: number;
  orderPaymentTitle4: boolean;
  paymentTitle4: string;
  paymentTitle4Price: number;
  orderPaymentTitle5: boolean;
  paymentTitle5: string;
  paymentTitle5Price: number;
  orderPaymentTitle6: boolean;
  paymentTitle6: string;
  paymentTitle6Price: number;
  orderPaymentTitle7: boolean;
  paymentTitle7: string;
  paymentTitle7Price: number;
  orderPaymentTitle8: boolean;
  paymentTitle8: string;
  paymentTitle8Price: number;
  orderPaymentTitle9: boolean;
  paymentTitle9: string;
  paymentTitle9Price: number;
  orderPaymentTitle10: boolean;
  paymentTitle10: string;
  paymentTitle10Price: number;

  customAnswers: string;

  needPayment: boolean;
  totalPayment: number;
  paymentStatus: string;
  paidAt: Date;
  paymentRefId: string;
  paymentRemark: string;

  updatedBy: string;

  orderPaymentQuantity1: number;
  orderPaymentQuantity2: number;
  orderPaymentQuantity3: number;
  orderPaymentQuantity4: number;
  orderPaymentQuantity5: number;
  orderPaymentQuantity6: number;
  orderPaymentQuantity7: number;
  orderPaymentQuantity8: number;
  orderPaymentQuantity9: number;
  orderPaymentQuantity10: number;
};

interface ParticipantCreationAttributes extends Optional<ParticipantAttributes,
  "id" | "userId" | "sub" | "qrCode" | "internalRemark" |
  "position" | "institution" | "dept" |
  "address" | "country" | "officePhoneNumber" |
  "mobilePhoneNumber" |
  "paymentTitle1" | "paymentTitle1Price" |
  "paymentTitle2" | "paymentTitle2Price" |
  "paymentTitle3" | "paymentTitle3Price" |
  "paymentTitle4" | "paymentTitle4Price" |
  "paymentTitle5" | "paymentTitle5Price" |
  "paymentTitle6" | "paymentTitle6Price" |
  "paymentTitle7" | "paymentTitle7Price" |
  "paymentTitle8" | "paymentTitle8Price" |
  "paymentTitle9" | "paymentTitle9Price" |
  "paymentTitle10" | "paymentTitle10Price" |
  "paymentStatus" | "paidAt" |
  "paymentRefId" | "paymentRemark" |
  "customAnswers"|
  "orderPaymentQuantity1" | "orderPaymentQuantity2" |
  "orderPaymentQuantity3" | "orderPaymentQuantity4" |
  "orderPaymentQuantity5" | "orderPaymentQuantity6" |
  "orderPaymentQuantity7" | "orderPaymentQuantity8" |
  "orderPaymentQuantity9" | "orderPaymentQuantity10" > { }

class Participant extends Model<ParticipantAttributes, ParticipantCreationAttributes> implements ParticipantAttributes {
  id: string;
  eventId: string;
  formId: string;
  userType: string;
  userId: string;
  sub: string;
  qrCode: string;
  disabled: boolean;

  registrationStatus: string;
  internalRemark: string;

  form: EventRegistration;
  event: Event;
  pSessions: ParticipantSession[];

  title: string;
  firstname: string;
  lastname: string;
  email: string;
  yearOfGraduation: string;
  graduationProgram: string;
  graduationDept: string;

  picsAcceptBox: boolean;
  marketingAcceptBox: boolean;

  position: string;
  institution: string;
  dept: string;
  address: string;
  country: string;
  officePhoneNumber: string;
  mobilePhoneNumber: string;

  orderPaymentTitle1: boolean;
  paymentTitle1: string;
  paymentTitle1Price: number;
  orderPaymentTitle2: boolean;
  paymentTitle2: string;
  paymentTitle2Price: number;
  orderPaymentTitle3: boolean;
  paymentTitle3: string;
  paymentTitle3Price: number;
  orderPaymentTitle4: boolean;
  paymentTitle4: string;
  paymentTitle4Price: number;
  orderPaymentTitle5: boolean;
  paymentTitle5: string;
  paymentTitle5Price: number;
  orderPaymentTitle6: boolean;
  paymentTitle6: string;
  paymentTitle6Price: number;
  orderPaymentTitle7: boolean;
  paymentTitle7: string;
  paymentTitle7Price: number;
  orderPaymentTitle8: boolean;
  paymentTitle8: string;
  paymentTitle8Price: number;
  orderPaymentTitle9: boolean;
  paymentTitle9: string;
  paymentTitle9Price: number;
  orderPaymentTitle10: boolean;
  paymentTitle10: string;
  paymentTitle10Price: number;
  customAnswers: string;

  needPayment: boolean;
  totalPayment: number;
  paymentStatus: string;
  paidAt: Date;
  paymentRefId: string;
  paymentRemark: string;

  updatedBy: string;

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

  orderPaymentQuantity1: number;
  orderPaymentQuantity2: number;
  orderPaymentQuantity3: number;
  orderPaymentQuantity4: number;
  orderPaymentQuantity5: number;
  orderPaymentQuantity6: number;
  orderPaymentQuantity7: number;
  orderPaymentQuantity8: number;
  orderPaymentQuantity9: number;
  orderPaymentQuantity10: number;
}

Participant.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    eventId: { type: DataTypes.UUID, allowNull: false, },
    formId: { type: DataTypes.UUID, allowNull: true, },
    userType: { type: new DataTypes.STRING(255), allowNull: false, },
    userId: { type: new DataTypes.STRING(255), allowNull: true, },
    sub: { type: new DataTypes.STRING(255), allowNull: true },
    qrCode: { type: new DataTypes.STRING(255), allowNull: true, },
    disabled: { type: DataTypes.BOOLEAN, allowNull: false, },

    registrationStatus: { type: new DataTypes.STRING(255), allowNull: true, },
    internalRemark: { type: DataTypes.TEXT, allowNull: true, },

    title: { type: new DataTypes.STRING(255), allowNull: false, },
    firstname: { type: new DataTypes.STRING(255), allowNull: false, },
    lastname: { type: new DataTypes.STRING(255), allowNull: false, },
    email: { type: new DataTypes.STRING(255), allowNull: false, },
    yearOfGraduation: { type: new DataTypes.STRING(255), allowNull: true, },
    graduationProgram: { type: new DataTypes.STRING(255), allowNull: true, },
    graduationDept: { type: new DataTypes.STRING(255), allowNull: true, },

    picsAcceptBox: { type: DataTypes.BOOLEAN, allowNull: true, },
    marketingAcceptBox: { type: DataTypes.BOOLEAN, allowNull: true, },

    position: { type: new DataTypes.STRING(255), allowNull: true, },
    institution: { type: new DataTypes.STRING(255), allowNull: true, },
    dept: { type: new DataTypes.STRING(255), allowNull: true, },
    address: { type: new DataTypes.STRING(255), allowNull: true, },
    country: { type: new DataTypes.STRING(255), allowNull: true, },
    officePhoneNumber: { type: new DataTypes.STRING(255), allowNull: true, },
    mobilePhoneNumber: { type: new DataTypes.STRING(255), allowNull: true, },

    orderPaymentTitle1: { type: DataTypes.BOOLEAN, allowNull: false, },
    paymentTitle1: { type: DataTypes.TEXT, allowNull: true, },
    paymentTitle1Price: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, },
    orderPaymentTitle2: { type: DataTypes.BOOLEAN, allowNull: false, },
    paymentTitle2: { type: DataTypes.TEXT, allowNull: true, },
    paymentTitle2Price: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, },
    orderPaymentTitle3: { type: DataTypes.BOOLEAN, allowNull: false, },
    paymentTitle3: { type: DataTypes.TEXT, allowNull: true, },
    paymentTitle3Price: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, },
    orderPaymentTitle4: { type: DataTypes.BOOLEAN, allowNull: false, },
    paymentTitle4: { type: DataTypes.TEXT, allowNull: true, },
    paymentTitle4Price: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, },
    orderPaymentTitle5: { type: DataTypes.BOOLEAN, allowNull: false, },
    paymentTitle5: { type: DataTypes.TEXT, allowNull: true, },
    paymentTitle5Price: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, },
    orderPaymentTitle6: { type: DataTypes.BOOLEAN, allowNull: false, },
    paymentTitle6: { type: DataTypes.TEXT, allowNull: true, },
    paymentTitle6Price: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, },
    orderPaymentTitle7: { type: DataTypes.BOOLEAN, allowNull: false, },
    paymentTitle7: { type: DataTypes.TEXT, allowNull: true, },
    paymentTitle7Price: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, },
    orderPaymentTitle8: { type: DataTypes.BOOLEAN, allowNull: false, },
    paymentTitle8: { type: DataTypes.TEXT, allowNull: true, },
    paymentTitle8Price: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, },
    orderPaymentTitle9: { type: DataTypes.BOOLEAN, allowNull: false, },
    paymentTitle9: { type: DataTypes.TEXT, allowNull: true, },
    paymentTitle9Price: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, },
    orderPaymentTitle10: { type: DataTypes.BOOLEAN, allowNull: false, },
    paymentTitle10: { type: DataTypes.TEXT, allowNull: true, },
    paymentTitle10Price: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, },
    customAnswers: { type: DataTypes.TEXT, allowNull: true, },

    needPayment: { type: DataTypes.BOOLEAN, allowNull: false, },
    totalPayment: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, },
    paymentStatus: { type: new DataTypes.STRING(255), allowNull: false, },
    paidAt: { type: DataTypes.DATE, allowNull: true },
    paymentRefId: { type: new DataTypes.STRING(20), allowNull: false, unique: true },
    paymentRemark: { type: new DataTypes.STRING(MAX), allowNull: true },

    updatedBy: { type: new DataTypes.STRING(255), allowNull: true, },

    orderPaymentQuantity1: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, },
    orderPaymentQuantity2: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, },
    orderPaymentQuantity3: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, },
    orderPaymentQuantity4: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, },
    orderPaymentQuantity5: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, },
    orderPaymentQuantity6: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, },
    orderPaymentQuantity7: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, },
    orderPaymentQuantity8: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, },
    orderPaymentQuantity9: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, },
    orderPaymentQuantity10: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, },
  },
  {
    sequelize,
    tableName: "Participants",
  }
);

export { Participant, ParticipantAttributes };