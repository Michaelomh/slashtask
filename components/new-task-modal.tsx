'use client';

import { createTask } from '@/app/actions/tasks';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { TaskEditor, TaskEditorValues } from '@/components/task-editor';
import { Spinner } from '@/components/ui/spinner';
import { Project } from '@/lib/types';
import { format } from 'date-fns';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

type NewTaskModalProps = {
  projects: Project[];
};

export function NewTaskModal({ projects }: NewTaskModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const dateParam = searchParams.get('date');
  const initialDate = dateParam ? new Date(dateParam + 'T00:00:00') : new Date();

  const initialValues: TaskEditorValues = {
    title: '',
    description: '',
    descriptionPlain: '',
    priority: 3,
    effort: 4,
    project: null,
    dueDate: initialDate,
  };

  const [values, setValues] = useState<TaskEditorValues>(initialValues);
  const [saving, setSaving] = useState(false);

  function handleClose() {
    router.back();
  }

  async function handleSubmit() {
    if (!values.title.trim() || saving) return;
    setSaving(true);
    try {
      await createTask({
        title: values.title.trim(),
        description: values.description.trim() || null,
        description_text: values.descriptionPlain.trim().slice(0, 500) || null,
        project_id: values.project?.id ?? null,
        priority: values.priority,
        effort: values.effort,
        due_date: values.dueDate ? format(values.dueDate, 'yyyy-MM-dd') : null,
      });
      router.back();
      router.refresh();
    } catch {
      toast.error('Failed to create task');
      setSaving(false);
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent showCloseButton={false} className="gap-0 p-0 sm:max-w-lg">
        <div className="px-4 pt-4 pb-3">
          <TaskEditor
            projects={projects}
            initialValues={initialValues}
            onChange={setValues}
            onSubmit={handleSubmit}
            onCancel={handleClose}
            autoFocus
          />
        </div>

        <div className="border-border flex items-center justify-end border-t px-4 py-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!values.title.trim() || saving}
              onClick={handleSubmit}
            >
              {saving ? <Spinner size="sm" className="mr-1.5" /> : null}
              Add task
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
