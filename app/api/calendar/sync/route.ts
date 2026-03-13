import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { fetchGoogleCalendarEvents } from "@/lib/google-calendar";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const account = await prisma.account.findFirst({
    where: { userId: session.user.id, provider: "google" }
  });

  if (!account?.access_token) {
    return NextResponse.json({ error: "Google account not connected" }, { status: 400 });
  }

  const items = await fetchGoogleCalendarEvents(account.access_token);

  await prisma.calendarEvent.deleteMany({
    where: { userId: session.user.id, source: "GOOGLE" }
  });

  if (items.length > 0) {
    await prisma.calendarEvent.createMany({
      data: items
        .filter((item) => item.start?.date || item.start?.dateTime)
        .map((item) => ({
          userId: session.user.id,
          title: item.summary || "Google event",
          start: new Date(item.start?.dateTime || item.start?.date || new Date().toISOString()),
          end: new Date(item.end?.dateTime || item.end?.date || new Date().toISOString()),
          source: "GOOGLE",
          externalId: item.id
        }))
    });
  }

  return NextResponse.json({ synced: items.length });
}
