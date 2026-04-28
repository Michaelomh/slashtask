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
import { isTaskOverdue, Task } from '@/lib/task';
import { cn } from '@/lib/utils';
import { useServerAction } from '@/hooks/use-server-action';
import { CheckCircle2, Circle, Copy, RotateCcw, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useProjects } from '@/contexts/projects-context';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { fireConfetti } from '@/lib/animation';

type TaskItemProps = {
  task: Task;
  project: Project | null;
  variant?: 'active' | 'completed';
};

export function TaskItem({ task, project, variant = 'active' }: TaskItemProps) {
  const router = useRouter();
  const { adjustProjectTaskCount, adjustCompletedCount } = useProjects();
  const [completed, setCompleted] = useState(task.is_completed);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { isPending: isCompletePending, run: runComplete } = useServerAction();
  const { isPending: isDeletePending, run: runDelete } = useServerAction();

  const isOverdue = isTaskOverdue(task, completed);

  function handleDelete() {
    if (!completed) {
      adjustProjectTaskCount(task.project_id, -1);
    } else {
      adjustCompletedCount(-1);
    }
    runDelete(async () => {
      try {
        const deletedIds =
          (task.sub_task_total ?? 0) > 0
            ? await deleteTaskWithSubtasks(task.id)
            : await deleteTask(task.id).then(() => [task.id]);
        toast('Task deleted', {
          duration: 5000,
          action: {
            label: 'Undo',
            onClick: () => restoreTasks(deletedIds),
          },
        });
      } catch {
        if (!completed) {
          adjustProjectTaskCount(task.project_id, +1);
        } else {
          adjustCompletedCount(+1);
        }
        toast.error('Failed to delete task');
      } finally {
        setShowDeleteDialog(false);
      }
    });
  }

  function handleDeleteClick() {
    if ((task.sub_task_total ?? 0) > 0) {
      setShowDeleteDialog(true);
    } else {
      handleDelete();
    }
  }

  function handleMarkIncomplete() {
    adjustCompletedCount(-1);
    adjustProjectTaskCount(task.project_id, +1);
    runComplete(async () => {
      try {
        await updateTask(task.id, { is_completed: false });
        toast.success('Marked as incomplete');
      } catch {
        adjustCompletedCount(+1);
        adjustProjectTaskCount(task.project_id, -1);
        toast.error('Failed to update task');
      }
    });
  }

  function handleCompleteTask(e: React.MouseEvent) {
    e.preventDefault();
    const next = !completed;
    setCompleted(next);
    if (next) {
      adjustCompletedCount(+1);
      adjustProjectTaskCount(task.project_id, -1);
    } else {
      adjustCompletedCount(-1);
      adjustProjectTaskCount(task.project_id, +1);
    }
    runComplete(async () => {
      try {
        if (next) fireConfetti();
        await updateTask(task.id, { is_completed: next });
      } catch {
        setCompleted(!next);
        if (next) {
          adjustCompletedCount(-1);
          adjustProjectTaskCount(task.project_id, +1);
        } else {
          adjustCompletedCount(+1);
          adjustProjectTaskCount(task.project_id, -1);
        }
        toast.error('Failed to update task');
      }
    });
  }

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger className="block">
          <div
            onMouseEnter={() => router.prefetch(`/task/${task.id}`)}
            className={cn(
              'group border-border/50 flex items-start border-b transition-all'
            )}
          >
            <Link
              href={`/task/${task.id}`}
              prefetch={true}
              className={cn(
                'hover:bg-muted/30 flex flex-1 items-start gap-3 py-3 pr-4 transition-all'
              )}
            >
              {/* Checkbox */}
              <span
                role="button"
                tabIndex={0}
                aria-label="Complete task"
                onClick={handleCompleteTask}
                onKeyDown={(e) => e.key === 'Enter' && handleCompleteTask(e as never)}
                className={cn(
                  'text-muted-foreground/50 hover:text-primary mt-0.5 shrink-0 transition-colors',
                  isCompletePending && 'opacity-50'
                )}
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
          <ContextMenuItem
            onMouseEnter={() => router.prefetch(`/task?duplicate=${task.id}`)}
            onClick={() => router.push(`/task?duplicate=${task.id}`)}
          >
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
        isDeleting={isDeletePending}
        handleDelete={handleDelete}
      />
    </>
  );
}
