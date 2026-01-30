import axiosWrapper from "./wrapper";

export function search(payload) {
  const response = axiosWrapper(
    "post",
    '/api/participant/search',
    payload
  );
  return response;
}

export function searchMe(payload) {
  const response = axiosWrapper(
    "post",
    '/api/participant/searchMe',
    payload
  );
  return response;
}

// export function register(payload) {
//   const response = axiosWrapper(
//     "post",
//     '/api/participant/register',
//     payload
//   );
//   return response;
// }

// export function create(payload) {
//   const response = axiosWrapper(
//     "post",
//     '/api/eventRegistration/create',
//     payload
//   );
//   return response;
// }

// export function modify(payload) {
//   const response = axiosWrapper(
//     "post",
//     '/api/eventRegistration/modify',
//     payload
//   );
//   return response;
// }

export function get(payload) {
  const response = axiosWrapper(
    "post",
    '/api/participant/profile/get',
    payload
  );
  return response;
}

export function save(payload) {
  const response = axiosWrapper(
    "post",
    '/api/participant/profile/save',
    payload
  );
  return response;
}