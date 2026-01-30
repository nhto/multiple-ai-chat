import axiosWrapper from "./wrapper";

export function search(payload) {
  const response = axiosWrapper(
    "post",
    '/api/event/search',
    payload
  );
  return response;
}

export function searchEventName(payload) {
  const response = axiosWrapper(
    "post",
    '/api/event/searchEventName',
    payload
  );
  return response;
}

export function create({eventDateTime}) {
  const response = axiosWrapper(
    "post",
    '/api/event/create',
    {
      eventDateTime
    }
  );
  return response;
}


export function setRoster({eventId, deptAbbrs}) {
  const response = axiosWrapper(
    "post",
    `/api/event/${eventId}/set-roster`,
    {
      deptAbbrs
    }
  );
  return response;
}

export function setDateTime({eventId, eventDateTime}) {
  const response = axiosWrapper(
    "post",
    `/api/event/${eventId}/set-eventDateTime`,
    {
      eventDateTime
    }
  );
  return response;
}

