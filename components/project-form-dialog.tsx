'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { type Project } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

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

type ProjectPayload = Omit<
  Project,
  'slug' | 'is_deleted' | 'user_id' | 'created_at' | 'updated_at'
>;

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  initialData?: Project;
  onSave: (data: ProjectPayload) => Promise<void>;
  onDelete?: () => Promise<void>;
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function handleClose() {
    onOpenChange(false);
  }

  function resetForm() {
    setName('');
    setEmoji('📁');
    setColor('#3498db');
  }

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    await onSave({
      id: mode === 'edit' && initialData ? initialData.id : crypto.randomUUID(),
      name: name.trim(),
      emoji,
      color,
      order: initialData?.order ?? 0,
    });
    setSaving(false);
    if (mode === 'create') resetForm();
    handleClose();
  }

  async function handleDelete() {
    setDeleting(true);
    await onDelete?.();
    setDeleting(false);
    setShowDeleteConfirm(false);
    handleClose();
  }

  function handleOpenChange(next: boolean) {
    if (next) {
      setName(initialData?.name ?? '');
      setEmoji(initialData?.emoji ?? '📁');
      setColor(initialData?.color ?? '#3498db');
    }
    onOpenChange(next);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="gap-0 p-0 sm:max-w-sm"
        >
          {/* ── Form ── */}
          <div className="flex flex-col gap-5 p-5">
            <h2 className="font-semibold">
              {mode === 'create' ? 'Add project' : 'Edit project'}
            </h2>

            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-muted-foreground text-xs font-medium">
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
              <label className="text-muted-foreground text-xs font-medium">
                Emoji
              </label>
              <div className="grid grid-cols-8 gap-1">
                {EMOJI_OPTIONS.map((e) => (
                  <button
                    key={e}
                    onClick={() => setEmoji(e)}
                    className={cn(
                      'hover:bg-muted flex h-8 w-8 items-center justify-center rounded-md text-base transition-colors',
                      emoji === e && 'bg-accent ring-ring ring-2'
                    )}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div className="flex flex-col gap-1.5">
              <label className="text-muted-foreground text-xs font-medium">
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={cn(
                      'h-6 w-6 rounded-full transition-transform hover:scale-110',
                      color === c &&
                        'ring-ring ring-offset-background ring-2 ring-offset-2'
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
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!name.trim() || saving}
                onClick={handleSave}
              >
                {saving ? <Spinner size="sm" className="mr-1.5" /> : null}
                {mode === 'create' ? 'Add project' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Confirm delete ── */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete &ldquo;{initialData?.name}&rdquo;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              All tasks under this project will be permanently deleted. This
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel size="sm" disabled={deleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? <Spinner size="sm" className="mr-1.5" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
