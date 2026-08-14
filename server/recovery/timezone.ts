export function isValidTimeZone(timezone: string) {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

export function getLocalDateKey(timezone: string, instant = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(instant);

  const valueFor = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find(part => part.type === type)?.value;
  const year = valueFor("year");
  const month = valueFor("month");
  const day = valueFor("day");

  if (!year || !month || !day)
    throw new Error("Unable to derive the user’s local date");
  return `${year}-${month}-${day}`;
}

export function localDateToDatabaseDate(localDate: string) {
  return new Date(`${localDate}T00:00:00.000Z`);
}

export function shiftLocalDate(localDate: string, days: number) {
  const [year, month, day] = localDate.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day + days));
  return shifted.toISOString().slice(0, 10);
}
