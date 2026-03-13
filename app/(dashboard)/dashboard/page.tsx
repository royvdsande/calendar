import { getServerSession } from "next-auth";

import { CalendarView } from "@/components/dashboard/calendar-view";
import { SyncPanel } from "@/components/dashboard/sync-panel";
import { TaskBoard } from "@/components/dashboard/task-board";
import { Card } from "@/components/ui/card";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type DashboardPageProps = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const tab = (await searchParams).tab || "overview";

  const [tasks, events] = await Promise.all([
    prisma.task.findMany({ where: { userId: session.user.id }, orderBy: { order: "asc" } }),
    prisma.calendarEvent.findMany({ where: { userId: session.user.id }, orderBy: { start: "asc" } })
  ]);

  const calendarItems = [
    ...events.map((event) => ({
      id: event.id,
      title: event.title,
      start: event.start.toISOString(),
      source: event.source as "APP" | "GOOGLE"
    })),
    ...tasks
      .filter((task) => task.dueDate)
      .map((task) => ({
        id: task.id,
        title: `Task: ${task.title}`,
        start: task.dueDate!.toISOString(),
        source: "APP" as const
      }))
  ];

  const showCalendar = tab === "overview" || tab === "calendar";
  const showTasks = tab === "overview" || tab === "tasks";
  const showSync = tab === "overview" || tab === "sync";

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

      {showSync && <SyncPanel />}

      {showCalendar && <CalendarView events={calendarItems} />}

      {showTasks && (
        <TaskBoard
          initialTasks={tasks.map((task) => ({
            id: task.id,
            title: task.title,
            dueDate: task.dueDate?.toISOString() || null,
            completed: task.completed,
            tag: task.tag
          }))}
        />
      )}
    </div>
  );
}
