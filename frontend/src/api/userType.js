import axiosWrapper from "./wrapper";

export function search(payload) {
    const response = axiosWrapper(
        "post",
        '/communal/userType/search',
        payload
    );
    return response;
}