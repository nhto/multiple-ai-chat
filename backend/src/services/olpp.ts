
import moment from 'moment';
import { Op } from "sequelize";
import * as olppapi from '../utilities/olppapi';
import { ApiError, apiUnauthorizedError } from '../models/error';
import { MeSummary, EventSessionSummary, RoleLabel, PaymentStatusLabel, OlppPaymentMessage, RegistrationStatusLabel, OlppRequestType, ParticipantSessionSummary, MessagePlaceholderLabel } from '../models/model';
import { hasAnyRole } from "./authn";
import { Event } from '../repo/event';
import { EventSession } from "../repo/eventSession";
import { EventRegistration } from '../repo/eventRegistration';
import { Participant, ParticipantAttributes } from '../repo/participant';
import { ParticipantSession } from "../repo/participantSession";
import { CustomPaymentItem } from '../repo/customPaymentItem';
import { AppConfig } from '../repo/config';
import { renderEmail, sendEmail } from '../utilities/email';
import * as config from "./../utilities/config";
import logger from "./../utilities/logger";
import { createCanvas, loadImage } from "canvas";
import { createQrWithGuestName } from './cams';
import qrcode from 'qrcode';
import path from 'path';

async function checkTotalPayment(participant: Participant, form: EventRegistration): Promise<Participant> {
  const isEarlyBirdPassed = !form?.earlyBirdEnd || moment(form.earlyBirdEnd).valueOf() < moment().valueOf();

  participant.totalPayment = 0;
  const quantityArray = JSON.parse(form?.paymentTitleQuantityEnables);

  if (form?.paymentTitle1Mandatory || participant.orderPaymentTitle1) {
    participant.paymentTitle1Price = isEarlyBirdPassed ? form.paymentTitle1Price : form.paymentTitle1Price_EB;
    if (!quantityArray || !quantityArray[0]) {
      participant.totalPayment += participant.paymentTitle1Price;
    } else {
      participant.totalPayment += participant.paymentTitle1Price * participant.orderPaymentQuantity1;
    }
    console.log("participant.paymentTitle1Price");
    console.log(participant.paymentTitle1Price);
  }

  if (form?.paymentTitle2Mandatory || participant.orderPaymentTitle2) {
    participant.paymentTitle2Price = isEarlyBirdPassed ? form.paymentTitle2Price : form.paymentTitle2Price_EB;
    if (!quantityArray || !quantityArray[1]) {
      participant.totalPayment += participant.paymentTitle2Price;
    } else {
      participant.totalPayment += participant.paymentTitle2Price * participant.orderPaymentQuantity2;
    }
    console.log("participant.paymentTitle2Price");
    console.log(participant.paymentTitle2Price);
  }

  if (form?.paymentTitle3Mandatory || participant.orderPaymentTitle3) {
    participant.paymentTitle3Price = isEarlyBirdPassed ? form.paymentTitle3Price : form.paymentTitle3Price_EB;
    if (!quantityArray || !quantityArray[2]) {
      participant.totalPayment += participant.paymentTitle3Price;
    } else {
      participant.totalPayment += participant.paymentTitle3Price * participant.orderPaymentQuantity3;
    }
    console.log("participant.paymentTitle3Price");
    console.log(participant.paymentTitle3Price);
  }

  if (form?.paymentTitle4Mandatory || participant.orderPaymentTitle4) {
    participant.paymentTitle4Price = isEarlyBirdPassed ? form.paymentTitle4Price : form.paymentTitle4Price_EB;
    if (!quantityArray || !quantityArray[3]) {
      participant.totalPayment += participant.paymentTitle4Price;
    } else {
      participant.totalPayment += participant.paymentTitle4Price * participant.orderPaymentQuantity4;
    }
    console.log("participant.paymentTitle4Price");
    console.log(participant.paymentTitle4Price);
  }

  if (form?.paymentTitle5Mandatory || participant.orderPaymentTitle5) {
    participant.paymentTitle5Price = isEarlyBirdPassed ? form.paymentTitle5Price : form.paymentTitle5Price_EB;
    if (!quantityArray || !quantityArray[4]) {
      participant.totalPayment += participant.paymentTitle5Price;
    } else {
      participant.totalPayment += participant.paymentTitle5Price * participant.orderPaymentQuantity5;
    }
    console.log("participant.paymentTitle5Price");
    console.log(participant.paymentTitle5Price);
  }

  if (form?.paymentTitle6Mandatory || participant.orderPaymentTitle6) {
    participant.paymentTitle6Price = isEarlyBirdPassed ? form.paymentTitle6Price : form.paymentTitle6Price_EB;
    if (!quantityArray || !quantityArray[5]) {
      participant.totalPayment += participant.paymentTitle6Price;
    } else {
      participant.totalPayment += participant.paymentTitle6Price * participant.orderPaymentQuantity6;
    }
    console.log("participant.paymentTitle6Price");
    console.log(participant.paymentTitle6Price);
  }

  if (form?.paymentTitle7Mandatory || participant.orderPaymentTitle7) {
    participant.paymentTitle7Price = isEarlyBirdPassed ? form.paymentTitle7Price : form.paymentTitle7Price_EB;
    if (!quantityArray || !quantityArray[6]) {
      participant.totalPayment += participant.paymentTitle7Price;
    } else {
      participant.totalPayment += participant.paymentTitle7Price * participant.orderPaymentQuantity7;
    }
    console.log("participant.paymentTitle7Price");
    console.log(participant.paymentTitle7Price);
  }

  if (form?.paymentTitle8Mandatory || participant.orderPaymentTitle8) {
    participant.paymentTitle8Price = isEarlyBirdPassed ? form.paymentTitle8Price : form.paymentTitle8Price_EB;
    if (!quantityArray || !quantityArray[7]) {
      participant.totalPayment += participant.paymentTitle8Price;
    } else {
      participant.totalPayment += participant.paymentTitle8Price * participant.orderPaymentQuantity8;
    }
    console.log("participant.paymentTitle8Price");
    console.log(participant.paymentTitle8Price);
  }

  if (form?.paymentTitle9Mandatory || participant.orderPaymentTitle9) {
    participant.paymentTitle9Price = isEarlyBirdPassed ? form.paymentTitle9Price : form.paymentTitle9Price_EB;
    if (!quantityArray || !quantityArray[8]) {
      participant.totalPayment += participant.paymentTitle9Price;
    } else {
      participant.totalPayment += participant.paymentTitle9Price * participant.orderPaymentQuantity9;
    }
    console.log("participant.paymentTitle9Price");
    console.log(participant.paymentTitle9Price);
  }

  if (form?.paymentTitle10Mandatory || participant.orderPaymentTitle10) {
    participant.paymentTitle10Price = isEarlyBirdPassed ? form.paymentTitle10Price : form.paymentTitle10Price_EB;
    if (!quantityArray || !quantityArray[9]) {
      participant.totalPayment += participant.paymentTitle10Price;
    } else {
      participant.totalPayment += participant.paymentTitle10Price * participant.orderPaymentQuantity10;
    }
    console.log("participant.paymentTitle10Price");
    console.log(participant.paymentTitle10Price);
  }



  participant.updatedBy = "SYSTEM";

  console.log("participant.totalPayment");
  console.log(participant.totalPayment);

  await participant.save();

  return participant;
}

