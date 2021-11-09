import moment from 'moment';
import { _Neo4jDateTime } from 'types/graphql-apollo-v2';
import dayjs from 'dayjs';
import calendar from 'dayjs/plugin/calendar';

dayjs.extend(calendar);

const DATE_FORMAT = 'DD.MM.YYYY';
const TIME_FORMAT = 'HH:mm:ss';

export const UTCToLocalDateTime = (utc: string) => {
  const dateString = new Date(utc);

  const localDate = `${padZero(dateString.getDate())}/${padZero(
    dateString.getMonth() + 1
  )}/${dateString.getFullYear().toString()},`;

  const localTime = `${padZero(dateString.getHours())}:${padZero(
    dateString.getMinutes()
  )}:${padZero(dateString.getSeconds())}`;
  return `${localDate} ${localTime}`;
};

function padZero(i: number) {
  return i.toString().padStart(2, '0');
}

const calendarDatetime = (dt: moment.Moment, timeFormatOverride?: string) =>
  moment(dt).calendar({
    sameDay: `[Today] ${timeFormatOverride || TIME_FORMAT}`,
    lastDay: `[Yesterday] ${timeFormatOverride || TIME_FORMAT}`,
    lastWeek: `${DATE_FORMAT} ${timeFormatOverride || TIME_FORMAT}`,
    sameElse: `${DATE_FORMAT} ${timeFormatOverride || TIME_FORMAT}`,
  });

export const formatEpocTime = (epoch: number, timeFormatOverride?: string) =>
  calendarDatetime(moment(epoch), timeFormatOverride);

export const formatCalendarDate = (date: _Neo4jDateTime) =>
  date && date.formatted ? calendarDatetime(moment(date.formatted)) : '';

export const convertNeo4jDateToJSDate = (dt: _Neo4jDateTime) => {
  const date = new Date(
    dt.year || 0,
    dt.month || 0,
    dt.day || 0,
    dt.hour || 0,
    dt.minute || 0
  );
  date.setHours(date.getHours() + 2);
  return date;
};

export const formatDateRecentTime = (dt: _Neo4jDateTime | undefined) => {
  if (!dt || !dt.year) return '-';
  return dayjs(convertNeo4jDateToJSDate(dt)).calendar(undefined, {
    sameDay: '[Today,] HH:mm',
    lastDay: '[Yesterday,] HH:mm',
    lastWeek: '[Last] dddd[,] HH:mm',
    sameElse: 'DD/MM/YYYY[,] HH:mm',
  });
};

export const compareNeo4jDates = (
  dt1: _Neo4jDateTime | undefined,
  dt2: _Neo4jDateTime | undefined
) => {
  const date1 = dt1 && convertNeo4jDateToJSDate(dt1);
  const date2 = dt2 && convertNeo4jDateToJSDate(dt2);
  return dayjs(date1) < dayjs(date2);
};

export const canUserUpdatePopulationSchedules = (auth: {
  apiKey: string | undefined;
  token: string | undefined;
  tenant: string | undefined;
}) =>
  auth.apiKey! === auth.token! ||
  auth.tenant! === 'integral-test' ||
  auth.tenant! === 'integral';
