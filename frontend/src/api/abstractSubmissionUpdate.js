import axiosWrapper from "./wrapper";
import axios from "axios";

export function init({submitterId}) {
    const response = axiosWrapper(
        'post',
        `/api/abstract-submission-update/init`,
        {
            submitterId
        }
    );
    return response;
}

export function updateApplication(payload) {
    const response = axiosWrapper(
        'post',
        `/api/abstract-submission-update/updateApplication`,
        payload
    );
    return response;
}

export async function submitNewAbstract(payload) {
    const response = axiosWrapper(
        "post",
        `/api/abstract-submission-update/submitNewAbstract`,
        payload
    );
    return response;
}

export async function editAbstract(payload) {
    const response = axiosWrapper(
        "post",
        `/api/abstract-submission-update/editAbstract`,
        payload
    );
    return response;
}
  
export async function uploadFile({abstractSubmissionId, file}) {
    const formData = new FormData();
    if(file){
        formData.append("file", file);
    }

    const response = await axios.post(
        `/api/abstract-submission-update/uploadFile`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
        params: {
            abstractSubmissionId: abstractSubmissionId,
        },
        }
    );
    return response;
}

export async function deleteAbstractAsync(payload) {
    const response = axiosWrapper(
        "post",
        `/api/abstract-submission-update/deleteAbstractAsync`,
        payload
    );
    return response;
}