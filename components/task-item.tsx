'use client';

import { type Project, type Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import { isPast, startOfDay } from 'date-fns';
import { CheckCircle2, Circle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

const priorityBorder: Record<number, string> = {
  1: 'border-l-red-500',
  2: 'border-l-orange-500',
  3: 'border-l-blue-500',
  4: 'border-l-transparent',
};

interface TaskItemProps {
  task: Task;
  project: Project | null;
}

export function TaskItem({ task, project }: TaskItemProps) {
  const router = useRouter();
  const [completed, setCompleted] = useState(task.is_completed);

  const isOverdue =
    task.due_date !== null &&
    isPast(startOfDay(new Date(task.due_date + 'T00:00:00'))) &&
    !completed;

  async function handleToggle(e: React.MouseEvent) {
    e.preventDefault();
    const next = !completed;
    setCompleted(next);

    const res = await fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_completed: next }),
    });

    if (!res.ok) {
      setCompleted(!next);
      toast.error('Failed to update task');
      return;
    }

    router.refresh();
  }

  return (
    <Link
      href={`/task/${task.id}`}
      className={cn(
        'group border-border/50 hover:bg-muted/30 flex items-start gap-3 border-b border-l-2 py-3 pr-4 pl-3 transition-colors',
        priorityBorder[task.priority]
      )}
    >
      {/* Checkbox */}
      <span
        role="button"
        tabIndex={0}
        aria-label="Complete task"
        onClick={handleToggle}
        onKeyDown={(e) => e.key === 'Enter' && handleToggle(e as never)}
        className="text-muted-foreground/50 hover:text-primary mt-0.5 shrink-0 transition-colors"
      >
        {completed ? (
          <CheckCircle2 className="text-primary size-4" />
        ) : (
          <Circle className="size-4" />
        )}
      </span>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          className={cn(
            'truncate text-sm',
            isOverdue ? 'text-destructive' : 'text-foreground',
            completed && 'text-muted-foreground line-through'
          )}
        >
          {task.title}
        </span>
        {task.description_text && (
          <span className="text-muted-foreground truncate text-xs">
            {task.description_text}
          </span>
        )}
      </div>

      {/* Project tag */}
      {project && (
        <span className="text-muted-foreground ml-auto flex shrink-0 items-center gap-1 text-xs">
          <span className="font-bold" style={{ color: project.color }}>
            {project.emoji}
          </span>
          {project.name}
        </span>
      )}
    </Link>
  );
}
