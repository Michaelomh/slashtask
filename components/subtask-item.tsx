'use client';

import { deleteTask, updateTask } from '@/app/actions/tasks';
import { Project } from '@/lib/project';
import { isTaskOverdue, truncateDescriptionText, Task } from '@/lib/task';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CheckCircle2, Circle, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import {
  TaskEditor,
  TaskEditorHandle,
  TaskEditorValues,
} from './molecule/task-editor';
import { Spinner } from './ui/spinner';
import { DEFAULT_EFFORT_INDEX } from '@/lib/effort';
import { DEFAULT_PRIORITY_INDEX } from '@/lib/priority';
import { useProjects } from '@/contexts/projects-context';
import { fireConfetti } from '@/lib/animation';
import { useServerAction } from '@/hooks/use-server-action';

type SubTaskItemProps = {
  task: Task;
  project: Project | null;
};

export function SubTaskItem({ task, project }: SubTaskItemProps) {
  const { projects, adjustProjectTaskCount, adjustCompletedCount } =
    useProjects();
  const router = useRouter();
  const [displayTask, setDisplayTask] = useState<Task>(task);
  const [completed, setCompleted] = useState(task.is_completed);
  const [updatingSubTask, setUpdatingSubTask] = useState(false);
  const [hasTitle, setHasTitle] = useState(!!task.title.trim());
  const editorRef = useRef<TaskEditorHandle>(null);
  const { isPending: isCompletePending, run: runComplete } = useServerAction();
  const { isPending: isSaving, run: runSave } = useServerAction();
  const { isPending: isDeleting, run: runDelete } = useServerAction();

  useEffect(() => {
    setDisplayTask(task);
  }, [task]);

  const displayProject =
    projects.find((p) => p.id === displayTask.project_id) ?? project;
  const isOverdue = isTaskOverdue(displayTask, completed);

  function handleCompleteTask(e: React.MouseEvent) {
    e.preventDefault();
    const next = !completed;
    setCompleted(next);
    if (next) {
      adjustCompletedCount(1);
      adjustProjectTaskCount(task.project_id, -1);
    } else {
      adjustCompletedCount(-1);
      adjustProjectTaskCount(task.project_id, 1);
    }
    runComplete(async () => {
      try {
        if (next) fireConfetti();
        await updateTask(task.id, { is_completed: next });
      } catch {
        setCompleted(!next);
        if (next) {
          adjustCompletedCount(-1);
          adjustProjectTaskCount(task.project_id, 1);
        } else {
          adjustCompletedCount(1);
          adjustProjectTaskCount(task.project_id, -1);
        }
        toast.error('Failed to update task');
      }
    });
  }

  function handleDeleteSubtask() {
    if (!task.is_completed) {
      adjustProjectTaskCount(task.project_id, -1);
    } else {
      adjustCompletedCount(-1);
    }
    runDelete(async () => {
      try {
        await deleteTask(task.id);
        router.refresh();
        toast('Sub-task deleted', {
          duration: 5000,
          action: {
            label: 'Undo',
            onClick: () => updateTask(task.id, { is_deleted: false }),
          },
        });
      } catch {
        if (!task.is_completed) {
          adjustProjectTaskCount(task.project_id, 1);
        } else {
          adjustCompletedCount(1);
        }
        toast.error('Failed to delete sub-task');
      }
    });
  }

  function handleUpdateSubTask(values: TaskEditorValues) {
    const previous = displayTask;
    const title = values.title.trim();
    const description = values.description.trim() || null;
    const description_text = truncateDescriptionText(values.descriptionPlain);
    const due_date = values.dueDate
      ? format(values.dueDate, 'yyyy-MM-dd')
      : null;
    const project_id = values.project?.id ?? null;
    const next: Task = {
      ...displayTask,
      title,
      description,
      description_text,
      priority: values.priority as Task['priority'],
      effort: values.effort as Task['effort'],
      due_date,
      project_id,
      updated_at: new Date().toISOString(),
    };
    setDisplayTask(next);
    setUpdatingSubTask(false);
    runSave(async () => {
      try {
        await updateTask(task.id, {
          title,
          priority: values.priority,
          effort: values.effort,
          due_date,
          project_id,
          description,
          description_text,
        });
      } catch {
        setDisplayTask(previous);
        setUpdatingSubTask(true);
        toast.error('Failed to update sub-task');
      }
    });
  }

  return (
    <div className="group border-border/50 flex items-start border-b transition-all">
      {updatingSubTask ? (
        <div className="border-border mt-1 w-full rounded-md border">
          <div className="px-3 pt-3 pb-2">
            <TaskEditor
              ref={editorRef}
              initialValues={{
                title: task.title ?? '',
                description: task.description ?? '',
                descriptionPlain: task.description_text ?? '',
                priority: task.priority ?? DEFAULT_PRIORITY_INDEX,
                effort: task.effort ?? DEFAULT_EFFORT_INDEX,
                dueDate: task.due_date
                  ? new Date(task.due_date + 'T00:00:00')
                  : null,
                project: projects.find((p) => p.id === task.project_id) ?? null,
              }}
              onSubmit={handleUpdateSubTask}
              onTitleChange={(t) => setHasTitle(!!t.trim())}
              onCancel={() => setUpdatingSubTask(false)}
              autoFocus
            />
          </div>
          <div className="border-border flex items-center justify-between border-t px-3 py-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteSubtask}
              disabled={isDeleting}
              className="text-muted-foreground hover:text-destructive gap-1.5"
            >
              {isDeleting ? (
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
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!hasTitle || isSaving}
                onClick={() => editorRef.current?.submit()}
              >
                {isSaving ? <Spinner size="sm" className="mr-1.5" /> : null}
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
            onClick={handleCompleteTask}
            onKeyDown={(e) =>
              e.key === 'Enter' && handleCompleteTask(e as never)
            }
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
              {displayTask.title}
              <span
                className={cn(
                  'absolute top-1/2 left-0 h-px w-full origin-left bg-current transition-transform duration-300',
                  completed ? 'scale-x-100' : 'scale-x-0'
                )}
              />
            </span>
          </div>

          {/* Project tag */}
          {displayProject && (
            <span className="text-muted-foreground ml-auto flex max-w-20 shrink-0 items-center gap-1 text-xs">
              <span
                className="font-bold"
                style={{ color: displayProject.color }}
              >
                {displayProject.emoji}
              </span>
              <span className="truncate">{displayProject.name}</span>
            </span>
          )}
        </button>
      )}
    </div>
  );
}