async function mapParticipantOrderDetails(participant: ParticipantAttributes, emailFormat: boolean = false): Promise<any> {
  const orderDetails: any[] = [];

  const fieldNames = Object.keys(participant)?.filter(k => k.toLowerCase().includes("paymenttitle"));
  const fieldPerItem = Array.from(new Set(fieldNames.map(name => name.replace(/[0-9]/g, ''))));
  const itemCount = fieldNames.length / fieldPerItem.length;

  for (let i = 1; i < itemCount + 1; i++) {
    const orderPaymentTitle_FieldName = `orderPaymentTitle${i}`;
    const paymentTitle_FieldName = `paymentTitle${i}`;
    const paymentTitlePrice_FieldName = `paymentTitle${i}Price`;
    const paymentQuantity_FieldName = `orderPaymentQuantity${i}`;

    if (!fieldNames.includes(orderPaymentTitle_FieldName)
      || !fieldNames.includes(paymentTitle_FieldName)
      || !fieldNames.includes(paymentTitlePrice_FieldName)
      || fieldPerItem.length !== 3) {
      throw new ApiError("Payment fields updated.");
    }

    type participantKey = keyof typeof participant;

    const orderItem = participant[orderPaymentTitle_FieldName as participantKey];
    if (!!orderItem) {
      const itemId = Number(participant[paymentTitle_FieldName as participantKey]);
      const refItem = await CustomPaymentItem.findOne({ where: { itemId } });
      if (!refItem) throw new ApiError("Item ID not found.");
      const itemRemark = `${refItem?.itemNature} - ${refItem?.itemName}`;
      const itemPrice = Number(participant[paymentTitlePrice_FieldName as participantKey]);

      const itemQuantity = Number(participant[paymentQuantity_FieldName as participantKey]);
      const detail = olppapi.mapItemsOrderDetailModel(itemId, itemQuantity === 0 ? 1 : itemQuantity, itemPrice, itemRemark);

      if (emailFormat) {
        const form = await EventRegistration.findByPk(participant.formId);
        type formKey = keyof typeof form;

        const isEarlyBird = !!form[paymentTitlePrice_FieldName + "_EB" as formKey]
          && itemPrice === Number(form[paymentTitlePrice_FieldName + "_EB" as formKey])
          && itemPrice !== Number(form[paymentTitlePrice_FieldName as formKey]);

        detail.isEarlyBird = isEarlyBird;
        detail.itemName = refItem?.itemName + (isEarlyBird ? " *" : '');
        detail.actualPrice = Number(form[paymentTitlePrice_FieldName as formKey]);
        detail.earlyBirdPrice = Number(form[paymentTitlePrice_FieldName + "_EB" as formKey]);
        detail.quantitySelected = Number(participant[paymentQuantity_FieldName as participantKey]);
      }

      orderDetails.push(detail);
    }
  }

  return orderDetails;
}

