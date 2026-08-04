'use client';

import { RichTextEditor } from '@/components/molecule/rich-text-editor';
import { TaskToolbar } from '@/components/molecule/task-toolbar/task-toolbar';
import { TitleInput } from '@/components/title-input';
import { DEFAULT_EFFORT_INDEX } from '@/lib/effort';
import { DEFAULT_PRIORITY_INDEX } from '@/lib/priority';
import { Project } from '@/lib/project';
import { cn } from '@/lib/utils';
import { useForm } from '@tanstack/react-form';
import { forwardRef, useImperativeHandle } from 'react';
import { z } from 'zod';

export type TaskEditorValues = {
  title: string;
  description: string;
  descriptionPlain: string;
  priority: number;
  effort: number;
  project: Project | null;
  dueDate: Date | null;
};

export const INITIAL_EMPTY_TASK: TaskEditorValues = {
  title: '',
  description: '',
  descriptionPlain: '',
  priority: DEFAULT_PRIORITY_INDEX,
  effort: DEFAULT_EFFORT_INDEX,
  project: null,
  dueDate: null,
};

const taskEditorSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  descriptionPlain: z.string(),
  priority: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
  effort: z.union([
    z.literal(0),
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
  ]),
  project: z.custom<Project | null>(),
  dueDate: z.date().nullable(),
});

export type TaskEditorHandle = {
  submit: () => void;
  reset: (values?: Partial<TaskEditorValues>) => void;
};

type TaskEditorProps = {
  initialValues?: Partial<TaskEditorValues>;
  onSubmit?: (values: TaskEditorValues) => void;
  onTitleChange?: (title: string) => void;
  onCancel?: () => void;
  autoFocus?: boolean;
  titlePlaceholder?: string;
  className?: string;
  isSubTask?: boolean;
};

export const TaskEditor = forwardRef<TaskEditorHandle, TaskEditorProps>(
  function TaskEditor(
    {
      initialValues,
      onSubmit: onSubmitProp,
      onTitleChange,
      onCancel,
      autoFocus,
      titlePlaceholder = 'Task name',
      className,
      isSubTask = false,
    },
    ref
  ) {
    const form = useForm({
      defaultValues: {
        title: initialValues?.title ?? '',
        description: initialValues?.description ?? '',
        descriptionPlain: initialValues?.descriptionPlain ?? '',
        priority: initialValues?.priority ?? DEFAULT_PRIORITY_INDEX,
        effort: initialValues?.effort ?? DEFAULT_EFFORT_INDEX,
        project: (initialValues?.project ?? null) as Project | null,
        dueDate: (initialValues?.dueDate ?? null) as Date | null,
      },
      validators: { onSubmit: taskEditorSchema },
      onSubmit: ({ value }) => {
        onSubmitProp?.(value as TaskEditorValues);
      },
    });

    useImperativeHandle(ref, () => ({
      submit: () => form.handleSubmit(),
      reset: (values) => form.reset({ ...INITIAL_EMPTY_TASK, ...values }),
    }));

    return (
      <div className={cn('flex flex-col gap-2', className)}>
        <form.Field name="title">
          {(field) => (
            <TitleInput
              autoFocus={autoFocus}
              value={field.state.value}
              placeholder={titlePlaceholder}
              inputClassName="placeholder:text-muted-foreground/50 w-full bg-transparent text-lg font-medium focus:outline-none"
              onChange={(e) => {
                field.handleChange(e.target.value);
                onTitleChange?.(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') form.handleSubmit();
                if (e.key === 'Escape') onCancel?.();
              }}
            />
          )}
        </form.Field>
        <form.Field name="description">
          {(field) => (
            <RichTextEditor
              value={field.state.value}
              onChange={(markdown, plainText) => {
                field.handleChange(markdown);
                form.setFieldValue('descriptionPlain', plainText);
              }}
              placeholder="Description"
            />
          )}
        </form.Field>
        <form.Field name="project">
          {(projectField) => (
            <form.Field name="dueDate">
              {(dueDateField) => (
                <form.Field name="priority">
                  {(priorityField) => (
                    <form.Field name="effort">
                      {(effortField) => (
                        <TaskToolbar
                          project={projectField.state.value}
                          onProjectChange={projectField.handleChange}
                          dueDate={dueDateField.state.value}
                          onDueDateChange={dueDateField.handleChange}
                          priority={priorityField.state.value}
                          onPriorityChange={priorityField.handleChange}
                          effort={effortField.state.value}
                          onEffortChange={effortField.handleChange}
                          isSubTask={isSubTask}
                        />
                      )}
                    </form.Field>
                  )}
                </form.Field>
              )}
            </form.Field>
          )}
        </form.Field>
      </div>
    );
  }
);
