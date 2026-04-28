'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  TaskEditor,
  TaskEditorValues,
} from '@/components/molecule/task-editor';
import { Spinner } from '@/components/ui/spinner';
import { Task } from '@/lib/task';
import { format } from 'date-fns';
import { Save, Trash2 } from 'lucide-react';
import {
  deleteTask,
  deleteTaskWithSubtasks,
  restoreTasks,
  updateTask,
} from '@/app/actions/tasks';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { DeleteConfirmationDialog } from './molecule/delete-confirmation-dialog';
import { SubTaskSection } from './subtask-section';
import { useProjects } from '@/contexts/projects-context';
import { useServerAction } from '@/hooks/use-server-action';

type EditTaskModalProps = {
  id: string;
  task: Task;
  subTasks: Task[];
};

export function EditTaskModal({ id, task, subTasks }: EditTaskModalProps) {
  const router = useRouter();
  const { projects, adjustProjectTaskCount, adjustCompletedCount } =
    useProjects();
  const { isPending: isSaving, run: runSave } = useServerAction();
  const { isPending: isDeleting, run: runDelete } = useServerAction();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const initialValues: TaskEditorValues = {
    title: task.title,
    description: task.description ?? '',
    descriptionPlain: '',
    priority: task.priority,
    effort: task.effort,
    project: projects.find((p) => p.id === task.project_id) ?? null,
    dueDate: task.due_date ? new Date(task.due_date + 'T00:00:00') : null,
  };

  // use ref is the right call, since it's not react and we only need values on submit.
  const valuesRef = useRef<TaskEditorValues>(initialValues);

  function handleSave() {
    const v = valuesRef.current;
    const oldProjectId = task.project_id ?? null;
    const newProjectId = v.project?.id ?? null;
    if (oldProjectId !== newProjectId && !task.is_completed) {
      adjustProjectTaskCount(oldProjectId, -1);
      adjustProjectTaskCount(newProjectId, 1);
    }
    runSave(async () => {
      try {
        await updateTask(id, {
          title: v.title.trim(),
          description: v.description,
          description_text: v.descriptionPlain.slice(0, 500),
          priority: v.priority,
          effort: v.effort,
          project_id: newProjectId,
          due_date: v.dueDate ? format(v.dueDate, 'yyyy-MM-dd') : null,
        });
        router.back();
        toast.success('Task saved');
      } catch {
        if (oldProjectId !== newProjectId && !task.is_completed) {
          adjustProjectTaskCount(oldProjectId, 1);
          adjustProjectTaskCount(newProjectId, -1);
        }
        toast.error('Failed to save task');
      }
    });
  }

  function handleDeleteClick() {
    if (subTasks.length > 0) {
      setShowDeleteConfirm(true);
    } else {
      handleDelete();
    }
  }

  function handleDelete() {
    const allTasks = [task, ...subTasks];
    const incompleteTasks = allTasks.filter((t) => !t.is_completed);
    const completedTaskCount = allTasks.length - incompleteTasks.length;
    const projectDelta = new Map<string, number>();
    for (const t of incompleteTasks) {
      if (t.project_id)
        projectDelta.set(
          t.project_id,
          (projectDelta.get(t.project_id) ?? 0) - 1
        );
    }
    for (const [projectId, delta] of projectDelta) {
      adjustProjectTaskCount(projectId, delta);
    }
    if (completedTaskCount > 0) {
      adjustCompletedCount(-completedTaskCount);
    }
    runDelete(async () => {
      try {
        const deletedIds =
          subTasks.length > 0
            ? await deleteTaskWithSubtasks(id)
            : await deleteTask(id).then(() => [id]);
        router.back();
        toast('Task deleted', {
          duration: 5000,
          action: {
            label: 'Undo',
            onClick: () => restoreTasks(deletedIds),
          },
        });
      } catch {
        for (const [projectId, delta] of projectDelta) {
          adjustProjectTaskCount(projectId, -delta);
        }
        if (completedTaskCount > 0) {
          adjustCompletedCount(+completedTaskCount);
        }
        toast.error('Failed to delete task');
      }
    });
  }

  return (
    <>
      <Dialog open onOpenChange={() => router.back()}>
        <DialogContent
          showCloseButton={false}
          className="gap-0 p-0 sm:max-w-lg"
        >
          <div className="px-4 pt-4 pb-3">
            <TaskEditor
              initialValues={initialValues}
              onChange={(v) => {
                valuesRef.current = v;
              }}
            />
            <SubTaskSection subTasks={subTasks} parentTask={task} />
          </div>

          <div className="border-border flex items-center justify-between border-t px-4 py-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="text-muted-foreground hover:text-destructive gap-1.5"
            >
              {isDeleting ? (
                <Spinner size="sm" />
              ) : (
                <Trash2 className="size-3.5" />
              )}
              Delete task
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="gap-1.5"
            >
              {isSaving ? <Spinner size="sm" /> : <Save className="size-3.5" />}
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        showDeleteConfirmationDialog={showDeleteConfirm}
        setShowDeleteConfirmationDialog={setShowDeleteConfirm}
        title="Are you sure?"
        description={`This will also delete ${subTasks.length} sub-task${subTasks.length !== 1 ? 's' : ''}.`}
        isDeleting={isDeleting}
        handleDelete={handleDelete}
      />
    </>
  );
}
