import { type Task } from '@/lib/types';
import { format, isPast, isToday, isTomorrow, startOfDay } from 'date-fns';

export type TaskGroup = {
  date: string; // YYYY-MM-DD
  tasks: Task[];
};

export function formatDateHeading(dateStr: string): {
  label: string;
  isOverdue: boolean;
} {
  const date = new Date(dateStr + 'T00:00:00');
  const overdue = isPast(startOfDay(date)) && !isToday(date);

  let relative = '';
  if (isToday(date)) relative = 'Today · ';
  else if (isTomorrow(date)) relative = 'Tomorrow · ';

  const label = `${format(date, 'd MMM')} · ${relative}${format(date, 'EEEE')}`;
  return { label, isOverdue: overdue };
}

/** Generates a group for every calendar day in [start, end], merging tasks in. */
export function buildDateGroups(
  tasks: Task[],
  start: Date,
  end: Date
): TaskGroup[] {
  const map = new Map<string, Task[]>();
  for (const task of tasks) {
    if (!task.due_date || task.is_completed) continue;
    const existing = map.get(task.due_date) ?? [];
    map.set(task.due_date, [...existing, task]);
  }

  const groups: TaskGroup[] = [];
  const cursor = startOfDay(new Date(start));
  const endDay = startOfDay(new Date(end));

  while (cursor <= endDay) {
    const dateStr = format(cursor, 'yyyy-MM-dd');
    groups.push({ date: dateStr, tasks: map.get(dateStr) ?? [] });
    cursor.setDate(cursor.getDate() + 1);
  }

  return groups;
}

/** Groups tasks by date for project pages (no date range required). */
export function groupTasksByDate(tasks: Task[]): TaskGroup[] {
  const map = new Map<string, Task[]>();
  for (const task of tasks) {
    if (!task.due_date || task.is_completed) continue;
    const existing = map.get(task.due_date) ?? [];
    map.set(task.due_date, [...existing, task]);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, tasks]) => ({ date, tasks }));
}
