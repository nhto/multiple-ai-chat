import axiosWrapper from "./wrapper";

export function search({eventId, netId, userType, userId, deptAbbr, status, pageSize, pageNum}) {
  const response = axiosWrapper(
    "post",
    '/api/attendance/search',
    {
      eventId,
      netId,
      userType,
      userId,
      deptAbbr,
      status,
      pageSize,
      pageNum,
    }
  );
  return response;
}

export function register({eventId, netIds, deptAbbr}) {
  const response = axiosWrapper(
    "post",
    '/api/attendance/register',
    {
      eventId,
      netIds,
      deptAbbr,
    }
  );
  return response;
}

export function unregister({eventId, netIds}) {
  const response = axiosWrapper(
    "post",
    '/api/attendance/unregister',
    {
      eventId,
      netIds,
    }
  );
  return response;
}

export function attend({eventId, userIds}) {
  const response = axiosWrapper(
    "post",
    '/api/attendance/attend',
    {
      eventId,
      userIds,
    }
  );
  return response;
}