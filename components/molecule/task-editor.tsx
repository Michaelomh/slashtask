'use client';

import { RichTextEditor } from '@/components/molecule/rich-text-editor';
import { TaskToolbar } from '@/components/molecule/task-toolbar/task-toolbar';
import { TitleInput } from '@/components/title-input';
import { Project } from '@/lib/project';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { DEFAULT_PRIORITY_INDEX } from '@/lib/priority';
import { DEFAULT_EFFORT_INDEX } from '@/lib/effort';

export type TaskEditorValues = {
  title: string;
  description: string;
  descriptionPlain: string;
  priority: number;
  effort: number;
  project: Project | null;
  dueDate: Date | null;
};

export const INITIAL_EMPTY_TASK = {
  title: '',
  description: '',
  descriptionPlain: '',
  priority: DEFAULT_PRIORITY_INDEX,
  effort: DEFAULT_EFFORT_INDEX,
  project: null,
  dueDate: null,
};

type TaskEditorProps = {
  initialValues?: Partial<TaskEditorValues>;
  onChange: (values: TaskEditorValues) => void;
  onSubmit?: () => void;
  onCancel?: () => void;
  autoFocus?: boolean;
  titlePlaceholder?: string;
  className?: string;
};

export function TaskEditor({
  initialValues,
  onChange,
  onSubmit,
  onCancel,
  autoFocus,
  titlePlaceholder = 'Task name',
  className,
}: TaskEditorProps) {
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [description, setDescription] = useState(
    initialValues?.description ?? ''
  );
  const [descriptionPlain, setDescriptionPlain] = useState(
    initialValues?.descriptionPlain ?? ''
  );
  const [dueDate, setDueDate] = useState<Date | null>(
    initialValues?.dueDate ?? null
  );
  const [priority, setPriority] = useState(
    initialValues?.priority ?? DEFAULT_PRIORITY_INDEX
  );
  const [effort, setEffort] = useState(
    initialValues?.effort ?? DEFAULT_EFFORT_INDEX
  );
  const [project, setProject] = useState<Project | null>(
    initialValues?.project ?? null
  );

  // Fires onChange with current state, applying any in-flight overrides to avoid stale closures.
  function handleOnChange(overrides: Partial<TaskEditorValues> = {}) {
    onChange({
      title,
      description,
      descriptionPlain,
      priority,
      effort,
      project,
      dueDate,
      ...overrides,
    });
  }

  function handleTitleChange(val: string) {
    setTitle(val);
    handleOnChange({ title: val });
  }

  function handleDescriptionChange(
    description: string,
    descriptionPlain: string
  ) {
    setDescription(description);
    setDescriptionPlain(descriptionPlain);
    handleOnChange({ description, descriptionPlain });
  }

  function handleProjectChange(project: Project | null) {
    setProject(project);
    handleOnChange({ project });
  }

  function handleDueDateChange(dueDate: Date | null) {
    setDueDate(dueDate);
    handleOnChange({ dueDate });
  }

  function handlePriorityChange(priority: number) {
    setPriority(priority);
    handleOnChange({ priority });
  }

  function handleEffortChange(effort: number) {
    setEffort(effort);
    handleOnChange({ effort });
  }

  function handleSubmit() {
    if (!title.trim()) return;
    setTitle(title);
    onSubmit?.();
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <TitleInput
        autoFocus={autoFocus}
        value={title}
        placeholder={titlePlaceholder}
        inputClassName="placeholder:text-muted-foreground/50 w-full bg-transparent text-lg font-medium focus:outline-none"
        onChange={(e) => {
          const val = e.target.value;
          handleTitleChange(val);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSubmit();
          if (e.key === 'Escape') onCancel?.();
        }}
      />
      <RichTextEditor
        value={description}
        onChange={handleDescriptionChange}
        placeholder="Description"
      />
      <TaskToolbar
        project={project}
        onProjectChange={handleProjectChange}
        dueDate={dueDate}
        onDueDateChange={handleDueDateChange}
        priority={priority}
        onPriorityChange={handlePriorityChange}
        effort={effort}
        onEffortChange={handleEffortChange}
      />
    </div>
  );
}