async function mapParticipantOrderDetailsDisplay(participant: ParticipantAttributes): Promise<any> {
  const items = [];

  const orderDetails = await mapParticipantOrderDetails(participant, true);

  for (const detail of orderDetails) {
    const totalPrice = (detail?.amount / 100) * detail?.quantity;

    items.push({
      ID: detail?.item_id ?? "",
      Name: detail?.itemName ?? "",
      Price: (detail?.amount / 100)?.toFixed(2) ?? "",
      IsEarlyBird: detail?.isEarlyBird ?? "",
      ActualPrice: (detail?.actualPrice)?.toFixed(2) ?? "",
      EarlyBirdPrice: (detail?.earlyBirdPrice)?.toFixed(2) ?? "",
      Quantity: detail?.quantity ?? "",
      QuantitySelected: detail?.quantitySelected ?? "",
      TotalPrice: (totalPrice)?.toFixed(2) ?? "",
    })
  }

  return items;
}

function mapTransactionDetail(participant: ParticipantAttributes): any[] {
  const transactions = participant?.paymentRemark?.split("\n\n")?.filter((t: any) => !!t && t?.length > 0) ?? [];
  const transactionsDisplay = [];

  for (const transaction of transactions) {
    const paymentRefNo = transaction?.match(/Ref: (.*);/);
    const paymentTransactionId = transaction?.match(/Transaction ID: (.*);/);
    const paymentMethod = transaction?.match(/Method: (.*);/);
    const paymentAmount = transaction?.match(/Amount: (.*);/);
    const paymentTransactionTime = transaction?.match(/Transaction Time: (.*);/);

    transactionsDisplay.push({
      paymentRefNo: !!paymentRefNo ? paymentRefNo[1] : "",
      paymentTransactionId: !!paymentTransactionId ? paymentTransactionId[1] : "",
      paymentMethod: !!paymentMethod ? paymentMethod[1] : "",
      paymentAmount: !!paymentAmount ? Number(paymentAmount[1]).toFixed(2) : "",
      paymentTransactionTime: !!paymentTransactionTime
        ? moment(new Date(paymentTransactionTime[1])).format('DD-MM-YYYY HH:mm:ss')
        : !!participant?.paidAt
          ? moment(new Date(participant.paidAt)).format('DD-MM-YYYY HH:mm:ss')
          : "",
    })
  }

  return transactionsDisplay;
}

