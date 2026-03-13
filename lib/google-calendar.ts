export type GoogleEvent = {
  id: string;
  summary?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
};

export async function fetchGoogleCalendarEvents(accessToken: string) {
  const res = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events?singleEvents=true&orderBy=startTime&maxResults=100",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      cache: "no-store"
    }
  );

  if (!res.ok) throw new Error("Failed to fetch Google Calendar events");

  const data = (await res.json()) as { items: GoogleEvent[] };
  return data.items ?? [];
}
