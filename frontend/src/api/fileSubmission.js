import axiosWrapper from "./wrapper";
import axios from "axios";

export function init({collectionId, submissionType}) {
  const response = axiosWrapper(
    "post",
    `/api/file-submission/${submissionType}/init`,
    {
      collectionId: collectionId
    }
  );
  return response;
}

export async function uploadFile({collectionId, submissionType, file}) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post(
    `/api/file-submission/${submissionType}/upload/${collectionId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response;
}

export async function listFiles({collectionId, submissionType}) {
  const response = axiosWrapper(
    "post",
    `/api/file-submission/${submissionType}/list/${collectionId}`,
    { }
  );
  return response;
}

export function submit({collectionId, submissionType, profile, custom, abstract, paper, successfulUploads}) {
  const response = axiosWrapper(
    "post",
    `/api/file-submission/${submissionType}/submit/${collectionId}`,
    {
      submission: {
        profile,
        custom,
        abstract,
        paper
      },
      successfulUploads
    }
  );
  return response;
}