async function start(participantId: NonNullable<string>, eventId: NonNullable<string>, paymentRefId: NonNullable<string>, callbackurl: NonNullable<string>, failedcallbackurl: NonNullable<string>): Promise<string> {
  if (!participantId) throw new ApiError("Participant ID cannot be empty.");
  if (paymentRefId.startsWith("NP")) throw new ApiError("No payment needed.");

  try {
    await statusEnquiry(participantId);

    let participant = await Participant.findOne({
      where: {
        [Op.and]: {
          id: participantId,
          eventId,
          paymentRefId
        },
      }
    });
    if (!participant) throw new ApiError("Invalid participant.");

    const form = await EventRegistration.findByPk(participant.formId);
    if (!form) throw new ApiError("Invalid event registration form.");

    if (!!participant.paidAt || participant.paymentStatus === PaymentStatusLabel.Paid) {
      throw new ApiError("Paid.");
    }
    else if (!participant.needPayment) {
      throw new ApiError("No payment needed.");
    }
    else if (!!form?.end && moment(form.end).valueOf() < moment().valueOf()) {
      throw new ApiError("Event expired.");
    }
    else if (participant.registrationStatus !== RegistrationStatusLabel.Registered) {
      throw new ApiError("Not registered yet.");
    }

    // update payment method to olpp
    participant = await checkTotalPayment(participant, form);
    participant.paymentStatus = PaymentStatusLabel.OlppInProgress;
    participant.updatedBy = "SYSTEM";
    await participant.save();

    const paymentRequestModel = config.OLPPAPI_CREATE_REQUEST_TYPE === OlppRequestType.ItemsPayment
      ? olppapi.mapItemsPaymentRequestModel(
        participant.paymentRefId,
        false,
        `${participant.lastname} ${participant.firstname}`,
        participant.email,
        await mapParticipantOrderDetails(participant.get()),
        callbackurl
      )
      : await olppapi.mapPaymentRequestModel(
        participant.paymentRefId,
        participant.totalPayment,
        `Event Payment - $${participant.totalPayment}`,
        callbackurl
      );

    const paymentCreateResponse = await olppapi.paymentCreate(
      config.OLPPAPI_CREATE_REQUEST_TYPE === OlppRequestType.ItemsPayment
        ? config.OLPPAPI_CREATE_ITEMS_REQUEST
        : config.OLPPAPI_CREATE_REQUEST,
      form.paymentCode,
      paymentRequestModel
    );

    return paymentCreateResponse;
  } catch (err) {
    logger.error(err);
    return failedcallbackurl;
  }
}

