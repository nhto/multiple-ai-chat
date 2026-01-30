import axiosWrapper from "./wrapper";

export function getRefresh() {
  const response = axiosWrapper(
    "get",
    '/api/refresh'
  );
  return response;
}