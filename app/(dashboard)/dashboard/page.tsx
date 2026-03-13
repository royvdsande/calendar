import { getServerSession } from "next-auth";

import { CalendarView } from "@/components/dashboard/calendar-view";
import { TaskBoard } from "@/components/dashboard/task-board";
import { Card } from "@/components/ui/card";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const [tasks, events] = await Promise.all([
    prisma.task.findMany({ where: { userId: session.user.id }, orderBy: { order: "asc" } }),
    prisma.calendarEvent.findMany({ where: { userId: session.user.id }, orderBy: { start: "asc" } })
  ]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-gray-500">Total Tasks</p>
          <p className="text-2xl font-semibold">{tasks.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-semibold">{tasks.filter((t) => t.completed).length}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Upcoming Events</p>
          <p className="text-2xl font-semibold">{events.length}</p>
        </Card>
      </div>

      <CalendarView
        events={events.map((event) => ({
          id: event.id,
          title: event.title,
          start: event.start.toISOString(),
          source: event.source as "APP" | "GOOGLE"
        }))}
      />

      <TaskBoard
        initialTasks={tasks.map((task) => ({
          id: task.id,
          title: task.title,
          dueDate: task.dueDate?.toISOString() || null,
          completed: task.completed
        }))}
      />
    </div>
  );
}
