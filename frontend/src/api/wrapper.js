// Dispatch an api/sessionTimeout action when any API responses report "Session Timeout."

import axios from 'axios';
import { resetSession } from './../AppAction';

const appApiAxios = axios.create();

export const setupInterceptors = (store) => {
  appApiAxios.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    if (!response?.data?.success) {
      if (response?.data?.message === "Session Timeout.") {
        store.dispatch(resetSession());
      }

      if (response?.data?.message) {
        return Promise.reject(response?.data?.message);
      } else {
        return Promise.reject("Internal Server Error.");
      }
    }
    return response;
  }, function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject("Internal Server Error.");
  });
};

export default async function axiosWrapper(method, url, data) {
  return appApiAxios({
    method: method,
    url: url,
    responseType: 'json',
    data: data
  });
}