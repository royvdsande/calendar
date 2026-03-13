import { addDays, endOfMonth, endOfWeek, format, isSameDay, startOfMonth, startOfWeek } from "date-fns";

import { Card } from "@/components/ui/card";

type Event = {
  id: string;
  title: string;
  start: string;
  source: "APP" | "GOOGLE";
};

export function CalendarView({ events }: { events: Event[] }) {
  const start = startOfWeek(startOfMonth(new Date()), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(new Date()), { weekStartsOn: 1 });

  const days: Date[] = [];
  let day = start;
  while (day <= end) {
    days.push(day);
    day = addDays(day, 1);
  }

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{format(new Date(), "MMMM yyyy")}</h2>
        <div className="text-xs text-gray-500">Blue = App tasks/events · Green = Google</div>
      </div>
      <div className="grid grid-cols-7 gap-2 text-xs text-gray-500">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <p key={d}>{d}</p>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-2">
        {days.map((d) => {
          const dayEvents = events.filter((event) => isSameDay(new Date(event.start), d));
          return (
            <div key={d.toISOString()} className="min-h-24 rounded-md border border-border p-2">
              <p className="mb-1 text-xs font-medium">{format(d, "d")}</p>
              <div className="space-y-1">
                {dayEvents.slice(0, 2).map((event) => (
                  <p
                    key={event.id}
                    className={`truncate rounded px-1 py-0.5 text-[10px] ${
                      event.source === "GOOGLE"
                        ? "bg-green-500/10 text-green-600"
                        : "bg-blue-500/10 text-blue-600"
                    }`}
                  >
                    {event.title}
                  </p>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
