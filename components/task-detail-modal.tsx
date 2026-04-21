'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { RichTextEditor } from '@/components/molecule/rich-text-editor';
import { TaskToolbar } from '@/components/molecule/task-toolbar';
import { TitleInput } from '@/components/title-input';
import { useEffortShortcut } from '@/hooks/use-effort-shortcut';
import { useProjectShortcut } from '@/hooks/use-project-shortcut';
import { usePriorityShortcut } from '@/hooks/use-priority-shortcut';
import { parseDateToken, removeTriggerToken } from '@/lib/shortcut-parser';
import { Spinner } from '@/components/ui/spinner';
import { Project, Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { deleteTask, updateTask } from '@/app/actions/tasks';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
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

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? '');
  const [descriptionPlain, setDescriptionPlain] = useState('');
  const [pickerDate, setPickerDate] = useState<Date | null>(
    task.due_date ? new Date(task.due_date + 'T00:00:00') : null
  );
  const [lastSource, setLastSource] = useState<'picker' | 'shortcut'>('picker');
  const [priority, setPriority] = useState<number>(task.priority);
  const [effort, setEffort] = useState<number>(task.effort);
  const [project, setProject] = useState<Project | null>(
    projects.find((p) => p.id === task.project_id) ?? null
  );
  const [deleting, setDeleting] = useState(false);
  const [isSavingTask, setSavingTask] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);

  const projectShortcut = useProjectShortcut(projects);
  const priorityShortcut = usePriorityShortcut();
  const effortShortcut = useEffortShortcut();

  const token = useMemo(() => parseDateToken(title, new Date()), [title]);
  const prevTokenText = useRef<string | null>(null);
  useEffect(() => {
    if (token?.text !== prevTokenText.current) {
      prevTokenText.current = token?.text ?? null;
      if (token) setLastSource('shortcut');
    }
  }, [token]);

  const effectiveDueDate =
    lastSource === 'shortcut' && token ? token.date : pickerDate;

  async function patch(body: Parameters<typeof updateTask>[1]) {
    try {
      await updateTask(id, body);
    } catch {
      toast.error('Failed to save changes');
    }
  }

  function handleTitleChange(value: string) {
    setTitle(value);
  }

  async function handleTitleBlur() {
    setSavingTask(true);
    const cleanTitle = token
      ? removeTriggerToken(title, token.start, token.end)
      : title;
    if (cleanTitle !== title) setTitle(cleanTitle);
    const updates: Record<string, unknown> = { title: cleanTitle.trim() };
    if (lastSource === 'shortcut' && token) {
      updates.due_date = format(token.date, 'yyyy-MM-dd');
      setPickerDate(token.date);
      setLastSource('picker');
    }
    await patch(updates);
    setSavingTask(false);
  }

  function handleDescriptionChange(markdown: string, plainText: string) {
    setDescription(markdown);
    setDescriptionPlain(plainText);
  }

  async function handleDescriptionBlur() {
    setSavingTask(true);
    await patch({
      description,
      description_text: descriptionPlain.slice(0, 500),
    });
    setSavingTask(false);
  }

  async function handleDueDateChange(date: Date | null) {
    setPickerDate(date);
    setLastSource('picker');
    setSavingTask(true);
    const due_date = date
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      : null;
    await patch({ due_date });
    setSavingTask(false);
  }

  async function handlePriorityChange(value: number) {
    setPriority(value);
    setSavingTask(true);
    await patch({ priority: value });
    setSavingTask(false);
  }

  async function handleEffortChange(value: number) {
    setEffort(value);
    setSavingTask(true);
    await patch({ effort: value });
    setSavingTask(false);
  }

  async function handleProjectChange(p: Project | null) {
    setProject(p);
    setSavingTask(true);
    await patch({ project_id: p?.id ?? null });
    setSavingTask(false);
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
          {/* Body */}
          <div className="px-4 pt-4 pb-3">
            {/* Title row */}
            <div className="flex items-start gap-3">
              <TitleInput
                ref={titleInputRef}
                value={title}
                highlight={
                  token ? { start: token.start, end: token.end } : null
                }
                onBlur={handleTitleBlur}
                onChange={(e) => {
                  const val = e.target.value;
                  const pos = e.target.selectionStart ?? 0;
                  handleTitleChange(val);
                  projectShortcut.onInputChange(val, pos);
                  priorityShortcut.onInputChange(val, pos);
                  effortShortcut.onInputChange(val, pos);
                }}
                onKeyDown={(e) => {
                  const projectResult = projectShortcut.onKeyDown(e, title);
                  if (projectResult.consumed) {
                    if (projectResult.confirm) {
                      handleTitleChange(projectResult.confirm.newTitle);
                      handleProjectChange(projectResult.confirm.project);
                    } else if (projectResult.clearedTitle !== undefined)
                      handleTitleChange(projectResult.clearedTitle);
                    return;
                  }
                  const priorityResult = priorityShortcut.onKeyDown(e, title);
                  if (priorityResult.consumed) {
                    if (priorityResult.confirm) {
                      handleTitleChange(priorityResult.confirm.newTitle);
                      handlePriorityChange(priorityResult.confirm.value);
                    } else if (priorityResult.clearedTitle !== undefined)
                      handleTitleChange(priorityResult.clearedTitle);
                    return;
                  }
                  const effortResult = effortShortcut.onKeyDown(e, title);
                  if (effortResult.consumed) {
                    if (effortResult.confirm) {
                      handleTitleChange(effortResult.confirm.newTitle);
                      handleEffortChange(effortResult.confirm.value);
                    } else if (effortResult.clearedTitle !== undefined)
                      handleTitleChange(effortResult.clearedTitle);
                    return;
                  }
                }}
                inputClassName={cn(
                  'placeholder:text-muted-foreground/50 w-full bg-transparent text-lg font-medium focus:outline-none'
                )}
              />
            </div>

            {/* Description */}
            <RichTextEditor
              value={description}
              onChange={handleDescriptionChange}
              onBlur={handleDescriptionBlur}
              placeholder="Description"
              className="mt-1.5"
            />

            {/* Toolbar */}
            <TaskToolbar
              className="mt-3"
              projects={projects}
              project={project}
              onProjectChange={handleProjectChange}
              effectiveDueDate={effectiveDueDate}
              onDueDateChange={handleDueDateChange}
              priority={priority}
              onPriorityChange={handlePriorityChange}
              effort={effort}
              onEffortChange={handleEffortChange}
              title={title}
              onTitleChange={handleTitleChange}
              titleInputRef={titleInputRef}
              projectShortcut={projectShortcut}
              priorityShortcut={priorityShortcut}
              effortShortcut={effortShortcut}
            />

            <SubTaskSection subTasks={subTasks} projects={projects} />
          </div>

          {/* Footer */}
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
            {isSavingTask && (
              <div className="flex items-center gap-2">
                <p className="text-sidebar-foreground/50 text-sm">Saving</p>
                <Spinner className="text-sidebar-foreground/50 size-3" />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        showDeleteConfirmationDialog={showDeleteConfirm}
        setShowDeleteConfirmationDialog={setShowDeleteConfirm}
        title="Are you sure?"
        description={`This will also delete ${subTasks.length} sub-task
              ${subTasks.length !== 1 ? 's' : ''}.`}
        isDeleting={deleting}
        handleDelete={handleDelete}
      />
    </>
  );
}