async function getStatus(participantId: NonNullable<string>, eventId: NonNullable<string>, paymentRefId: NonNullable<string>, sessionId?: string, details?: string): Promise<any> {
  if (!participantId) throw new ApiError("Participant ID cannot be empty.");

  await statusEnquiry(participantId);

  let participant = await Participant.findOne({
    where: {
      [Op.and]: {
        id: participantId,
        eventId,
        paymentRefId
      },
    }
  });
  if (!participant) throw new ApiError("Invalid participant.");

  const form = await EventRegistration.findByPk(participant.formId);
  if (!form) throw new ApiError("Invalid event registration form.");

  let paymentStatus = OlppPaymentMessage.Proceed;

  if (!!participant.paidAt || participant.paymentStatus === PaymentStatusLabel.Paid) {
    paymentStatus = OlppPaymentMessage.Paid;
  }
  else if (!participant.needPayment || participant.paymentStatus === PaymentStatusLabel.Waived) {
    paymentStatus = OlppPaymentMessage.NoPayment;
  }
  else if (!!form?.end && moment(form.end).valueOf() < moment().valueOf()) {
    paymentStatus = OlppPaymentMessage.Expired;
  }
  else if (participant.registrationStatus !== RegistrationStatusLabel.Registered) {
    paymentStatus = OlppPaymentMessage.NotRegistered;
  }

  if (paymentStatus === OlppPaymentMessage.Proceed) {
    participant = await checkTotalPayment(participant, form);
  }

  const transactionsDetail = mapTransactionDetail(participant);
  const items = await mapParticipantOrderDetailsDisplay(participant.get());

  const participantSessions = await ParticipantSession.findAll({
    where: {
      [Op.and]: [
        { participantId },
        { eventId }
      ],
    },
  });

  const sessionIds = participantSessions.map(pS => pS.sessionId);

  const eventSessions = await EventSession.findAll({
    where: {
      [Op.and]: [
        { eventId },
        { id: sessionIds }
      ],
    }
  });

  const joinedSessions = eventSessions.map(session => ({
    details: session.details
  }));

  const sessionDetails = joinedSessions.map(session => session.details).join(', ');

  const needQRCode = form?.successfulMsgtoReg?.includes(MessagePlaceholderLabel.qrCode);
  const event = await Event.findOne({
    where: { id: eventId }
  });
  let qr = ""
  let qrCodeImage = "";
  if (needQRCode) {
    if (!participant.qrCode) {
      const camsResponse = await createQrWithGuestName(
        event?.start,
        event?.end,
        `${participant?.firstname} ${participant?.lastname}`,
        `CEMS - ${event?.topic}`,
      )
      if (!camsResponse.qrCode) {
        throw new ApiError("Cannot create QRCode");
      } else {
        qr = camsResponse.qrCode
        participant.qrCode = camsResponse.qrCode
        await participant.save()
      }
    } else {
      qr = participant.qrCode;
    }

    const canvas = createCanvas(parseInt(process.env.QRCODE_WIDTH, 10) + 22, parseInt(process.env.QRCODE_WIDTH, 10) + 22);
    // Draw the QRCode first
    await qrcode.toCanvas(canvas, qr, {
      errorCorrectionLevel: "H",
      margin: 1,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
      width: parseInt(process.env.QRCODE_WIDTH, 10) + 22
    });

    // Then Draw the logo on it
    const logoPath = path.resolve(__dirname, '../img/PolyU_Logo_QRCode.png')
    const img = await loadImage(logoPath);
    // const center = (parseInt(process.env.QRCODE_WIDTH, 10) - 70) / 2;
    await canvas.getContext("2d").drawImage(img, 126, 126, 70, 70);
    qrCodeImage = await canvas.toDataURL("image/png");
  }

  const endMessage = (
    participant?.registrationStatus === RegistrationStatusLabel.Registered
      ? form?.successfulMsgtoReg
      : participant?.registrationStatus === RegistrationStatusLabel.InWaitList
        ? form?.successfulMsgtoWaitingList
        : ""
  )
    ?.replaceAll('[%title%]', participant?.title)
    ?.replaceAll('[%firstname%]', participant?.firstname)
    ?.replaceAll('[%lastname%]', participant?.lastname)
    ?.replaceAll('[%position%]', participant?.position)
    ?.replaceAll('[%organization%]', participant?.institution)
    ?.replaceAll('[%dept%]', participant?.dept)
    ?.replaceAll('[%country%]', participant?.country)
    ?.replaceAll('[%session%]', sessionDetails)
    ?.replaceAll('[%eventDesc%]', form?.description)
    ?.replaceAll('[%internalremark%]', event?.remark)
    ?.replaceAll('[%qrCode%]', `<img src="${qrCodeImage}" width="${parseInt(process.env.QRCODE_WIDTH, 10)}" height="${parseInt(process.env.QRCODE_WIDTH, 10)}"><br/>QR Code: ${qr}<br/>`)

  return {
    event: {
      title: form?.topic ?? "",
      subTitle: form?.subtopic ?? "",
      description: form?.description ?? "",
      earlyBirdEnd: form?.earlyBirdEnd ? moment(new Date(form?.earlyBirdEnd)).format('YYYY-MM-DD') : "",
      regBeforeEarlyBird: !!form?.earlyBirdEnd && (moment(participant?.createdAt).valueOf() <= moment(form?.earlyBirdEnd).valueOf()),
      items: items ?? [],
      endMessage,
    },
    payment: {
      transactions: transactionsDetail?.map(transactionDetail => {
        return {
          method: transactionDetail.paymentMethod,
          refNo: transactionDetail.paymentRefNo,
          transactionId: transactionDetail.paymentTransactionId,
          amount: transactionDetail.paymentAmount,
          transactionDatetime: transactionDetail.paymentTransactionTime,
        }
      }) ?? [],
      status: paymentStatus ?? ""
    }
  }
}

