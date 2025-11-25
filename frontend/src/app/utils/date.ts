// utils/date.ts
import { startOfWeek, addDays, setHours, setMinutes } from 'date-fns';

export const WEEK_START_HOUR = 8;
export const WEEK_END_HOUR   = 17;

/* día de la semana (0 = domingo) -> Date real de esta semana */
export function thisWeekDay(day: 0|1|2|3|4|5|6, h: number, m = 0): Date {
  const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
  return setMinutes(setHours(addDays(monday, day), h), m);
}