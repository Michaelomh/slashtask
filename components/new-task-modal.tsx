'use client';

import { createTask } from '@/app/actions/tasks';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  TaskEditor,
  TaskEditorValues,
} from '@/components/molecule/task-editor';
import { Spinner } from '@/components/ui/spinner';
import { truncateDescriptionText, Task } from '@/lib/task';
import { format } from 'date-fns';
import { useProjects } from '@/contexts/projects-context';
import { useOptimisticTasks } from '@/contexts/optimistic-tasks-context';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { formatDueDate } from '@/lib/date';
import { DEFAULT_PRIORITY_INDEX } from '@/lib/priority';
import { DEFAULT_EFFORT_INDEX } from '@/lib/effort';
import { useServerAction } from '@/hooks/use-server-action';

type NewTaskModalProps = {
  initialTask?: Task;
  open: boolean;
  onClose?: () => void;
};

export function NewTaskModal({
  initialTask,
  open,
  onClose,
}: NewTaskModalProps) {
  const router = useRouter();
  const { adjustProjectTaskCount } = useProjects();
  const { publish } = useOptimisticTasks();
  const { isPending, run } = useServerAction();

  const initialValues: TaskEditorValues = {
    title: initialTask ? initialTask.title : '',
    description: (initialTask ? initialTask.description : '') ?? '',
    descriptionPlain: (initialTask ? initialTask.description_text : '') ?? '',
    priority: initialTask ? initialTask.priority : DEFAULT_PRIORITY_INDEX,
    effort: initialTask ? initialTask.effort : DEFAULT_EFFORT_INDEX,
    project: null,
    dueDate: initialTask ? formatDueDate(initialTask.due_date) : null,
  };

  const [values, setValues] = useState<TaskEditorValues>(initialValues);

  function handleClose() {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  }

  function handleSubmit() {
    if (!values.title.trim()) return;
    const projectId = values.project?.id ?? null;
    const trimmedTitle = values.title.trim();
    const trimmedDescription = values.description.trim() || null;
    const description_text = truncateDescriptionText(values.descriptionPlain);
    const due_date = values.dueDate
      ? format(values.dueDate, 'yyyy-MM-dd')
      : null;
    const now = new Date().toISOString();
    const optimisticTask: Task = {
      id: crypto.randomUUID(),
      title: trimmedTitle,
      description: trimmedDescription,
      description_text,
      project_id: projectId,
      priority: values.priority as Task['priority'],
      effort: values.effort as Task['effort'],
      due_date,
      is_completed: false,
      completed_at: null,
      order: 0,
      is_deleted: false,
      parent_task_id: null,
      recurrence_rule: null,
      user_id: '',
      created_at: now,
      updated_at: now,
    };
    adjustProjectTaskCount(projectId, 1);
    handleClose();
    run(async () => {
      publish(optimisticTask);
      try {
        await createTask({
          title: trimmedTitle,
          description: trimmedDescription,
          description_text,
          project_id: projectId,
          priority: values.priority,
          effort: values.effort,
          due_date,
        });
      } catch {
        adjustProjectTaskCount(projectId, -1);
        toast.error('Failed to create task');
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={() => handleClose()}>
      <DialogContent showCloseButton={false} className="gap-0 p-0 sm:max-w-lg">
        <div className="px-4 pt-4 pb-3">
          <TaskEditor
            initialValues={initialValues}
            onChange={setValues}
            onSubmit={handleSubmit}
            onCancel={onClose}
            autoFocus
          />
        </div>

        <div className="border-border flex items-center justify-end border-t px-4 py-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!values.title.trim() || isPending}
              onClick={handleSubmit}
            >
              {isPending ? <Spinner size="sm" className="mr-1.5" /> : null}
              Add task
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
