'use client';

import { type DraggableAttributes, type DraggableSyntheticListeners } from '@dnd-kit/core';
import { type Project, type Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import { isPast, startOfDay } from 'date-fns';
import { CheckCircle2, Circle, GripVertical, ListTree } from 'lucide-react';
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

interface DragHandleProps {
  listeners: DraggableSyntheticListeners;
  attributes: DraggableAttributes;
  isDragging: boolean;
}

interface TaskItemProps {
  task: Task;
  project: Project | null;
  dragHandle?: DragHandleProps;
}

export function TaskItem({ task, project, dragHandle }: TaskItemProps) {
  const router = useRouter();
  const [completed, setCompleted] = useState(task.is_completed);

  const isOverdue =
    task.due_date !== null &&
    isPast(startOfDay(new Date(task.due_date + 'T00:00:00'))) &&
    !completed;

  function fireConfetti() {
    import('canvas-confetti').then((mod) => {
      const confetti = mod.default as (opts: Record<string, unknown>) => void;
      const shared = {
        particleCount: 80,
        spread: 55,
        startVelocity: 55,
        decay: 0.92,
        ticks: 200,
        origin: { y: 0.6 },
        disableForReducedMotion: true,
      };
      confetti({ ...shared, angle: 60,  origin: { x: 0,   y: 0.6 } });
      confetti({ ...shared, angle: 120, origin: { x: 1,   y: 0.6 } });
    });
  }

  async function handleToggle(e: React.MouseEvent) {
    e.preventDefault();
    const next = !completed;
    setCompleted(next);

    if (next) fireConfetti();

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
    <div
      className={cn(
        'group border-border/50 flex items-start border-b border-l-2 transition-all',
        priorityBorder[task.priority],
        dragHandle?.isDragging && 'opacity-40'
      )}
    >
      {/* Drag handle */}
      <button
        type="button"
        aria-label="Drag to reorder"
        className={cn(
          'text-muted-foreground/30 hover:text-muted-foreground flex shrink-0 cursor-grab items-center self-stretch px-1.5 active:cursor-grabbing',
          !dragHandle && 'hidden'
        )}
        {...dragHandle?.listeners}
        {...dragHandle?.attributes}
      >
        <GripVertical className="size-3.5" />
      </button>

      <Link
        href={`/task/${task.id}`}
        className={cn(
          'hover:bg-muted/30 flex flex-1 items-start gap-3 py-3 pr-4 transition-all',
          dragHandle ? 'pl-1' : 'pl-3'
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
        {/* Title with animated strike-through line */}
        <span
          className={cn(
            'relative w-fit max-w-full truncate text-sm transition-colors',
            isOverdue ? 'text-destructive' : 'text-foreground',
            completed && 'text-muted-foreground'
          )}
        >
          {task.title}
          <span
            className={cn(
              'absolute top-1/2 left-0 h-px w-full origin-left bg-current transition-transform duration-300',
              completed ? 'scale-x-100' : 'scale-x-0'
            )}
          />
        </span>
        {task.description_text && (
          <span className="text-muted-foreground truncate text-xs">
            {task.description_text}
          </span>
        )}
        {(task.sub_task_total ?? 0) > 0 && (
          <span className="text-muted-foreground flex items-center gap-1 text-xs">
            <ListTree className="size-3 shrink-0" />
            {task.sub_task_completed}/{task.sub_task_total}
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
    </div>
  );
}
