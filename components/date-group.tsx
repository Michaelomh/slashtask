import { type Task, type Project } from '@/lib/types';
import { format, isToday, isTomorrow, isPast, startOfDay, addDays } from 'date-fns';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { TaskItem } from './task-item';

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
export function buildDateGroups(tasks: Task[], start: Date, end: Date): TaskGroup[] {
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

/** Keep for backwards compat in project page (still task-only grouping). */
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

interface OverdueGroupProps {
  tasks: Task[];
  projects: Project[];
}

export function OverdueGroup({ tasks, projects }: OverdueGroupProps) {
  if (tasks.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-destructive text-sm font-semibold">Overdue</h2>
        <div className="bg-border h-px flex-1" />
      </div>

      <div className="flex flex-col">
        {tasks.map((task) => {
          const project = projects.find((p) => p.id === task.project_id) ?? null;
          return <TaskItem key={task.id} task={task} project={project} />;
        })}
      </div>
    </div>
  );
}

interface DateGroupProps {
  group: TaskGroup;
  projects: Project[];
}

export function DateGroup({ group, projects }: DateGroupProps) {
  const { label, isOverdue } = formatDateHeading(group.date);

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center gap-2">
        <h2
          className={`text-sm font-semibold ${isOverdue ? 'text-destructive' : 'text-foreground'}`}
        >
          {label}
        </h2>
        <div className="bg-border h-px flex-1" />
      </div>

      <div className="flex flex-col">
        {group.tasks.map((task) => {
          const project =
            projects.find((p) => p.id === task.project_id) ?? null;
          return <TaskItem key={task.id} task={task} project={project} />;
        })}
      </div>

      <Link
        href={`/task?date=${group.date}`}
        className="text-muted-foreground hover:text-foreground mt-2 flex items-center gap-2 py-1 text-sm transition-colors"
      >
        <Plus className="text-primary size-3.5 shrink-0" />
        Add task
      </Link>
    </div>
  );
}
