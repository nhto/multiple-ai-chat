import axiosWrapper from "./wrapper";
import axios from "axios";

export function init(payload) {
    const response = axiosWrapper(
        'post',
        `/api/endorse-comment/init`,
        payload
    );
    return response;
}

export function submit(payload) {
    const response = axiosWrapper(
        'post',
        `/api/endorse-comment/submit`,
        payload
    );
    return response;
}
