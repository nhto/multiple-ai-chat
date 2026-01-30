import axiosWrapper from "./wrapper";

export function start({participantId, eventId, paymentRefId}) {
  const response = axiosWrapper(
    "post",
    `/olpp/start`,
    {
      participantId: participantId,
      eventId: eventId,
      paymentRefId: paymentRefId,
      callbackurl: window.location.origin + `/olpp-callback/payment?id=${participantId}&eventid=${eventId}&refid=${paymentRefId}`,
      failedcallbackurl: window.location.origin + `/payment?id=${participantId}&eventid=${eventId}&refid=${paymentRefId}&callback=true`
    }
  );
  return response;
}

export function getStatus({participantId, eventId, paymentRefId}) {
  const response = axiosWrapper(
    "post",
    `/olpp/status/get`,
    {
      participantId: participantId,
      eventId: eventId,
      paymentRefId: paymentRefId,
    }
  );
  return response;
}