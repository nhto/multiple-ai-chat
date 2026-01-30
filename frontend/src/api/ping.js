import axiosWrapper from "./wrapper";

export function getPing() {
  const response = axiosWrapper(
    "get",
    '/api/ping'
  );
  return response;
}