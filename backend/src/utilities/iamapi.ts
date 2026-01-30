import axios, { AxiosRequestConfig, AxiosPromise } from 'axios';
import * as config from './config';
import { User } from '../models/model';
import { ApiError } from '../models/error';

const baseAxiosRequest: AxiosRequestConfig<any> = {
  headers: {
    'Content-Type': 'application/json',
  },
  auth: {
    username: config.IAMAPI_USERNAME,
    password: config.IAMAPI_PASSWORD,
  },
};

async function getIamDetailsByNetId(netId: string): Promise<any> {
  if (!netId) {
    throw new ApiError(`Missing NetID`);
  }

  const netIdResult = await axios({
    ...baseAxiosRequest,
    method: 'post',
    url: `${config.IAMAPI_BASEURL}/manage-netid/netid/${netId}`,
    data: ''
  });

  if (!netIdResult?.data?.success) {
    throw new ApiError(`User not found: ${netId}`);
  }

  if (!netIdResult?.data?.data) {
    throw new ApiError(`User not found: ${netId}`);
  }

  return netIdResult?.data?.data;
}

async function getUserDetailsByNetId(netId: string): Promise<User> {

  if (!netId) {
    throw new ApiError(`Missing NetID`);
  }

  const netIdResult = await axios({
    ...baseAxiosRequest,
    method: 'post',
    url: `${config.IAMAPI_BASEURL}/manage-netid/netid/${netId}`,
    data: ''
  });

  if (!netIdResult?.data?.success) {
    throw new ApiError(`User not found: ${netId}`);
  }

  if (!netIdResult?.data?.data) {
    throw new ApiError(`User not found: ${netId}`);
  }

  const userResult = await axios({
    ...baseAxiosRequest,
    method: 'post',
    url: `${config.IAMAPI_BASEURL}/manage-user/search?netid=${netId}`,
    data: ''
  });

  if (!userResult?.data?.success) {
    throw new ApiError(`User not found: ${netId}`);
  }

  if (!Array.isArray(userResult?.data?.data)) {
    throw new ApiError(`User not found: ${netId}`);
  }

  const studentRecords: any[] = userResult.data.data.filter((u: any) => u.userType === 'Student' && u.status === "ACTIVE");
  const staffRecords: any[] = userResult.data.data.filter((u: any) => u.userType === 'Staff' && u.status === "ACTIVE");
  const otherRecords: any[] = userResult.data.data.filter((u: any) => u.userType !== 'Staff' && u.userType !== 'Student' && u.status === "ACTIVE");

  const userRecords = studentRecords.concat(staffRecords).concat(otherRecords);

  if (userRecords.length < 0) {
    throw new ApiError(`User not found: ${netId}`);
  }

  return {
    userType: userRecords[0].userType,
    userId: userRecords[0].userId,
    netId: netIdResult?.data?.data.netid,
    displayName: netIdResult?.data?.data.displayName,
    fullName: netIdResult?.data?.data.fullName,
    surname: netIdResult?.data?.data.surname,
    givenName: netIdResult?.data?.data.givenName,
    deptAbbr: netIdResult?.data?.data.department,
    email: netIdResult?.data?.data.email
  };
}


async function getUserDetailsByUserId(userId: string): Promise<User> {

  if (!userId) {
    throw new ApiError(`Missing User ID`);
  }

  const userResult = await axios({
    ...baseAxiosRequest,
    method: 'post',
    url: `${config.IAMAPI_BASEURL}/manage-user/search?userId=${userId}`,
    data: ''
  });

  if (!userResult?.data?.success) {
    throw new ApiError(`User not found: ${userId}`);
  }

  if (!userResult?.data?.data) {
    throw new ApiError(`User not found: ${userId}`);
  }

  if (!Array.isArray(userResult?.data?.data)) {
    throw new ApiError(`User not found: ${userId}`);
  }

  const users: any[] = userResult?.data.data;

  const userWithNetId = users.filter(u => u.status === "ACTIVE" && !!u.netid)[0];
  const userWithoutNetId = users.filter(u => u.status === "ACTIVE" && !u.netid)[0];

  if (!!userWithNetId) {
    return await getUserDetailsByNetId(userWithNetId?.netid);
  }

  if (!!userWithoutNetId) {
    return {
      userType: userWithoutNetId?.userType,
      userId: userWithoutNetId?.userId,
      netId: null,
      displayName: null,
      fullName: userWithoutNetId?.fullName,
      surname: userWithoutNetId?.surname,
      givenName: userWithoutNetId?.givenName,
      deptAbbr: userWithoutNetId?.department,
      postTitle: userWithoutNetId?.postTitle,
      email: null,
    };
  }

  else {
    throw new ApiError(`User not found: ${userId}`);
  }


}

export { getIamDetailsByNetId, getUserDetailsByNetId, getUserDetailsByUserId }