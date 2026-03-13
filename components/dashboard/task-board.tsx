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
};

function SortableTask({ task, onToggle, onDelete }: { task: Task; onToggle: (id: string) => void; onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className="mb-2 flex items-center justify-between">
        <div>
          <p className={task.completed ? "line-through opacity-60" : ""}>{task.title}</p>
          {task.dueDate && <p className="text-xs text-gray-500">Due {new Date(task.dueDate).toDateString()}</p>}
        </div>
        <div className="space-x-2">
          <Button variant="ghost" onClick={() => onToggle(task.id)}>
            {task.completed ? "Undo" : "Done"}
          </Button>
          <Button variant="ghost" onClick={() => onDelete(task.id)}>
            Delete
          </Button>
        </div>
      </Card>
    </div>
  );
}

export function TaskBoard({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  async function createTask() {
    if (!title.trim()) return;
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, dueDate: dueDate || undefined })
    });

    if (!res.ok) return toast.error("Could not create task");
    const task = await res.json();
    setTasks((prev) => [task, ...prev]);
    setTitle("");
    setDueDate("");
  }

  async function toggleTask(id: string) {
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
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (!res.ok) return toast.error("Delete failed");
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  async function onDragEnd(event: any) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);
    setTasks((prev) => arrayMove(prev, oldIndex, newIndex));
  }

  return (
    <div className="space-y-4">
      <Card>
        <p className="mb-3 text-sm font-medium">Create task</p>
        <div className="grid gap-2 md:grid-cols-3">
          <Input placeholder="e.g. Plan sprint" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          <Button onClick={createTask}>Add task</Button>
        </div>
      </Card>

      {tasks.length === 0 ? (
        <Card>
          <p className="text-sm text-gray-500">No tasks yet. Add your first action item.</p>
        </Card>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <SortableTask key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
            ))}
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