async function statusEnquiry(participantId: NonNullable<string>): Promise<boolean> {
  if (!participantId) throw new ApiError("Participant ID cannot be empty.");

  try {
    const participant = await Participant.findByPk(participantId);
    if (!participant) throw new ApiError("Invalid participant.");

    // const form = await EventRegistration.findByPk(participant.formId);
    const form = await EventRegistration.findByPk(participant.formId, {
      attributes: ['id', 'eventId', 'paymentCode']
    });
    if (!form) throw new ApiError("Invalid event registration form.");

    if (!!participant.needPayment
      && (participant.paymentStatus === PaymentStatusLabel.WaitingForPayment
        || participant.paymentStatus === PaymentStatusLabel.OlppInProgress)) {
      const statusEnquiryResponse = await olppapi.statusEnquiry(form.paymentCode, participant.paymentRefId, config.OLPPAPI_CREATE_REQUEST_TYPE);
      if (!statusEnquiryResponse) return false;

      const details = JSON.parse(statusEnquiryResponse);
      const succeed = await GetAndUpdateStatus(participant, details);
      return succeed;
    }

    return false;
  }
  catch (err) {
    logger.error(err);
    return false;
  }
}

async function checkPendingPaymentStatus() {
  const participants = await Participant.findAll({
    where: { paymentStatus: PaymentStatusLabel.OlppInProgress }
  });

  for (const participant of participants) {
    await statusEnquiry(participant.id);
  }
}

async function handleCallback(d: NonNullable<string>): Promise<any> {
  let participantId = null;
  let eventId = null;
  let paymentRefId = null;

  try {
    if (!!d) {
      const decryptedMessage = await olppapi.decryptMessage(d);
      if (!decryptedMessage) throw new ApiError("Invalid decrypted message.");

      const details = JSON.parse(decryptedMessage);
      const paymentreferenceid = details?.paymentreferenceid;
      const remarks = details?.remarks;

      const participant = await Participant.findOne({
        where: {
          paymentRefId: config.OLPPAPI_CREATE_REQUEST_TYPE === OlppRequestType.ItemsPayment
            ? remarks
            : paymentreferenceid
        }
      });

      if (!!participant) {
        participantId = participant.id;
        eventId = participant.eventId;
        paymentRefId = participant.paymentRefId;

        if (!!participant.needPayment
          && (participant.paymentStatus === PaymentStatusLabel.WaitingForPayment
            || participant.paymentStatus === PaymentStatusLabel.OlppInProgress)) {
          const succeed = await GetAndUpdateStatus(participant, details);
          return { participantId, eventId, paymentRefId, res: succeed ? OlppPaymentMessage.Succeed : OlppPaymentMessage.Failed };
        }
      }
    }

    throw new ApiError("Invalid participant.");
  } catch (err) {
    logger.error(err);
    return { participantId, eventId, paymentRefId, res: OlppPaymentMessage.Failed };
  }
}

async function GetAndUpdateStatus(participant: Participant, details: any): Promise<boolean> {
  const history = details?.modelAttrs;
  const successfulPaymentList = history?.filter((p: any) => !!p?.status && (p?.status === "PAID" || p?.status === "DUPLICATED"));

  const succeed: boolean = successfulPaymentList?.length > 0;
  if (succeed) {
    console.log("testing log before update payment status");
    participant.paymentRemark = successfulPaymentList?.map((p: any) =>
      `Ref: ${p?.paymentreferenceid};\nTransaction ID: ${p?.transactionid};\nMethod: ${p?.paymentmethodname};\nAmount: ${String(p?.amount / 100)};\nTransaction Time: ${moment(new Date(p?.transactiontime)).format('YYYY-MM-DD HH:mm:ss')};\nStatus: ${Capitalize(p?.status)};`
    ).join("\n\n");
    participant.paidAt = new Date(successfulPaymentList[0]?.transactiontime.toLocaleString());
    participant.paymentStatus = PaymentStatusLabel.Paid;
    console.log("testing log after update payment status");

    console.log("send email before " + participant.email);
    send(participant.email, participant, true);
    console.log("send email after " + participant.email);
  }
  else {
    const refPayment = history[0];
    if (!!refPayment?.status) {
      participant.paymentRemark = `Ref: ${refPayment?.paymentreferenceid};\nTransaction ID: ${refPayment?.transactionid};\nMethod: ${refPayment?.paymentmethodname};\nAmount: ${String(refPayment?.amount / 100)};\nTransaction Time: ${moment(new Date(refPayment?.transactiontime)).format('YYYY-MM-DD HH:mm:ss')};\nStatus: ${Capitalize(refPayment?.status)};`;
    }
  }
  // else if (status !== "PENDING") {
  //   application.paymentStatus = ApplicationStatus.Pending;
  //   application.status = ApplicationStatus[ApplicationStatus.Pending];
  // }
  participant.updatedBy = "SYSTEM";

  await participant.save();

  return succeed;
}

