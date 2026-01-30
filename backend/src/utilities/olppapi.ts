import { CompactEncrypt, compactDecrypt, importJWK } from 'jose';
import jose from 'node-jose';
import axios from 'axios';
import * as fs from 'fs';
import * as config from './config';
import moment from 'moment';
import { ApiError } from '../models/error';
import { OlppRequestType } from '../models/model';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const KeyType = {
  Private: "private",
  Public: "public",
}
const olppKeyFormat = 'pem';

function getKey(keytype: string, format: any): Promise<any> {
  if (!Object.values(KeyType).includes(keytype)) throw new ApiError("Invalid key type.");

  const _promise = new Promise((resolve, reject) => {
    fs.readFile(keytype === KeyType.Public ? config.OLPPAPI_KEY_FILEPATH_PUBLIC : config.OLPPAPI_KEY_FILEPATH_PRIVATE, 'utf8', (fileError, fileContent) => {
      if (fileError) {
        reject(fileError);
      }
      fileContent = fileContent.replace(/\r|\n/g, '');
      jose.JWK.asKey(fileContent, format, { alg: 'RSA-OAEP-256' }).then((key) => {
        resolve(key);
      }, (error) => {
        reject(error);
      });
    });
  });
  return _promise;
}

async function signMessage(messagePayloadStr: NonNullable<string>, olppEventId: NonNullable<string>): Promise<string> {
  if (!messagePayloadStr) throw new Error('Missing messagePayloadStr.');
  try {
    const _publicKey = await getKey(KeyType.Public, olppKeyFormat);
    if (!!_publicKey) {
      const _publickeyJSON = _publicKey.toJSON(true);
      const _temp = Object.assign({ alg: 'RSA' }, _publickeyJSON);
      const _jwk = await importJWK(_temp);
      const _headers = {
        kid: olppEventId,
        enc: 'A128GCM',
        alg: 'RSA-OAEP-256'
      };
      const _jwe = await new CompactEncrypt(encoder.encode(messagePayloadStr))
        .setProtectedHeader(_headers)
        .encrypt(_jwk);
      return _jwe;
    }
  } catch (err) {
    throw new ApiError("OLPP Message Handling Error.");
  }
}

async function decryptMessage(respMsgPayloadStr: NonNullable<string>): Promise<string> {
  if (!respMsgPayloadStr) throw new Error('Missing respMsgPayloadStr.');
  try {
    const _privateKey = await getKey(KeyType.Private, olppKeyFormat);
    const _temp = Object.assign({ alg: 'RSA' }, _privateKey.toJSON(true));
    const _jwk = await importJWK(_temp);
    const { plaintext, protectedHeader } = await compactDecrypt(respMsgPayloadStr, _jwk);
    console.log("testing log after plaintext");
    console.log(plaintext);
    return decoder.decode(plaintext);
  } catch (err) {
    console.log(err);
    throw new ApiError("OLPP Message Handling Error.");
  }
}

async function olppRequest(requestModel: any, olppEventId: string, requestPath: string): Promise<any> {
  if (!requestModel || !olppEventId || !requestPath) throw new ApiError("Invalid OLPP Request.");

  const currentDateTime = moment(new Date()).format('yyyyMMDDHHmmss');
  const signAuthResponse = await signMessage(currentDateTime, olppEventId);

  const signRequestResponse = await signMessage(JSON.stringify(requestModel), olppEventId);
  const request = JSON.stringify({ d: signRequestResponse });

  const response = await axios({
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Authentication": "Bearer " + signAuthResponse,
      "Content-Length": String(request.length)
    },
    url: config.OLPPAPI_BASEURL + requestPath,
    data: request
  });

  return response;
}

