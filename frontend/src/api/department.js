import axiosWrapper from "./wrapper";

export function list() {
  const response = axiosWrapper(
    "get",
    '/api/department'
  );
  return response
}

export function get({deptAbbr}) {
  const response = axiosWrapper(
    "get",
    `/api/department/${deptAbbr}`
  );
  return response
}

export function setQuota({deptAbbr, staffQuota, studentQuota}) {
  const response = axiosWrapper(
    "post",
    `/api/department/${deptAbbr}/set-quota`,
    {
      staffQuota: staffQuota,
      studentQuota: studentQuota
    }
  );
  return response
}