async function send(emailAddress: NonNullable<string>, participant: Participant, isNotTesting: boolean): Promise<any> {
  if (!emailAddress) throw new ApiError('Email cannot be empty');
  if (!participant) throw new ApiError('Invalid participant');

  const event = await Event.findOne({ where: { id: participant.eventId } });
  if (!event) throw new ApiError('Event not found');

  const form = await EventRegistration.findByPk(participant.formId);
  if (!form) throw new ApiError('Event Registration Form not found');

  // const bcc = isNotTesting ? [form.emailBcc].concat(config.OLPP_EMAIL_BCC.split(',')) : [''];
  const bcc = isNotTesting
    ? [
      form.emailBcc || '', 
      ...(config.OLPP_EMAIL_BCC ? config.OLPP_EMAIL_BCC.split(',') : []), 
      'cemsadm@polyu.edu.hk'
    ]
    : [''];

  const transactionsDetail = mapTransactionDetail(participant);
  const transactionDetail = !!transactionsDetail && transactionsDetail?.length > 0 ? transactionsDetail[0] : null;
  if (!transactionDetail) throw new ApiError('Invalid transaction detail');
  const items = await mapParticipantOrderDetailsDisplay(participant.get());
  const eventIdException = await AppConfig.findOne({
    where: { configId: 'eventid.exception' }
  });

  for (let i = 0; i < 3; i++) {
    try {
      let haveEarlyBird = false;

      for (const item of items) {
        if (item.Name && item.Name.includes('*')) {
          haveEarlyBird = true;
        }
        console.log(item);
      }

      const email = await renderEmail("registration_fee_paid", [emailAddress], [], bcc, {
        ApplicantName: `${participant.title}. ${participant.firstname} ${participant.lastname}`,
        ParticipantId: participant.id,
        PaymentMethod: transactionDetail?.paymentMethod,
        EventTitle: form.topic,
        RefNo: transactionDetail?.paymentRefNo,
        TransactionId: transactionDetail?.paymentTransactionId,
        PaymentDate: transactionDetail?.paymentTransactionTime,
        DeptRef: participant.email,
        Items: items,
        PaymentAmount: transactionDetail?.paymentAmount,
        ContactName: event.contactName,
        ContactPhoneNo: !!event.contactPhoneNumber && event.contactPhoneNumber?.trim().length > 0 && /^[0-9]{8}$/.test(event.contactPhoneNumber.trim())
          ? ` (852) ${event.contactPhoneNumber} or`
          : '',
        ContactEmail: event.contactEmail,
        ContactDept: event.contactDept,
        EarlyBirdEnd: form.earlyBirdEnd,
        EventId: event.id,
        EventIdException: eventIdException.value,
        haveEarlyBird: haveEarlyBird,
      });
      email.subject = isNotTesting ? `Online Payment (CEMS) - ${form.topic}` : `[Re-send] Online Payment (CEMS) - ${form.topic}`;

      console.log("send email before in send function" + participant.email);
      await sendEmail(email);
      console.log("send email after in send function" + participant.email);

      return;
    }
    catch (error) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

function Capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.toLowerCase().slice(1);
}

export { start, getStatus, statusEnquiry, checkPendingPaymentStatus, handleCallback, send };