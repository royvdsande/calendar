import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8)
});

export const taskSchema = z.object({
  title: z.string().min(1),
  dueDate: z.string().optional(),
  tag: z.string().optional()
});

export const taskUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  completed: z.boolean().optional(),
  dueDate: z.string().nullable().optional(),
  tag: z.string().nullable().optional(),
  order: z.number().int().nonnegative().optional()
});
