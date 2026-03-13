"use client";

import {
  addDays,
  addHours,
  addMonths,
  differenceInMinutes,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  setHours,
  setMinutes,
  startOfDay,
  startOfMonth,
  startOfToday,
  startOfWeek,
  subMonths
} from "date-fns";
import { ChevronLeft, ChevronRight, GripVertical } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

type EventInput = {
  id: string;
  title: string;
  start: string;
  source: "APP" | "GOOGLE";
};

type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  source: "APP" | "GOOGLE";
  description?: string;
  location?: string;
};

type ViewMode = "day" | "3days" | "week" | "month";

const HOUR_HEIGHT = 64;
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function getDaysForView(view: ViewMode, focusDate: Date) {
  if (view === "day") return [focusDate];
  if (view === "3days") return [focusDate, addDays(focusDate, 1), addDays(focusDate, 2)];
  if (view === "week") {
    const start = startOfWeek(focusDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }

  const start = startOfWeek(startOfMonth(focusDate), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(focusDate), { weekStartsOn: 1 });
  const days: Date[] = [];
  let day = start;
  while (day <= end) {
    days.push(day);
    day = addDays(day, 1);
  }
  return days;
}

export function CalendarView({
  events,
  fullScreen = false
}: {
  events: EventInput[];
  fullScreen?: boolean;
}) {
  const [view, setView] = useState<ViewMode>("week");
  const [focusDate, setFocusDate] = useState(startOfToday());
  const [draggedEventId, setDraggedEventId] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [eventItems, setEventItems] = useState<CalendarEvent[]>(() =>
    events.map((event) => {
      const start = new Date(event.start);
      return {
        id: event.id,
        title: event.title,
        source: event.source,
        start,
        end: addHours(start, 1),
        description: "",
        location: ""
      };
    })
  );
  const [draft, setDraft] = useState({ title: "", description: "", location: "" });

  const visibleDays = useMemo(() => getDaysForView(view, focusDate), [view, focusDate]);

  const selectedEvent = eventItems.find((event) => event.id === selectedEventId) || null;

  function navigate(direction: "prev" | "next") {
    if (view === "month") {
      setFocusDate((prev) => (direction === "next" ? addMonths(prev, 1) : subMonths(prev, 1)));
      return;
    }

    if (view === "week") {
      setFocusDate((prev) => addDays(prev, direction === "next" ? 7 : -7));
      return;
    }

    if (view === "3days") {
      setFocusDate((prev) => addDays(prev, direction === "next" ? 3 : -3));
      return;
    }

    setFocusDate((prev) => addDays(prev, direction === "next" ? 1 : -1));
  }

  function moveEventTo(eventId: string, nextStart: Date) {
    setEventItems((prev) =>
      prev.map((item) => {
        if (item.id !== eventId) return item;
        const duration = Math.max(30, differenceInMinutes(item.end, item.start));
        return {
          ...item,
          start: nextStart,
          end: new Date(nextStart.getTime() + duration * 60 * 1000)
        };
      })
    );
  }

  function onDropInTimeSlot(day: Date, hour: number) {
    if (!draggedEventId) return;
    const nextStart = setMinutes(setHours(startOfDay(day), hour), 0);
    moveEventTo(draggedEventId, nextStart);
    setDraggedEventId(null);
  }

  function onDropInMonth(day: Date) {
    if (!draggedEventId) return;
    const draggedEvent = eventItems.find((event) => event.id === draggedEventId);
    const preserveHour = draggedEvent ? draggedEvent.start.getHours() : 9;
    const nextStart = setMinutes(setHours(startOfDay(day), preserveHour), 0);
    moveEventTo(draggedEventId, nextStart);
    setDraggedEventId(null);
  }

  function openDetails(event: CalendarEvent) {
    setSelectedEventId(event.id);
    setEditing(false);
    setDraft({
      title: event.title,
      description: event.description || "",
      location: event.location || ""
    });
  }

  function saveDetails() {
    if (!selectedEventId) return;
    setEventItems((prev) =>
      prev.map((event) =>
        event.id === selectedEventId
          ? {
              ...event,
              title: draft.title.trim() || event.title,
              description: draft.description,
              location: draft.location
            }
          : event
      )
    );
    setEditing(false);
  }

  return (
    <div
      className={`overflow-hidden rounded-xl border border-border bg-background ${
        fullScreen ? "h-[calc(100vh-8.5rem)]" : "min-h-[70vh]"
      }`}
    >
      <div className="flex h-12 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="px-2" onClick={() => navigate("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" className="px-2" onClick={() => navigate("next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => setFocusDate(startOfToday())}>
            Vandaag
          </Button>
          <p className="text-sm font-medium">{format(focusDate, view === "month" ? "MMMM yyyy" : "MMMM d, yyyy")}</p>
        </div>
        <div className="flex gap-2">
          {([
            { key: "day", label: "1 dag" },
            { key: "3days", label: "3 dagen" },
            { key: "week", label: "Week" },
            { key: "month", label: "Maand" }
          ] as const).map((mode) => (
            <Button
              key={mode.key}
              variant={view === mode.key ? "default" : "outline"}
              onClick={() => setView(mode.key)}
            >
              {mode.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex h-[calc(100%-3rem)]">
        <aside className="hidden w-64 border-r border-border p-4 md:block">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Menu</p>
          <div className="space-y-2 text-sm">
            <p className="rounded-md bg-accent px-2 py-1">Mijn agenda</p>
            <p className="rounded-md px-2 py-1">Taken</p>
            <p className="rounded-md px-2 py-1">Google Calendar</p>
          </div>
          <div className="mt-5 rounded-lg border border-border p-3">
            <p className="mb-2 text-xs font-semibold text-muted-foreground">Mini maand</p>
            <p className="text-sm font-medium">{format(focusDate, "MMMM yyyy")}</p>
            <p className="mt-2 text-xs text-muted-foreground">Sleep events naar een andere dag of tijd.</p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1">
          <div className="flex-1 overflow-auto">
            {view === "month" ? (
              <div className="grid h-full grid-cols-7 grid-rows-[auto_1fr]">
                {["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"].map((label) => (
                  <div key={label} className="border-b border-r border-border px-2 py-2 text-xs font-semibold text-muted-foreground">
                    {label}
                  </div>
                ))}

                <div className="col-span-7 grid grid-cols-7">
                  {visibleDays.map((day) => {
                    const dayEvents = eventItems
                      .filter((event) => isSameDay(event.start, day))
                      .sort((a, b) => a.start.getTime() - b.start.getTime());

                    return (
                      <div
                        key={day.toISOString()}
                        className={`min-h-32 border-b border-r border-border p-2 ${
                          isSameMonth(day, focusDate) ? "" : "bg-muted/20"
                        }`}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={() => onDropInMonth(day)}
                      >
                        <p className="mb-2 text-xs font-semibold">{format(day, "d")}</p>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 4).map((event) => (
                            <button
                              key={event.id}
                              draggable
                              onDragStart={() => setDraggedEventId(event.id)}
                              onClick={() => openDetails(event)}
                              className={`w-full truncate rounded px-2 py-1 text-left text-xs ${
                                event.source === "GOOGLE"
                                  ? "bg-green-500/10 text-green-700"
                                  : "bg-blue-500/10 text-blue-700"
                              }`}
                            >
                              {format(event.start, "HH:mm")} {event.title}
                            </button>
                          ))}
                          {dayEvents.length > 4 && (
                            <p className="text-[11px] text-muted-foreground">+{dayEvents.length - 4} meer</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="min-w-[700px]">
                <div
                  className="sticky top-0 z-10 grid border-b border-border bg-background"
                  style={{ gridTemplateColumns: `80px repeat(${visibleDays.length}, minmax(0, 1fr))` }}
                >
                  <div className="border-r border-border p-2 text-xs text-muted-foreground">Tijd</div>
                  {visibleDays.map((day) => (
                    <div key={day.toISOString()} className="border-r border-border p-2 text-center text-sm font-medium last:border-r-0">
                      {format(day, "EEE d MMM")}
                    </div>
                  ))}
                </div>

                <div
                  className="grid"
                  style={{ gridTemplateColumns: `80px repeat(${visibleDays.length}, minmax(0, 1fr))` }}
                >
                  <div className="border-r border-border">
                    {HOURS.map((hour) => (
                      <div key={hour} className="h-16 border-b border-border/60 pr-2 pt-1 text-right text-xs text-muted-foreground">
                        {format(setHours(startOfToday(), hour), "HH:mm")}
                      </div>
                    ))}
                  </div>

                  {visibleDays.map((day) => {
                    const dayEvents = eventItems.filter((event) => isSameDay(event.start, day));
                    return (
                      <div key={day.toISOString()} className="relative border-r border-border last:border-r-0" style={{ height: HOURS.length * HOUR_HEIGHT }}>
                        {HOURS.map((hour) => (
                          <div
                            key={`${day.toISOString()}-${hour}`}
                            className="h-16 border-b border-border/60"
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={() => onDropInTimeSlot(day, hour)}
                          />
                        ))}

                        {dayEvents.map((event) => {
                          const top = (event.start.getHours() + event.start.getMinutes() / 60) * HOUR_HEIGHT;
                          const duration = Math.max(30, differenceInMinutes(event.end, event.start));
                          const height = Math.max(26, (duration / 60) * HOUR_HEIGHT);

                          return (
                            <button
                              key={event.id}
                              draggable
                              onDragStart={() => setDraggedEventId(event.id)}
                              onClick={() => openDetails(event)}
                              className={`absolute left-1 right-1 rounded-md border px-2 py-1 text-left text-xs shadow-sm ${
                                event.source === "GOOGLE"
                                  ? "border-green-500/30 bg-green-500/10 text-green-700"
                                  : "border-blue-500/30 bg-blue-500/10 text-blue-700"
                              }`}
                              style={{ top, height }}
                            >
                              <div className="mb-1 flex items-center gap-1 text-[10px] opacity-70">
                                <GripVertical className="h-3 w-3" />
                                {format(event.start, "HH:mm")}
                              </div>
                              <p className="truncate font-medium">{event.title}</p>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <aside className="hidden w-80 border-l border-border p-4 lg:block">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Event details</p>
            {!selectedEvent ? (
              <p className="text-sm text-muted-foreground">Klik op een event om details te bekijken of te bewerken.</p>
            ) : (
              <div className="space-y-3 text-sm">
                {editing ? (
                  <>
                    <input
                      className="w-full rounded border border-border bg-background px-2 py-1"
                      value={draft.title}
                      onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
                      placeholder="Titel"
                    />
                    <input
                      className="w-full rounded border border-border bg-background px-2 py-1"
                      value={draft.location}
                      onChange={(event) => setDraft((prev) => ({ ...prev, location: event.target.value }))}
                      placeholder="Locatie"
                    />
                    <textarea
                      className="min-h-20 w-full rounded border border-border bg-background px-2 py-1"
                      value={draft.description}
                      onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
                      placeholder="Beschrijving"
                    />
                    <div className="flex gap-2">
                      <Button onClick={saveDetails}>Opslaan</Button>
                      <Button variant="outline" onClick={() => setEditing(false)}>
                        Annuleren
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-base font-semibold">{selectedEvent.title}</h3>
                    <p className="text-muted-foreground">
                      {format(selectedEvent.start, "EEEE d MMMM, HH:mm")} - {format(selectedEvent.end, "HH:mm")}
                    </p>
                    <p className="text-muted-foreground">Locatie: {selectedEvent.location || "—"}</p>
                    <p className="text-muted-foreground">{selectedEvent.description || "Geen extra beschrijving"}</p>
                    <Button onClick={() => setEditing(true)}>Details aanpassen</Button>
                  </>
                )}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
