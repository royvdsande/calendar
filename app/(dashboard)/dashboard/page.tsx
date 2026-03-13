export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";

import { CalendarView } from "@/components/dashboard/calendar-view";
import { SyncPanel } from "@/components/dashboard/sync-panel";
import { TaskBoard } from "@/components/dashboard/task-board";
import { Card } from "@/components/ui/card";
import { authOptions } from "@/lib/auth";
import { demoEvents, demoTasks } from "@/lib/demo-data";
import { prisma } from "@/lib/prisma";

type DashboardPageProps = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  let session = null;

  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    console.error("Failed to load session in dashboard page", error);
  }

  const tab = (await searchParams).tab || "overview";
  const userId = session?.user?.id || null;
  const isGuest = !userId;

  let tasks: {
    id: string;
    title: string;
    dueDate: Date | null;
    completed: boolean;
    tag: string | null;
  }[] = [];
  let events: {
    id: string;
    title: string;
    start: Date;
    source: "APP" | "GOOGLE";
  }[] = [];
  let dataUnavailable = false;

  if (isGuest) {
    tasks = demoTasks.map((task) => ({
      ...task,
      dueDate: task.dueDate ? new Date(task.dueDate) : null
    }));
    events = demoEvents.map((event) => ({
      ...event,
      start: new Date(event.start)
    }));
  } else if (!prisma) {
    dataUnavailable = true;
  } else {
    try {
      const [taskRows, eventRows] = await Promise.all([
        prisma.task.findMany({ where: { userId }, orderBy: { order: "asc" } }),
        prisma.calendarEvent.findMany({ where: { userId }, orderBy: { start: "asc" } })
      ]);

      tasks = taskRows;
      events = eventRows;
    } catch (error) {
      dataUnavailable = true;
      console.error("Failed to load dashboard data", error);
    }
  }

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

  const showSummary = tab === "overview";
  const showCalendar = tab === "overview" || tab === "calendar";
  const showTasks = tab === "overview" || tab === "tasks";
  const showSync = tab === "overview" || tab === "sync";

  return (
    <div className="space-y-6">
      {isGuest && (
        <Card>
          <p className="text-sm text-amber-600">
            Je bekijkt nu een preview van dashboard + calendar. Log in om je eigen data te zien en alles te bewerken.
          </p>
        </Card>
      )}

      {dataUnavailable && (
        <Card>
          <p className="text-sm text-amber-600">
            We konden je data nu niet laden. De UI blijft beschikbaar, maar controleer je database- en auth-instellingen.
          </p>
        </Card>
      )}

      {showSummary && (
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
      )}

      {showSync && <SyncPanel readOnly={isGuest} />}

      {showCalendar && <CalendarView events={calendarItems} fullScreen={tab === "calendar"} />}

      {showTasks && (
        <TaskBoard
          readOnly={isGuest}
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
