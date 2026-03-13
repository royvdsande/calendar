import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  if (!prisma) {
    return NextResponse.json({ error: "Database unavailable", events: [] }, { status: 503 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [events, tasks] = await Promise.all([
    prisma.calendarEvent.findMany({ where: { userId: session.user.id } }),
    prisma.task.findMany({ where: { userId: session.user.id, dueDate: { not: null } } })
  ]);

  return NextResponse.json({
    events: [
      ...events.map((event) => ({
        id: event.id,
        title: event.title,
        start: event.start,
        source: event.source
      })),
      ...tasks.map((task) => ({
        id: task.id,
        title: `Task: ${task.title}`,
        start: task.dueDate,
        source: "APP"
      }))
    ]
  });
}