function mapPaymentRequestModel(referenceid: NonNullable<string>, amount: NonNullable<number>, message: NonNullable<string>, callbackurl: NonNullable<string>): any {
  if (amount <= 0) throw new ApiError(`Invalid payment amount $${amount}`);

  return {
    "type": "STATIC",
    "referenceid": referenceid,
    "paymentmethod": {
      "paymentmethodcode": "polyu.olpp.*",
      "amount": Math.round(Number(amount) * 100),
      "message": message
    },
    "callbackurl": callbackurl
  }
}

function mapItemsPaymentRequestModel(remarks: NonNullable<string>, isUniqueRemarks: boolean, name: NonNullable<string>, email: NonNullable<string>, details: NonNullable<any>, callbackurl: NonNullable<string>): any {
  return {
    remarks,
    is_unique_remarks: isUniqueRemarks,
    payer_name: name,
    payer_email: email,
    orderDetails: details,
    callbackurl
  }
}

function mapItemsOrderDetailModel(id: NonNullable<number>, quantity: NonNullable<number>, amount: NonNullable<number>, remarks: NonNullable<string>): any {
  if (amount <= 0) throw new ApiError(`Invalid payment amount $${amount}`);

  return {
    item_id: id,
    quantity,
    amount: Math.round(Number(amount) * 100),
    item_remarks: remarks ?? "",
  }
}

async function paymentCreate(requestPath: NonNullable<string>, olppEventId: NonNullable<string>, requestModel: any): Promise<string> {
  try {
    if (!!config?.OLPPAPI_BASEURL && !!requestPath && !!olppEventId && !!requestModel) {
      const olppResponse = await olppRequest(requestModel, olppEventId, requestPath);

      if (olppResponse?.request?.path !== null) {
        return config.OLPPAPI_BASEURL + olppResponse.request.path;
      };
    }

    throw new ApiError("OLPP Payment Create Error.");
  }
  catch (error) {
    throw new ApiError("OLPP Payment Create Error.");
  }
}

async function statusEnquiry(olppEventId: NonNullable<string>, paymentRefId: NonNullable<string>, olppCreateRequestType: NonNullable<string>): Promise<any> {
  try {
    if (!!config?.OLPPAPI_BASEURL && !!config?.OLPPAPI_STATUS_ENQUIRY && !!olppEventId && !!paymentRefId) {
      const requestModel = {
        "search": olppCreateRequestType === OlppRequestType.ItemsPayment ? "remark" : "refid",
        "id": paymentRefId,
      }
      console.log("testing log before olppResponse");
      const olppResponse = await olppRequest(requestModel, olppEventId, config.OLPPAPI_STATUS_ENQUIRY);
      console.log("testing log after olppResponse");
      console.log(olppResponse.data);

      // if (olppResponse?.data?.d !== null) {
      //   const decryptedResponse = await decryptMessage(olppResponse?.data?.d);
      //   return decryptedResponse;
      // };
      try {
        const decryptedResponse = await decryptMessage(olppResponse.data.d);
        return decryptedResponse;
      } catch (decryptError) {
        console.error("Decryption Error:", decryptError);
        throw new ApiError(`Decryption failed: ${decryptError.message}`);
      }
    }

    throw new ApiError(`
      OLPP Status Enquiry Error: Config missing
        Base URL ${config?.OLPPAPI_BASEURL},
        API ${config?.OLPPAPI_STATUS_ENQUIRY},
        Event ID ${olppEventId},
        Payment Ref ID ${paymentRefId}
    `);
  }
  catch (error) {
    throw new ApiError(`
      OLPP Status Enquiry Error: ${error?.message} ${error?.response?.status} ${error?.response?.statusText}
        Base URL ${config?.OLPPAPI_BASEURL},
        API ${config?.OLPPAPI_STATUS_ENQUIRY},
        Event ID ${olppEventId},
        Payment Ref ID ${paymentRefId},
        Error: ${JSON.stringify(error, null, 2)} 
    `);
  }
}

export { decryptMessage, mapPaymentRequestModel, mapItemsPaymentRequestModel, mapItemsOrderDetailModel, paymentCreate, statusEnquiry }