"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Task = {
  id: string;
  title: string;
  dueDate: string | null;
  completed: boolean;
  tag?: string | null;
};

function SortableTask({
  task,
  onToggle,
  onDelete,
  readOnly
}: {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  readOnly: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...(readOnly ? {} : listeners)}>
      <Card className="mb-2 flex items-center justify-between">
        <div>
          <p className={task.completed ? "line-through opacity-60" : ""}>{task.title}</p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {task.dueDate && <p>Due {new Date(task.dueDate).toDateString()}</p>}
            {task.tag && <p className="rounded bg-accent px-2 py-0.5 text-xs">#{task.tag}</p>}
          </div>
        </div>
        <div className="space-x-2">
          <Button variant="ghost" onClick={() => onToggle(task.id)} disabled={readOnly}>
            {task.completed ? "Undo" : "Done"}
          </Button>
          <Button variant="ghost" onClick={() => onDelete(task.id)} disabled={readOnly}>
            Delete
          </Button>
        </div>
      </Card>
    </div>
  );
}

export function TaskBoard({
  initialTasks,
  readOnly = false
}: {
  initialTasks: Task[];
  readOnly?: boolean;
}) {
  const [tasks, setTasks] = useState(initialTasks);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [tag, setTag] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  async function createTask() {
    if (readOnly) return toast("Log in om taken te beheren.");
    if (!title.trim()) return;
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, dueDate: dueDate || undefined, tag: tag || undefined })
    });

    if (!res.ok) return toast.error("Could not create task");
    const task = await res.json();
    setTasks((prev) => [task, ...prev]);
    setTitle("");
    setDueDate("");
    setTag("");
  }

  async function toggleTask(id: string) {
    if (readOnly) return toast("Log in om taken te beheren.");
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !task.completed })
    });
    if (!res.ok) return toast.error("Update failed");
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  }

  async function deleteTask(id: string) {
    if (readOnly) return toast("Log in om taken te beheren.");
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (!res.ok) return toast.error("Delete failed");
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  async function onDragEnd(event: any) {
    if (readOnly) return;

    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);
    const reordered = arrayMove(tasks, oldIndex, newIndex);
    setTasks(reordered);

    await Promise.all(
      reordered.map((task, index) =>
        fetch(`/api/tasks/${task.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: index + 1 })
        })
      )
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <p className="mb-3 text-sm font-medium">Create task</p>
        <div className="grid gap-2 md:grid-cols-4">
          <Input placeholder="e.g. Plan sprint" value={title} onChange={(e) => setTitle(e.target.value)} disabled={readOnly} />
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} disabled={readOnly} />
          <Input placeholder="Tag (optional)" value={tag} onChange={(e) => setTag(e.target.value)} disabled={readOnly} />
          <Button onClick={createTask} disabled={readOnly}>Add task</Button>
        </div>
        {readOnly && (
          <p className="mt-2 text-xs text-muted-foreground">Preview mode: log in om taken te maken, slepen of wijzigen.</p>
        )}
      </Card>

      {tasks.length === 0 ? (
        <Card>
          <p className="text-sm text-gray-500">No tasks yet. Add your first action item.</p>
        </Card>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <SortableTask key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} readOnly={readOnly} />
            ))}
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
