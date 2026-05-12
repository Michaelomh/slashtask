'use client';

import { ProjectInput } from '@/app/actions/projects';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Field, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Project } from '@/lib/project';
import { cn } from '@/lib/utils';
import { useForm } from '@tanstack/react-form';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { z } from 'zod';
import { DeleteConfirmationDialog } from './molecule/delete-confirmation-dialog';
import { useServerAction } from '@/hooks/use-server-action';

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  emoji: z.string(),
  color: z.string(),
});

const EMOJI_OPTIONS = [
  '💼',
  '🏠',
  '🏃',
  '📚',
  '💰',
  '🎯',
  '🎨',
  '🎵',
  '🚀',
  '💡',
  '🔧',
  '📊',
  '🌟',
  '❤️',
  '🎮',
  '🌍',
  '🍎',
  '☕',
  '🎁',
  '📝',
  '🔬',
  '🏋️',
  '✈️',
  '🎭',
  '📱',
  '💻',
  '🎓',
  '🏆',
  '🌱',
  '🔒',
  '📷',
  '🎪',
  '⚡',
  '🔥',
  '🌊',
  '🎸',
  '🏄',
  '🧠',
  '🦋',
  '🌈',
];

const COLOR_OPTIONS = [
  '#e74c3c',
  '#e67e22',
  '#f1c40f',
  '#27ae60',
  '#1abc9c',
  '#3498db',
  '#9b59b6',
  '#e91e63',
  '#ff5722',
  '#795548',
  '#607d8b',
  '#34495e',
];

type ProjectPayload = ProjectInput & { id?: string };

type ProjectFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  data?: Project;
  onSave: (data: ProjectPayload) => Promise<void>;
  onDelete?: () => Promise<void>;
};

export function ProjectFormDialog({
  open,
  onOpenChange,
  mode,
  data,
  onSave,
  onDelete,
}: ProjectFormDialogProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { isPending: isSaving, run: runSave } = useServerAction();
  const { isPending: isDeleting, run: runDelete } = useServerAction();

  const form = useForm({
    defaultValues: {
      name: data?.name ?? '',
      emoji: data?.emoji ?? '📁',
      color: data?.color ?? '#3498db',
    },
    validators: { onSubmit: projectSchema },
    onSubmit: async ({ value }) => {
      runSave(async () => {
        try {
          await onSave({
            id: mode === 'edit' && data ? data.id : undefined,
            name: value.name.trim(),
            emoji: value.emoji,
            color: value.color,
            order: data?.order ?? 0,
          });
          if (mode === 'create') form.reset();
          handleClose();
        } catch {
          // keep modal open on error
        }
      });
    },
  });

  function handleClose() {
    onOpenChange(false);
  }

  function handleDelete() {
    setShowDeleteConfirm(false);
    handleClose();
    runDelete(async () => {
      await onDelete?.();
    });
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(next) => onOpenChange(next)}>
        <DialogContent
          showCloseButton={false}
          className="gap-0 p-0 sm:max-w-sm"
        >
          {/* Form */}
          <div className="flex flex-col gap-5 p-5">
            <h2 className="font-semibold">
              {mode === 'create' ? 'Add project' : 'Edit project'}
            </h2>

            {/* Name */}
            <form.Field name="name">
              {(field) => (
                <Field
                  className="gap-1.5"
                  data-invalid={field.state.meta.errors.length > 0 || undefined}
                >
                  <label className="text-muted-foreground text-xs font-medium">
                    Name
                  </label>
                  <div className="flex items-center gap-2">
                    <form.Field name="emoji">
                      {(emojiField) => (
                        <span className="text-xl">
                          {emojiField.state.value}
                        </span>
                      )}
                    </form.Field>
                    <Input
                      autoFocus
                      id={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      onKeyDown={(e) =>
                        e.key === 'Enter' && form.handleSubmit()
                      }
                      placeholder="Project name"
                      className="flex-1"
                    />
                  </div>
                  <FieldError
                    errors={field.state.meta.errors.map((e) => ({
                      message: e?.message,
                    }))}
                  />
                </Field>
              )}
            </form.Field>

            {/* Emoji */}
            <form.Field name="emoji">
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted-foreground text-xs font-medium">
                    Emoji
                  </label>
                  <div className="grid grid-cols-8 gap-1">
                    {EMOJI_OPTIONS.map((e) => (
                      <button
                        key={e}
                        type="button"
                        onClick={() => field.handleChange(e)}
                        className={cn(
                          'hover:bg-muted flex h-8 w-8 items-center justify-center rounded-md text-base transition-colors',
                          field.state.value === e &&
                            'bg-accent ring-ring ring-2'
                        )}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </form.Field>

            {/* Color */}
            <form.Field name="color">
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted-foreground text-xs font-medium">
                    Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => field.handleChange(c)}
                        className={cn(
                          'h-6 w-6 rounded-full transition-transform hover:scale-110',
                          field.state.value === c &&
                            'ring-ring ring-offset-background ring-2 ring-offset-2'
                        )}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </form.Field>
          </div>

          {/* Footer */}
          <div
            className={cn(
              'border-border flex items-center border-t px-5 py-3',
              mode === 'edit' ? 'justify-between' : 'justify-end'
            )}
          >
            {mode === 'edit' && (
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-destructive gap-1.5"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="size-3.5" />
                Delete project
              </Button>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClose}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <form.Subscribe selector={(s) => s.canSubmit}>
                {(canSubmit) => (
                  <Button
                    size="sm"
                    disabled={!canSubmit || isSaving}
                    onClick={() => form.handleSubmit()}
                  >
                    {isSaving ? <Spinner size="sm" className="mr-1.5" /> : null}
                    {mode === 'create' ? 'Add project' : 'Save'}
                  </Button>
                )}
              </form.Subscribe>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        showDeleteConfirmationDialog={showDeleteConfirm}
        setShowDeleteConfirmationDialog={setShowDeleteConfirm}
        title="Are you sure?"
        description="All tasks under this project will be permanently deleted. This
            cannot be undone."
        isDeleting={isDeleting}
        handleDelete={handleDelete}
      />
    </>
  );
}
