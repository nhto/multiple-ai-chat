import axios from 'axios';
import { toLocalDate } from './../utilities/date';
import logger from './../utilities/logger';

type CamsQrRecord = {
    requestId: string,
    fromDate: Date,
    toDate: Date,
    qrCode: string,
    referenceCode: string,
    remarks: Date,
}

async function createQr(fromDate: Date, toDate: Date, referenceCode: string, remarks: string): Promise<CamsQrRecord> {

    const userInfo = await axios({
        method: 'post',
        url: "https://iamapi.polyu.edu.hk/manage-user/search?netid=" + referenceCode,
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Basic YWFkb19hbHVtbmlhY2Nlc3M6P25RJVk0WiRjcDJaTm5KYjVycDc='
        },
        data: ''
    })
    if (!userInfo?.data?.success) {
        logger.warn("Error creating QR: Cannot fetch User Info.");
        throw new Error("Error creating QR code.");
    }

    const response = await axios.post(process.env.CREATE_NEW_QRCODE_URL,
        {
            "fromDate": toLocalDate(fromDate) + "T00:00:00",
            "toDate": toLocalDate(toDate) + "T23:59:59",
            "referenceCode": userInfo?.data?.data[0]?.fullName ? userInfo?.data?.data[0]?.fullName : referenceCode,
            "remarks": remarks,
        },
        {
            auth: {
                username: process.env.BACKEND_API_AUTH_USERNAME,
                password: process.env.BACKEND_API_AUTH_PASSWORD
            }
        }
    );

    if (!response?.data?.isSuccess) {
        logger.warn("Error creating QR: CAMS API returns error.");
        throw new Error("Error creating QR code.");
    }

    const qrCode = response?.data?.data?.qrCode;
    if (!qrCode) {
        logger.warn("Error creating QR: no QR code generated from CAMS API.");
        throw new Error("Error creating QR code.");
    }

    return {
        requestId: response?.data?.data?.requestId,
        fromDate: new Date(response?.data?.data?.fromDate),
        toDate: new Date(response?.data?.data?.toDate),
        qrCode: response?.data?.data?.qrCode,
        referenceCode: response?.data?.data?.referenceCode,
        remarks: response?.data?.data?.remarks,
    };
}

async function createQrWithGuestName(fromDate: Date, toDate: Date, referenceCode: string, remarks: string): Promise<CamsQrRecord> {
    const response = await axios.post(process.env.CREATE_NEW_QRCODE_URL,
        {
            "fromDate": toLocalDate(fromDate) + "T00:00:00",
            "toDate": toLocalDate(toDate) + "T23:59:59",
            "referenceCode": referenceCode,
            "remarks": remarks,
        },
        {
            auth: {
                username: process.env.BACKEND_API_AUTH_USERNAME,
                password: process.env.BACKEND_API_AUTH_PASSWORD
            }
        }
    );

    if (!response?.data?.isSuccess) {
        logger.warn("Error creating QR with GuestName: CAMS API returns error.", response.data);
        throw new Error("Error creating QR code.");
    }

    const qrCode = response?.data?.data?.qrCode;
    if (!qrCode) {
        logger.warn("Error creating QR: no QR code generated with GuestName from CAMS API.");
        throw new Error("Error creating QR code.");
    }

    return {
        requestId: response?.data?.data?.requestId,
        fromDate: new Date(response?.data?.data?.fromDate),
        toDate: new Date(response?.data?.data?.toDate),
        qrCode: response?.data?.data?.qrCode,
        referenceCode: response?.data?.data?.referenceCode,
        remarks: response?.data?.data?.remarks,
    };
}

async function disableQr(requestId: string): Promise<CamsQrRecord> {

    const response = await axios.post(process.env.DISABLE_QRCODE_URL + `${requestId}/disable`,
        {
            // LEAVE IT EMPTY
        },
        {
            auth: {
                username: process.env.BACKEND_API_AUTH_USERNAME,
                password: process.env.BACKEND_API_AUTH_PASSWORD
            }
        }
    );

    if (!response?.data?.isSuccess) {
        logger.warn("Error disabling QR: CAMS API returns error.");
        throw new Error("Error disabling QR code.");
    }

    return {
        requestId: response?.data?.data?.requestId,
        fromDate: new Date(response?.data?.data?.fromDate),
        toDate: new Date(response?.data?.data?.toDate),
        qrCode: response?.data?.data?.qrCode,
        referenceCode: response?.data?.data?.referenceCode,
        remarks: response?.data?.data?.remarks,
    };
}

export { createQr, createQrWithGuestName, disableQr };