import axiosWrapper from "./wrapper";

// TODO: rename payload.roleId to payload.roleLabel
export function search({roleLabel, netId, roleDeptAbbr, pageSize, pageNum}) {
  const response = axiosWrapper(
    "post",
    '/api/role/search',
    {
      roleLabel: roleLabel,
      netId: netId,
      roleDeptAbbr: roleDeptAbbr,
      pageSize, pageSize,
      pageNum, pageNum,
    }
  );
  return response;
}

// TODO: convert roleId to Label / ID
export function assign({roleLabel, netId, roleDeptAbbr}) {
  const response = axiosWrapper(
    "post",
    '/api/role/assign',
    {
      roleLabel: roleLabel,
      netId: netId,
      roleDeptAbbr: roleDeptAbbr,
    }
  );
  return response;
}

// TODO: revoke by id
export function revoke({roleLabel, netId, roleDeptAbbr}) {
  const response = axiosWrapper(
    "post",
    '/api/role/revoke',
    {
      roleLabel: roleLabel,
      netId: netId,
      roleDeptAbbr: roleDeptAbbr,
    }
  );
  return response;
}