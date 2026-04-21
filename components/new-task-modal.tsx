'use client';

import { createTask } from '@/app/actions/tasks';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { RichTextEditor } from '@/components/rich-text-editor';
import { TaskToolbar } from '@/components/task-toolbar';
import { Spinner } from '@/components/ui/spinner';
import { Project } from '@/lib/types';
import { format } from 'date-fns';
import { TitleInput } from '@/components/title-input';
import { useEffortShortcut } from '@/hooks/use-effort-shortcut';
import { useProjectShortcut } from '@/hooks/use-project-shortcut';
import { usePriorityShortcut } from '@/hooks/use-priority-shortcut';
import { parseDateToken, removeTriggerToken } from '@/lib/shortcut-parser';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

type NewTaskModalProps = {
  projects: Project[];
};

export function NewTaskModal({ projects }: NewTaskModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  const dateParam = searchParams.get('date');
  const initialDate = dateParam
    ? new Date(dateParam + 'T00:00:00')
    : new Date();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionPlain, setDescriptionPlain] = useState('');
  const [pickerDate, setPickerDate] = useState<Date | null>(initialDate);
  const [lastSource, setLastSource] = useState<'picker' | 'shortcut'>('picker');
  const [priority, setPriority] = useState<number>(4);
  const [effort, setEffort] = useState<number>(2);
  const [project, setProject] = useState<Project | null>(null);
  const [saving, setSaving] = useState(false);

  const projectShortcut = useProjectShortcut(projects);
  const priorityShortcut = usePriorityShortcut();
  const effortShortcut = useEffortShortcut();

  // Date shortcut — derived from title, no confirm step
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

  function handleClose() {
    router.back();
  }

  function handleCancel() {
    handleClose();
  }

  async function handleSubmit() {
    if (!title.trim() || saving) return;
    setSaving(true);

    const cleanTitle = token
      ? removeTriggerToken(title, token.start, token.end)
      : title;

    try {
      await createTask({
        title: cleanTitle.trim(),
        description: description.trim() || null,
        description_text: descriptionPlain.trim().slice(0, 500) || null,
        project_id: project?.id ?? null,
        priority,
        effort,
        due_date: effectiveDueDate
          ? format(effectiveDueDate, 'yyyy-MM-dd')
          : null,
      });
      router.back();
      router.refresh();
    } catch {
      toast.error('Failed to create task');
      setSaving(false);
    }
  }

  return (
    <>
      <Dialog
        open
        onOpenChange={(open) => {
          if (!open) handleClose();
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="gap-0 p-0 sm:max-w-lg"
        >
          {/* Main input area */}
          <div className="px-4 pt-4 pb-3">
            <TitleInput
              autoFocus
              ref={inputRef}
              value={title}
              highlight={token ? { start: token.start, end: token.end } : null}
              onChange={(e) => {
                const val = e.target.value;
                const pos = e.target.selectionStart ?? 0;
                setTitle(val);
                projectShortcut.onInputChange(val, pos);
                priorityShortcut.onInputChange(val, pos);
                effortShortcut.onInputChange(val, pos);
              }}
              onKeyDown={(e) => {
                const projectResult = projectShortcut.onKeyDown(e, title);
                if (projectResult.consumed) {
                  if (projectResult.confirm) {
                    setTitle(projectResult.confirm.newTitle);
                    setProject(projectResult.confirm.project);
                  } else if (projectResult.clearedTitle !== undefined)
                    setTitle(projectResult.clearedTitle);
                  return;
                }
                const priorityResult = priorityShortcut.onKeyDown(e, title);
                if (priorityResult.consumed) {
                  if (priorityResult.confirm) {
                    setTitle(priorityResult.confirm.newTitle);
                    setPriority(priorityResult.confirm.value);
                  } else if (priorityResult.clearedTitle !== undefined)
                    setTitle(priorityResult.clearedTitle);
                  return;
                }
                const effortResult = effortShortcut.onKeyDown(e, title);
                if (effortResult.consumed) {
                  if (effortResult.confirm) {
                    setTitle(effortResult.confirm.newTitle);
                    setEffort(effortResult.confirm.value);
                  } else if (effortResult.clearedTitle !== undefined)
                    setTitle(effortResult.clearedTitle);
                  return;
                }
                if (e.key === 'Enter') handleSubmit();
                if (e.key === 'Escape') handleClose();
              }}
              placeholder="Task name"
              inputClassName="placeholder:text-muted-foreground/50 w-full bg-transparent text-lg font-medium focus:outline-none"
            />
            <RichTextEditor
              value={description}
              onChange={(md, plain) => {
                setDescription(md);
                setDescriptionPlain(plain);
              }}
              placeholder="Description"
              className="mt-1.5"
            />

            {/* Toolbar */}
            <TaskToolbar
              className="pt-2"
              projects={projects}
              project={project}
              onProjectChange={(p) => {
                setProject(p);
              }}
              effectiveDueDate={effectiveDueDate}
              onDueDateChange={(d) => {
                setPickerDate(d);
                setLastSource('picker');
              }}
              priority={priority}
              onPriorityChange={(v) => {
                setPriority(v);
              }}
              effort={effort}
              onEffortChange={(v) => {
                setEffort(v);
              }}
              title={title}
              onTitleChange={setTitle}
              titleInputRef={inputRef}
              projectShortcut={projectShortcut}
              priorityShortcut={priorityShortcut}
              effortShortcut={effortShortcut}
            />
          </div>

          {/* Footer */}
          <div className="border-border flex items-center justify-end border-t px-4 py-3">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!title.trim() || saving}
                onClick={handleSubmit}
              >
                {saving ? <Spinner size="sm" className="mr-1.5" /> : null}
                Add task
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
