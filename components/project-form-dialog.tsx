'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { type Project } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const EMOJI_OPTIONS = [
  '💼', '🏠', '🏃', '📚', '💰', '🎯', '🎨', '🎵',
  '🚀', '💡', '🔧', '📊', '🌟', '❤️', '🎮', '🌍',
  '🍎', '☕', '🎁', '📝', '🔬', '🏋️', '✈️', '🎭',
  '📱', '💻', '🎓', '🏆', '🌱', '🔒', '📷', '🎪',
  '⚡', '🔥', '🌊', '🎸', '🏄', '🧠', '🦋', '🌈',
];

const COLOR_OPTIONS = [
  '#e74c3c', '#e67e22', '#f1c40f', '#27ae60',
  '#1abc9c', '#3498db', '#9b59b6', '#e91e63',
  '#ff5722', '#795548', '#607d8b', '#34495e',
];

function toKebabCase(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  initialData?: Project;
  onSave: (data: Omit<Project, 'taskCount'>) => void;
  onDelete?: () => void;
}

export function ProjectFormDialog({
  open,
  onOpenChange,
  mode,
  initialData,
  onSave,
  onDelete,
}: ProjectFormDialogProps) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [emoji, setEmoji] = useState(initialData?.emoji ?? '📁');
  const [color, setColor] = useState(initialData?.color ?? '#3498db');
  const [showConfirm, setShowConfirm] = useState(false);

  function handleClose() {
    onOpenChange(false);
    setShowConfirm(false);
  }

  function handleSave() {
    if (!name.trim()) return;
    onSave({
      id: mode === 'edit' && initialData ? initialData.id : toKebabCase(name),
      name: name.trim(),
      emoji,
      color,
      order: initialData?.order ?? 0,
    });
    handleClose();
  }

  function handleDelete() {
    onDelete?.();
    handleClose();
  }

  // Reset state when dialog opens with new data
  function handleOpenChange(next: boolean) {
    if (next) {
      setName(initialData?.name ?? '');
      setEmoji(initialData?.emoji ?? '📁');
      setColor(initialData?.color ?? '#3498db');
      setShowConfirm(false);
    }
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={false} className="gap-0 p-0 sm:max-w-sm">
        {showConfirm ? (
          /* ── Confirm delete ── */
          <div className="flex flex-col gap-4 p-6">
            <div className="flex flex-col gap-1.5">
              <h2 className="font-semibold">Delete &ldquo;{initialData?.name}&rdquo;?</h2>
              <p className="text-sm text-muted-foreground">
                All tasks under this project will be permanently deleted. This
                cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        ) : (
          /* ── Form ── */
          <>
            <div className="flex flex-col gap-5 p-5">
              <h2 className="font-semibold">
                {mode === 'create' ? 'Add project' : 'Edit project'}
              </h2>

              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Name
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{emoji}</span>
                  <Input
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    placeholder="Project name"
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Emoji */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Emoji
                </label>
                <div className="grid grid-cols-8 gap-1">
                  {EMOJI_OPTIONS.map((e) => (
                    <button
                      key={e}
                      onClick={() => setEmoji(e)}
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-md text-base transition-colors hover:bg-muted',
                        emoji === e && 'bg-accent ring-2 ring-ring'
                      )}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={cn(
                        'h-6 w-6 rounded-full transition-transform hover:scale-110',
                        color === c && 'ring-2 ring-ring ring-offset-2 ring-offset-background'
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              className={cn(
                'flex items-center border-t border-border px-5 py-3',
                mode === 'edit' ? 'justify-between' : 'justify-end'
              )}
            >
              {mode === 'edit' && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowConfirm(true)}
                >
                  Delete project
                </Button>
              )}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleClose}>
                  Cancel
                </Button>
                <Button size="sm" disabled={!name.trim()} onClick={handleSave}>
                  {mode === 'create' ? 'Add project' : 'Save'}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
