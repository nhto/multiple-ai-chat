import axiosWrapper from "./wrapper";

export function search(payload) {
  const response = axiosWrapper("post", '/api/eventRegistration/search', payload);
  return response;
}

export function register(payload) {
  const response = axiosWrapper(
    "post",
    '/api/eventRegistration/register',
    payload
  );
  return response;
}

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