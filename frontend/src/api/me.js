import axiosWrapper from "./wrapper";

export function getMe() {
  const response = axiosWrapper(
    "get",
    '/api/me'
  );
  return response;
}