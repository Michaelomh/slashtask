'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  TaskEditor,
  TaskEditorValues,
} from '@/components/molecule/task-editor';
import { Spinner } from '@/components/ui/spinner';
import { Project, Task } from '@/lib/types';
import { format } from 'date-fns';
import { Save, Trash2 } from 'lucide-react';
import { deleteTask, updateTask } from '@/app/actions/tasks';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { DeleteConfirmationDialog } from './molecule/delete-confirmation-dialog';
import { SubTaskSection } from './subtask-section';

type TaskDetailModalProps = {
  id: string;
  task: Task;
  projects: Project[];
  subTasks: Task[];
};

export function TaskDetailModal({
  id,
  task,
  projects,
  subTasks,
}: TaskDetailModalProps) {
  const router = useRouter();

  const initialValues: TaskEditorValues = {
    title: task.title,
    description: task.description ?? '',
    descriptionPlain: '',
    priority: task.priority,
    effort: task.effort,
    project: projects.find((p) => p.id === task.project_id) ?? null,
    dueDate: task.due_date ? new Date(task.due_date + 'T00:00:00') : null,
  };

  const valuesRef = useRef<TaskEditorValues>(initialValues);
  const [deleting, setDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  async function handleSave() {
    const v = valuesRef.current;
    setIsSaving(true);
    try {
      await updateTask(id, {
        title: v.title.trim(),
        description: v.description,
        description_text: v.descriptionPlain.slice(0, 500),
        priority: v.priority,
        effort: v.effort,
        project_id: v.project?.id ?? null,
        due_date: v.dueDate ? format(v.dueDate, 'yyyy-MM-dd') : null,
      });
      toast.success('Task saved');
    } catch {
      toast.error('Failed to save task');
    } finally {
      setIsSaving(false);
    }
  }

  function handleDeleteClick() {
    if (subTasks.length > 0) {
      setShowDeleteConfirm(true);
    } else {
      handleDelete();
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteTask(id);
      router.back();
    } catch {
      toast.error('Failed to delete task');
      setDeleting(false);
    }
  }

  return (
    <>
      <Dialog
        open
        onOpenChange={(open) => {
          if (!open) router.back();
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="gap-0 p-0 sm:max-w-lg"
        >
          <div className="max-h-[80vh] overflow-y-auto px-4 pt-4 pb-3">
            <TaskEditor
              projects={projects}
              initialValues={initialValues}
              onChange={(v) => {
                valuesRef.current = v;
              }}
            />
            <SubTaskSection
              subTasks={subTasks}
              projects={projects}
              parentTask={task}
            />
          </div>

          <div className="border-border flex items-center justify-between border-t px-4 py-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteClick}
              disabled={deleting}
              className="text-muted-foreground hover:text-destructive gap-1.5"
            >
              {deleting ? (
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
        isDeleting={deleting}
        handleDelete={handleDelete}
      />
    </>
  );
}
