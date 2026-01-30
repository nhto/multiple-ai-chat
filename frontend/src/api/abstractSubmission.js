import axiosWrapper from "./wrapper";
import axios from "axios";

export function init({collectionId}) {
  const response = axiosWrapper(
    "post",
    `/api/abstract-submission/init`,
    {
      collectionId: collectionId
    }
  );
  return response;
}

export async function saveAbstract(payload) {
  const response = axiosWrapper(
    "post",
    `/api/abstract-submission/saveAbstract`,
    payload
  );
  return response;
}

export async function uploadFile({abstractSubmissionId, eventId, email, isSubmitted, file}) {
  const formData = new FormData();
  if(file){
      formData.append("file", file);
  }

  const response = await axios.post(
    `/api/abstract-submission/uploadFile`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      params: {
        abstractSubmissionId: abstractSubmissionId,
        eventId: eventId,
        email: email,
        isSubmitted: isSubmitted,
      },
    }
  );
  return response;
}

export async function deleteFile(payload) {
  const response = axiosWrapper(
    "post",
    `/api/abstract-submission/deleteFile`,
    payload
  );
  return response;
}

export async function submitAbstract(payload) {
  const response = axiosWrapper(
    "post",
    `/api/abstract-submission/submitAbstract`,
    payload
  );
  return response;
}
