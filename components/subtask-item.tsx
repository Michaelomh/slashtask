'use client';

import { deleteTask, updateTask } from '@/app/actions/tasks';
import { Project } from '@/lib/project';
import { Task } from '@/lib/task';
import { cn } from '@/lib/utils';
import { isPast, startOfDay, addDays, format } from 'date-fns';
import { CheckCircle2, Circle, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { TaskEditor, TaskEditorValues } from './molecule/task-editor';
import { Spinner } from './ui/spinner';
import { DEFAULT_EFFORT_INDEX } from '@/lib/effort';
import { DEFAULT_PRIORITY_INDEX } from '@/lib/priority';

type SubTaskItemProps = {
  task: Task;
  project: Project | null;
  projects: Project[];
};

export function SubTaskItem({ task, project, projects }: SubTaskItemProps) {
  const router = useRouter();
  const [completed, setCompleted] = useState(task.is_completed);
  const [updatingSubTask, setUpdatingSubTask] = useState(false);
  const [savingSubTask, setSavingSubTask] = useState(false);
  const [deletingSubTask, setDeletingSubTask] = useState(false);
  const [editorValues, setEditorValues] = useState<TaskEditorValues>({
    title: task.title ?? '',
    description: task.description ?? '',
    descriptionPlain: task.description_text ?? '',
    priority: task.priority ?? DEFAULT_PRIORITY_INDEX,
    effort: task.effort ?? DEFAULT_EFFORT_INDEX,
    dueDate: task.due_date ? new Date(task.due_date + 'T00:00:00') : null,
    project: projects.find((p) => p.id === task.project_id) ?? null,
  });

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

  async function handleDelete() {
    setDeletingSubTask(true);
    try {
      await deleteTask(task.id);
      router.refresh();
      toast('Sub-task deleted', {
        action: {
          label: 'Undo',
          onClick: () => updateTask(task.id, { is_deleted: false }),
        },
      });
    } catch {
      toast.error('Failed to delete sub-task');
      setDeletingSubTask(false);
    }
  }

  async function handleUpdateSubTask() {
    if (!editorValues.title.trim() || savingSubTask) return;
    setSavingSubTask(true);
    try {
      await updateTask(task.id, {
        title: editorValues.title.trim(),
        priority: editorValues.priority,
        effort: editorValues.effort,
        due_date: editorValues.dueDate
          ? format(editorValues.dueDate, 'yyyy-MM-dd')
          : null,
        project_id: editorValues.project?.id ?? null,
        description: editorValues.description.trim() || null,
        description_text:
          editorValues.descriptionPlain.trim().slice(0, 500) || null,
      });
      setUpdatingSubTask(false);
      router.refresh();
      toast.success('Sub-task updated');
    } catch {
      toast.error('Failed to update sub-task');
    } finally {
      setSavingSubTask(false);
    }
  }

  return (
    <div className="group border-border/50 flex items-start border-b transition-all">
      {updatingSubTask ? (
        <div className="border-border mt-1 w-full rounded-md border">
          <div className="px-3 pt-3 pb-2">
            <TaskEditor
              projects={projects}
              initialValues={editorValues}
              onChange={setEditorValues}
              onSubmit={handleUpdateSubTask}
              onCancel={() => setUpdatingSubTask(false)}
              autoFocus
            />
          </div>
          <div className="border-border flex items-center justify-between border-t px-3 py-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={deletingSubTask}
              className="text-muted-foreground hover:text-destructive gap-1.5"
            >
              {deletingSubTask ? (
                <Spinner size="sm" />
              ) : (
                <Trash2 className="size-3.5" />
              )}
              Delete sub-task
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setUpdatingSubTask(false);
                }}
                disabled={savingSubTask}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!editorValues.title.trim() || savingSubTask}
                onClick={handleUpdateSubTask}
              >
                {savingSubTask ? (
                  <Spinner size="sm" className="mr-1.5" />
                ) : null}
                Update sub-task
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <button
          className="hover:bg-muted/30 flex flex-1 cursor-pointer items-start gap-3 py-3 pr-4 transition-all"
          onClick={() => setUpdatingSubTask(true)}
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
        </button>
      )}
    </div>
  );
}
