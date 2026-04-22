'use client';

import { RichTextEditor } from '@/components/molecule/rich-text-editor';
import { TaskToolbar } from '@/components/molecule/task-toolbar';
import { TitleInput } from '@/components/title-input';
import { useEffortShortcut } from '@/hooks/use-effort-shortcut';
import { useProjectShortcut } from '@/hooks/use-project-shortcut';
import { usePriorityShortcut } from '@/hooks/use-priority-shortcut';
import { parseDateToken, removeTriggerToken } from '@/lib/shortcut-parser';
import { Project } from '@/lib/types';
import { useEffect, useMemo, useRef, useState } from 'react';

export type TaskEditorValues = {
  title: string;
  description: string;
  descriptionPlain: string;
  priority: number;
  effort: number;
  project: Project | null;
  dueDate: Date | null;
};

type TaskEditorProps = {
  projects: Project[];
  initialValues?: Partial<TaskEditorValues>;
  onChange: (values: TaskEditorValues) => void;
  onSubmit?: () => void;
  onCancel?: () => void;
  autoFocus?: boolean;
  titlePlaceholder?: string;
  className?: string;
};

export function TaskEditor({
  projects,
  initialValues,
  onChange,
  onSubmit,
  onCancel,
  autoFocus,
  titlePlaceholder = 'Task name',
  className,
}: TaskEditorProps) {
  const titleInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [descriptionPlain, setDescriptionPlain] = useState(initialValues?.descriptionPlain ?? '');
  const [pickerDate, setPickerDate] = useState<Date | null>(initialValues?.dueDate ?? null);
  const [lastSource, setLastSource] = useState<'picker' | 'shortcut'>('picker');
  const [priority, setPriority] = useState(initialValues?.priority ?? 3);
  const [effort, setEffort] = useState(initialValues?.effort ?? 4);
  const [project, setProject] = useState<Project | null>(initialValues?.project ?? null);

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

  const effectiveDueDate = lastSource === 'shortcut' && token ? token.date : pickerDate;

  // Fires onChange with current state, applying any in-flight overrides to avoid stale closures.
  function emit(overrides: Partial<TaskEditorValues> = {}) {
    onChange({
      title,
      description,
      descriptionPlain,
      priority,
      effort,
      project,
      dueDate: effectiveDueDate,
      ...overrides,
    });
  }

  function handleTitleChange(val: string) {
    setTitle(val);
    emit({ title: val });
  }

  function handleDescriptionChange(md: string, plain: string) {
    setDescription(md);
    setDescriptionPlain(plain);
    emit({ description: md, descriptionPlain: plain });
  }

  function handleProjectChange(p: Project | null) {
    setProject(p);
    emit({ project: p });
  }

  function handleDueDateChange(d: Date | null) {
    setPickerDate(d);
    setLastSource('picker');
    emit({ dueDate: d });
  }

  function handlePriorityChange(v: number) {
    setPriority(v);
    emit({ priority: v });
  }

  function handleEffortChange(v: number) {
    setEffort(v);
    emit({ effort: v });
  }

  function handleSubmit() {
    if (!title.trim()) return;
    const cleanTitle = token
      ? removeTriggerToken(title, token.start, token.end)
      : title;
    setTitle(cleanTitle);
    emit({ title: cleanTitle });
    onSubmit?.();
  }

  return (
    <div className={className}>
      <TitleInput
        ref={titleInputRef}
        autoFocus={autoFocus}
        value={title}
        highlight={token ? { start: token.start, end: token.end } : null}
        placeholder={titlePlaceholder}
        inputClassName="placeholder:text-muted-foreground/50 w-full bg-transparent text-lg font-medium focus:outline-none"
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
          if (e.key === 'Enter') handleSubmit();
          if (e.key === 'Escape') onCancel?.();
        }}
      />
      <RichTextEditor
        value={description}
        onChange={handleDescriptionChange}
        placeholder="Description"
        className="mt-1.5"
      />
      <TaskToolbar
        className="pt-2"
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
    </div>
  );
}
