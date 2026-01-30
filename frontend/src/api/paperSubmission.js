import axiosWrapper from "./wrapper";
import axios from "axios";

export function init({eventId, abstractId}) {
    const response = axiosWrapper(
        'post',
        `/api/paper-submission/init`,
        {
            eventId,
            abstractId
        }
    );
    return response;
}

export function submitNewPaper(payload) {
    const response = axiosWrapper(
        'post',
        `/api/paper-submission/submitNewPaper`,
        payload
    );
    return response;
}

export async function uploadNewPaper({abstractId, eventId, fileType, file}) {
    const formData = new FormData();
    if(file){
        formData.append("file", file);
    }

    const response = await axios.post(
        `/api/paper-submission/uploadNewPaper`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
        params: {
            fileType: fileType,
            eventId: eventId,
            abstractId: abstractId,
        },
        }
    );
    return response;
}

export function deletePaper(payload) {
    const response = axiosWrapper(
        'post',
        `/api/paper-submission/deletePaper`,
        payload
    );
    return response;
}

