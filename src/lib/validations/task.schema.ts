import { z } from "zod"

export const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(300),
  description: z.string().max(2000).optional(),
  dueDate: z.coerce.date().optional(),
  assigneeId: z.string().optional(),
  eventId: z.string().optional(),
})

export const updateTaskSchema = z.object({
  taskId: z.string(),
  ...createTaskSchema.partial().shape,
})

export const toggleTaskDoneSchema = z.object({
  taskId: z.string(),
})

export const deleteTaskSchema = z.object({
  taskId: z.string(),
})

export const listTasksFilterSchema = z.object({
  isDone: z.boolean().optional(),
  eventId: z.string().optional(),
  assigneeId: z.string().optional(),
})
