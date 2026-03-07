import { google } from "googleapis";

const TIMEZONE = "Europe/Warsaw";

function getCalendarClient() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/calendar.events"],
  });
  return google.calendar({ version: "v3", auth });
}

export async function createCalendarEvent(event: {
  name: string;
  description?: string | null;
  location: string;
  date: string;
  end_date?: string | null;
}): Promise<string | null> {
  if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_CALENDAR_ID) {
    console.warn("Google Calendar not configured, skipping sync");
    return null;
  }

  const calendar = getCalendarClient();
  const endDate =
    event.end_date ||
    new Date(new Date(event.date).getTime() + 2 * 3600000).toISOString();

  const response = await calendar.events.insert({
    calendarId: process.env.GOOGLE_CALENDAR_ID,
    requestBody: {
      summary: event.name,
      description: event.description || "",
      location: event.location,
      start: { dateTime: event.date, timeZone: TIMEZONE },
      end: { dateTime: endDate, timeZone: TIMEZONE },
    },
  });

  return response.data.id || null;
}

export function generateIcsContent(event: {
  name: string;
  description?: string | null;
  location: string;
  date: string;
  end_date?: string | null;
}): string {
  const formatDate = (iso: string) =>
    new Date(iso)
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");

  const start = formatDate(event.date);
  const endDate =
    event.end_date ||
    new Date(new Date(event.date).getTime() + 2 * 3600000).toISOString();
  const end = formatDate(endDate);

  const description = (event.description || "").replace(/\n/g, "\\n");
  const now = formatDate(new Date().toISOString());
  const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}@eventleadsystem.pl`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Event Lead System//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${event.name}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${event.location}`,
    `STATUS:CONFIRMED`,
    `TRANSP:OPAQUE`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}
