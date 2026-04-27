'use client';

import {
  deleteTask,
  deleteTaskWithSubtasks,
  restoreTasks,
  updateTask,
} from '@/app/actions/tasks';
import { DeleteConfirmationDialog } from '@/components/molecule/delete-confirmation-dialog';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Project } from '@/lib/project';
import { Task } from '@/lib/task';
import { cn } from '@/lib/utils';
import { isPast, startOfDay, addDays } from 'date-fns';
import { CheckCircle2, Circle, Copy, RotateCcw, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

type TaskItemProps = {
  task: Task;
  project: Project | null;
  variant?: 'active' | 'completed';
};

export function TaskItem({ task, project, variant = 'active' }: TaskItemProps) {
  const router = useRouter();
  const [completed, setCompleted] = useState(task.is_completed);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOverdue =
    task.due_date !== null &&
    isPast(startOfDay(addDays(new Date(task.due_date), 1))) &&
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
      confetti({ ...shared, angle: 60, origin: { x: 0, y: 0.6 } });
      confetti({ ...shared, angle: 120, origin: { x: 1, y: 0.6 } });
    });
  }

  function handleDuplicate() {
    router.push(`/task?duplicate=${task.id}`);
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const deletedIds =
        (task.sub_task_total ?? 0) > 0
          ? await deleteTaskWithSubtasks(task.id)
          : await deleteTask(task.id).then(() => [task.id]);
      toast('Task deleted', {
        action: {
          label: 'Undo',
          onClick: () => restoreTasks(deletedIds),
        },
      });
    } catch {
      toast.error('Failed to delete task');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  }

  function handleDeleteClick() {
    if ((task.sub_task_total ?? 0) > 0) {
      setShowDeleteDialog(true);
    } else {
      handleDelete();
    }
  }

  async function handleMarkIncomplete() {
    try {
      await updateTask(task.id, { is_completed: false });
      toast.success('Marked as incomplete');
    } catch {
      toast.error('Failed to update task');
    }
  }

  async function handleToggle(e: React.MouseEvent) {
    e.preventDefault();
    const next = !completed;
    setCompleted(next);

    if (next) fireConfetti();

    try {
      await updateTask(task.id, { is_completed: next });
    } catch {
      setCompleted(!next);
      toast.error('Failed to update task');
    }
  }

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger className="block">
          <div
            className={cn(
              'group border-border/50 flex items-start border-b transition-all'
            )}
          >
            <Link
              href={`/task/${task.id}`}
              className={cn(
                'hover:bg-muted/30 flex flex-1 items-start gap-3 py-3 pr-4 transition-all'
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
              </div>

              {/* Project tag */}
              {project && (
                <span className="text-muted-foreground ml-auto flex max-w-20 shrink-0 items-center gap-1 text-xs">
                  <span className="font-bold" style={{ color: project.color }}>
                    {project.emoji}
                  </span>
                  <span className="truncate">{project.name}</span>
                </span>
              )}
            </Link>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={handleDuplicate}>
            <Copy />
            Duplicate
          </ContextMenuItem>
          {variant === 'completed' && (
            <ContextMenuItem onClick={handleMarkIncomplete}>
              <RotateCcw />
              Mark as Incomplete
            </ContextMenuItem>
          )}
          <ContextMenuSeparator />
          <ContextMenuItem variant="destructive" onClick={handleDeleteClick}>
            <Trash2 />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <DeleteConfirmationDialog
        showDeleteConfirmationDialog={showDeleteDialog}
        setShowDeleteConfirmationDialog={setShowDeleteDialog}
        title="Delete task?"
        description="This task has subtasks. Deleting it will also delete all subtasks."
        isDeleting={isDeleting}
        handleDelete={handleDelete}
      />
    </>
  );
}
