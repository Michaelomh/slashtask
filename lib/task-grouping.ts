import { Task } from '@/lib/task';
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
  if (isToday(date)) {
    relative = 'Today · ';
  } else if (isTomorrow(date)) {
    relative = 'Tomorrow · ';
  }

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

/**
 * Splits a flat task list into top-level parents and a map of parentId ->
 * subtasks. Both lists are sorted by `(order, created_at)`. Subtasks whose
 * parent isn't in the list are returned as orphans for flat rendering.
 */
export function groupTasksByParent(tasks: Task[]): {
  parents: Task[];
  subsByParent: Map<string, Task[]>;
  orphanSubs: Task[];
} {
  const sortFn = (a: Task, b: Task) =>
    a.order !== b.order
      ? a.order - b.order
      : a.created_at.localeCompare(b.created_at);

  const parentIds = new Set(
    tasks.filter((t) => !t.parent_task_id).map((t) => t.id)
  );
  const parents: Task[] = [];
  const subsByParent = new Map<string, Task[]>();
  const orphanSubs: Task[] = [];

  for (const t of tasks) {
    if (!t.parent_task_id) {
      parents.push(t);
    } else if (parentIds.has(t.parent_task_id)) {
      const arr = subsByParent.get(t.parent_task_id) ?? [];
      arr.push(t);
      subsByParent.set(t.parent_task_id, arr);
    } else {
      orphanSubs.push(t);
    }
  }

  parents.sort(sortFn);
  for (const arr of subsByParent.values()) arr.sort(sortFn);
  orphanSubs.sort(sortFn);

  return { parents, subsByParent, orphanSubs };
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
