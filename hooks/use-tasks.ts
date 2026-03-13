"use client";

import { useEffect, useState } from "react";

type Task = { id: string; title: string; completed: boolean };

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/events");
      if (res.ok) {
        const data = await res.json();
        const taskItems = data.events
          .filter((item: any) => String(item.title).startsWith("Task:"))
          .map((item: any) => ({ id: item.id, title: item.title.replace("Task: ", ""), completed: false }));
        setTasks(taskItems);
      }
      setLoading(false);
    }
    load();
  }, []);

  return { tasks, loading };
}
