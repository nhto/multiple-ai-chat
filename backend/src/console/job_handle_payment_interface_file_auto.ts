import { Op } from "sequelize";
import { renderEmail, sendEmail } from "../utilities/email";
import { Attendance } from "../repo/attendance";
import { Event } from "../repo/event";
import logger from '../utilities/logger';
import moment from "moment";
import { toLocalDate } from "../utilities/date";
// import { listHoUForEvent } from "../services/event";
import * as config from '../utilities/config';
import * as s3 from '../utilities/s3client';
import '../repo';

import { readFile } from 'fs/promises';
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from 'stream';
import { CustomPaymentEvent } from "../repo/customPaymentEvent";
import { CustomPaymentItem } from "../repo/customPaymentItem";

class ApiError implements Error {
  constructor(message: string) {
    this.name = "ApiError";
    this.message = message;
  }
  name: string;
  message: string;
  stack?: string;
}

export default async function main() {

  // Read the input file, store the records into an array
  console.log("\nReading local sample interface file")
  const s3EventFile = await s3.getCsvObject("olpp/interfaceFile/cems_event.csv");
  const s3ItemFile = await s3.getCsvObject("olpp/interfaceFile/cems_item.csv");
  const fileContent_event = s3EventFile; // No need to read again
  const fileContent_item = s3ItemFile; // No need to read again

  console.log("Finish reading local sample interface file\n")

  console.log("Finding line breaker")
  const lineBreaker_event = fileContent_event.indexOf("\n\r") >= 0 ? "\n\r" : fileContent_event.indexOf("\r\n") >= 0 ? "\r\n" : "\n"
  const lineBreaker_item = fileContent_item.indexOf("\n\r") >= 0 ? "\n\r" : fileContent_item.indexOf("\r\n") >= 0 ? "\r\n" : "\n"
  console.log("Finish finding line breaker\n")

  // Split the string into rows and store them in an array
  console.log("Splitting string into Array")
  const rowsArray_event: string[] = fileContent_event.split(lineBreaker_event);
  const rowsArray_item: string[] = fileContent_item.split(lineBreaker_item);
  console.log("Finish splitting string into Array\n")

  console.log("Remove empty elements in array")
  const rowsArrayNoEmpty_event = rowsArray_event.filter(r => !!r)
  const rowsArrayNoEmpty_item = rowsArray_item.filter(r => !!r)
  console.log("Finish removing empty elements in array\n")

  console.log("Finding all events and items in DB")
  const cpeInDB = await CustomPaymentEvent.findAll()
  const cpiInDB = await CustomPaymentItem.findAll({})
  console.log("Finish finding all events and items in DB\n")

  console.log("Checking arrays and store the rows in a new Array")
  const recordsArray_event = [];
  const recordsArray_item = [];
  for (let i = 1; i < rowsArrayNoEmpty_event?.length; i++) {
    const columnsArray: string[] = rowsArrayNoEmpty_event[i].split('||');
    if (columnsArray?.length !== 13) { throw new ApiError("Incorrect Column Count of CPE"); }

    const cpe = cpeInDB?.find((cpeInLoop) => cpeInLoop?.eventId === columnsArray[0])
    console.log(cpe ? `CPE found in DB! columnsArray[0]: ${columnsArray[0]}` : `CPE not in DB! columnsArray[0]: ${columnsArray[0]}`)

    const deptArray = columnsArray[3]?.split(',')

    if (!moment(columnsArray[8], "YYYY-MM-DD").isValid()) { throw new ApiError(`EVENT_START_DATE not Valid: ${columnsArray[8]}, row no: ${i + 1}`); }
    else if (!moment(columnsArray[9], "YYYY-MM-DD").isValid()) { throw new ApiError(`EVENT_END_DATE not Valid: ${columnsArray[9]}, row no: ${i + 1}`); }
    else if (deptArray?.length !== 2) { throw new ApiError(`Incorrect Department Format`); }
    recordsArray_event?.push({
      cpe,
      eventId: columnsArray[0],
      eventTitle: columnsArray[1],
      eventCode: columnsArray[2],
      deptAbbr: deptArray[0]?.trim(),
      department: deptArray[1]?.trim(),
      contactPerson: columnsArray[4],
      contactEmail: columnsArray[5],
      contactTelephone: columnsArray[6],
      duplicatePaymentAllowed: columnsArray[7] === 'Yes' ? true : false,
      eventStartDate: moment(columnsArray[8], "YYYY-MM-DD"),
      eventEndDate: moment(columnsArray[9], "YYYY-MM-DD"),
      activeEventStatus: columnsArray[10] === 'Yes' ? true : false,
      payerNameRequired: columnsArray[11] === 'Yes' ? true : false,
      payerEmailRequired: columnsArray[12] === 'Yes' ? true : false,
    })
  }
  for (let i = 1; i < rowsArrayNoEmpty_item?.length; i++) {
    const columnsArray: string[] = rowsArrayNoEmpty_item[i].split('||');
    if (columnsArray?.length !== 12) { throw new ApiError("Incorrect Column Count of CPE"); }

    const cpi = cpiInDB?.find((cpiInLoop) => cpiInLoop?.itemId === columnsArray[0])
    console.log(cpi ? `CPI found in DB! columnsArray[0]: ${columnsArray[0]}` : `CPI not in DB! columnsArray[0]: ${columnsArray[0]}`)

    if (!moment(columnsArray[10], "YYYY-MM-DD").isValid()) { throw new ApiError(`PAYMENT_ITEM_START_DATE not Valid: ${columnsArray[8]}, row no: ${i + 1}`); }
    else if (!moment(columnsArray[11], "YYYY-MM-DD").isValid()) { throw new ApiError(`PAYMENT_ITEM_END_DATE not Valid: ${columnsArray[9]}, row no: ${i + 1}`); }
    recordsArray_item?.push({
      cpi,
      itemId: columnsArray[0],
      eventId: columnsArray[1],
      itemCode: columnsArray[2],
      itemName: columnsArray[3],
      multiSelect: columnsArray[4] === 'Yes' ? true : false,
      itemNature: columnsArray[5],
      enableRemark: columnsArray[6] === 'true' ? true : false,
      defaultAmount: parseInt(columnsArray[7], 10),
      defaultQuantity: parseInt(columnsArray[8], 10),
      editAmountEnabled: columnsArray[9] === 'Yes' ? true : false,
      paymentItemStartDate: moment(columnsArray[10], "YYYY-MM-DD"),
      paymentItemEndDate: moment(columnsArray[11], "YYYY-MM-DD"),
    })
  }
  console.log("Finish checking arrays and store the rows in a new Array\n")

  console.log("Handling array of CustomPaymentEvent")
  for (const record of recordsArray_event) {
    if (!!record.cpe) {
      record.cpe.set({
        eventId: record?.eventId,
        eventTitle: record?.eventTitle,
        eventCode: record?.eventCode,
        deptAbbr: record?.deptAbbr,
        department: record?.department,
        contactPerson: record?.contactPerson,
        contactEmail: record?.contactEmail,
        contactTelephone: record?.contactTelephone,
        duplicatePaymentAllowed: record?.duplicatePaymentAllowed,
        eventStartDate: record?.eventStartDate?.toDate(),
        eventEndDate: record?.eventEndDate?.toDate(),
        activeEventStatus: record?.activeEventStatus,
        payerNameRequired: record?.payerNameRequired,
        payerEmailRequired: record?.payerEmailRequired,
      })
      await record.cpe.save()
    } else {
      const createRes = await CustomPaymentEvent.create({
        eventId: record?.eventId,
        eventTitle: record?.eventTitle,
        eventCode: record?.eventCode,
        deptAbbr: record?.deptAbbr,
        department: record?.department,
        contactPerson: record?.contactPerson,
        contactEmail: record?.contactEmail,
        contactTelephone: record?.contactTelephone,
        duplicatePaymentAllowed: record?.duplicatePaymentAllowed,
        eventStartDate: record?.eventStartDate?.toDate(),
        eventEndDate: record?.eventEndDate?.toDate(),
        activeEventStatus: record?.activeEventStatus,
        payerNameRequired: record?.payerNameRequired,
        payerEmailRequired: record?.payerEmailRequired,
      })
    }
  }
  console.log("Finish handling array of CustomPaymentEvent\n")

  console.log("Handling array of CustomPaymentItem")
  for (const record of recordsArray_item) {
    if (!!record.cpi) {
      record.cpi.set({
        itemId: record?.itemId,
        eventId: record?.eventId,
        itemCode: record?.itemCode,
        itemName: record?.itemName,
        multiSelect: record?.multiSelect,
        itemNature: record?.itemNature,
        enableRemark: record?.enableRemark,
        defaultAmount: record?.defaultAmount,
        defaultQuantity: record?.defaultQuantity,
        editAmountEnabled: record?.editAmountEnabled,
        paymentItemStartDate: record?.paymentItemStartDate?.toDate(),
        paymentItemEndDate: record?.paymentItemEndDate?.toDate(),
      })
      await record.cpi.save()
    } else {
      const createRes = await CustomPaymentItem.create({
        itemId: record?.itemId,
        eventId: record?.eventId,
        itemCode: record?.itemCode,
        itemName: record?.itemName,
        multiSelect: record?.multiSelect,
        itemNature: record?.itemNature,
        enableRemark: record?.enableRemark,
        defaultAmount: record?.defaultAmount,
        defaultQuantity: record?.defaultQuantity,
        editAmountEnabled: record?.editAmountEnabled,
        paymentItemStartDate: record?.paymentItemStartDate?.toDate(),
        paymentItemEndDate: record?.paymentItemEndDate?.toDate(),
      })
    }
  }
  console.log("Finish handling array of CustomPaymentItem\n")

  console.log("Handling array of CustomPaymentEvent - deletion")
  const eventIdList = recordsArray_event.map(e => e.eventId)
  const eventIdInDB = cpeInDB.map(e => e.eventId)
  for (const eventId of eventIdInDB) {
    if (eventIdList.indexOf(eventId) < 0) {
      await CustomPaymentEvent.destroy({ where: { eventId } })
      console.log(`Custom Payment Event with eventID ${eventId} is deleted.`)
    }
  }
  console.log("Finish handling array of CustomPaymentEvent - deletion\n")

  console.log("Handling array of CustomPaymentItem - deletion")
  const itemIdList = recordsArray_item.map(i => i.itemId)
  const itemIdInDB = cpiInDB.map(i => i.itemId)
  for (const itemId of itemIdInDB) {
    if (itemIdList.indexOf(itemId) < 0) {
      await CustomPaymentItem.destroy({ where: { itemId } })
      console.log(`Custom Payment Item with itemId ${itemId} is deleted.`)
    }
  }
  console.log("Finish handling array of CustomPaymentItem - deletion\n")
};