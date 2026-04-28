import { isPast, startOfDay, addDays } from 'date-fns';

export type Task = {
  id: string;
  title: string;
  description: string | null;
  description_text: string | null;
  project_id: string | null;
  priority: 1 | 2 | 3 | 4;
  effort: 1 | 2 | 3 | 4;
  due_date: string | null; // YYYY-MM-DD
  is_completed: boolean;
  completed_at: string | null;
  order: number;
  is_deleted: boolean;
  parent_task_id: string | null;
  recurrence_rule: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  // computed
  sub_task_total?: number;
  sub_task_completed?: number;
};

/**
 * Returns true if the task's due date has passed and the task is not completed.
 * A task is considered overdue only after the end of its due date (i.e. the next day has started).
 *
 * @param task - the task to check
 * @param completed - current completed state (may differ from task.is_completed during optimistic updates)
 */
export function isTaskOverdue(task: Task, completed: boolean): boolean {
  if (!task.due_date || completed) return false;
  return isPast(startOfDay(addDays(new Date(task.due_date), 1)));
}

/**
 * Trims whitespace and truncates description text to 500 characters for database storage.
 *
 * @param text - raw description plain text
 */
export function truncateDescriptionText(text = ""): string {
  return text.trim().slice(0, 500);
}
