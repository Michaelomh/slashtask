import { type Task, type Project } from '@/lib/types';
import { format, isToday, isTomorrow, isPast, startOfDay } from 'date-fns';
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
    </div>
  );
}
