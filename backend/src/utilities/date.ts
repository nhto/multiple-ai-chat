import moment from "moment-timezone";

function toLocalDate(date: Date): string {
  return moment(date).tz('Asia/Hong_Kong').format('YYYY-MM-DD');
}

function toLocalDateTime(date: Date): string {
  return moment(date).tz('Asia/Hong_Kong').format('YYYY-MM-DD HH:mm:ss');
}

function parseLocalDate(dateString: string): Date {
  if (!!dateString) {
    return moment(dateString, 'YYYY-MM-DD').toDate();
  }
  else {
    return null;
  }
}

function parseLocalDateTime(dateString: string): Date {
  if (!!dateString) {
    return moment(dateString, 'YYYY-MM-DD HH:mm:ss').toDate();
  }
  else {
    return null;
  }

}

function parseIsoDateTime(dateString: string): Date {
  if (!dateString) {
    return null;
  }
  const date = moment(dateString, 'YYYY-MM-DDTHH:mm:ss.SSSZ', true);
  if (date.isValid()) {
    return date.toDate();
  }
  else {
    return null;
  }
}

export { toLocalDate, toLocalDateTime, parseLocalDate, parseLocalDateTime, parseIsoDateTime };