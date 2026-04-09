'use client';

import { type Project, type Task } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { isPast, startOfDay } from 'date-fns';
import { Circle } from 'lucide-react';
import Link from 'next/link';

const priorityBorder: Record<number, string> = {
  1: 'border-l-blue-500',
  2: 'border-l-orange-500',
  3: 'border-l-red-500',
  4: 'border-l-red-600',
};

interface TaskItemProps {
  task: Task;
  project: Project | null;
}

export function TaskItem({ task, project }: TaskItemProps) {
  const isOverdue =
    task.due_date !== null &&
    isPast(startOfDay(new Date(task.due_date + 'T00:00:00'))) &&
    !task.is_completed;

  return (
    <Link
      href={`/task/${task.id}`}
      className={cn(
        'group flex items-start gap-3 border-b border-border/50 border-l-2 py-3 pl-3 pr-4 transition-colors hover:bg-muted/30',
        task.priority > 1 ? priorityBorder[task.priority] : 'border-l-transparent'
      )}
    >
      {/* Checkbox */}
      <span
        role="button"
        tabIndex={0}
        aria-label="Complete task"
        onClick={(e) => e.preventDefault()}
        className="mt-0.5 shrink-0 text-muted-foreground/50 transition-colors hover:text-primary"
      >
        <Circle className="size-4" />
      </span>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          className={cn(
            'truncate text-sm',
            isOverdue ? 'text-destructive' : 'text-foreground',
            task.is_completed && 'text-muted-foreground line-through'
          )}
        >
          {task.title}
        </span>
        {task.description_text && (
          <span className="truncate text-xs text-muted-foreground">
            {task.description_text}
          </span>
        )}
      </div>

      {/* Project tag */}
      {project && (
        <span className="ml-auto flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
          <span className="font-bold" style={{ color: project.color }}>
            #
          </span>
          {project.name}
        </span>
      )}
    </Link>
  );
}
