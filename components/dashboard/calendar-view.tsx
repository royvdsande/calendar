"use client";

import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameWeek,
  isSameMonth,
  startOfMonth,
  startOfWeek
} from "date-fns";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Event = {
  id: string;
  title: string;
  start: string;
  source: "APP" | "GOOGLE";
};

type ViewMode = "day" | "week" | "month";

export function CalendarView({ events }: { events: Event[] }) {
  const [mode, setMode] = useState<ViewMode>("month");
  const currentDate = new Date();

  const days = useMemo(() => {
    if (mode === "day") return [currentDate];
    if (mode === "week") {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      return Array.from({ length: 7 }, (_, i) => addDays(start, i));
    }

    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
    const monthDays: Date[] = [];
    let day = start;
    while (day <= end) {
      monthDays.push(day);
      day = addDays(day, 1);
    }
    return monthDays;
  }, [mode]);

  return (
    <Card>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold">{format(new Date(), "MMMM yyyy")}</h2>
          <div className="text-xs text-gray-500">Blue = App tasks/events · Green = Google</div>
        </div>
        <div className="flex gap-2">
          {(["day", "week", "month"] as const).map((m) => (
            <Button key={m} variant={mode === m ? "default" : "outline"} onClick={() => setMode(m)}>
              {m[0].toUpperCase() + m.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className={`grid gap-2 ${mode === "day" ? "grid-cols-1" : "grid-cols-7"}`}>
        {days.map((d) => {
          const dayEvents = events.filter((event) => isSameDay(new Date(event.start), d));
          const faded = mode === "month" && !isSameMonth(d, currentDate);
          const highlightWeek = mode === "week" && isSameWeek(d, currentDate, { weekStartsOn: 1 });

          return (
            <div
              key={d.toISOString()}
              className={`min-h-24 rounded-md border border-border p-2 ${
                faded ? "opacity-50" : ""
              } ${highlightWeek ? "bg-accent/40" : ""}`}
            >
              <p className="mb-1 text-xs font-medium">{format(d, mode === "day" ? "EEEE, MMM d" : "d")}</p>
              <div className="space-y-1">
                {dayEvents.length === 0 ? (
                  <p className="text-[10px] text-muted-foreground">No items</p>
                ) : (
                  dayEvents.map((event) => (
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
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
