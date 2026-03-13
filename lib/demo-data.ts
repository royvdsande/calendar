export const demoTasks = [
  {
    id: "demo-task-1",
    title: "Plan je week",
    dueDate: new Date().toISOString(),
    completed: false,
    tag: "planning"
  },
  {
    id: "demo-task-2",
    title: "Werk 30 min aan je belangrijkste taak",
    dueDate: null,
    completed: false,
    tag: "focus"
  },
  {
    id: "demo-task-3",
    title: "Review van vandaag",
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    completed: true,
    tag: "review"
  }
];

export const demoEvents = [
  {
    id: "demo-event-1",
    title: "Deep work blok",
    start: new Date().toISOString(),
    source: "APP" as const
  },
  {
    id: "demo-event-2",
    title: "Team stand-up",
    start: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    source: "GOOGLE" as const
  }
];
