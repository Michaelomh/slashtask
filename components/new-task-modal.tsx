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
import { DatePicker } from '@/components/date-picker';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RichTextEditor } from '@/components/rich-text-editor';
import { Spinner } from '@/components/ui/spinner';
import { EFFORTS, PRIORITIES } from '@/lib/enums';
import { type Project } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Flag, Inbox, Zap } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const TOOLBAR_CLS =
  'border-border text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-sm transition-colors';

const TODAY = format(new Date(), 'yyyy-MM-dd');

export function NewTaskModal() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const dateParam = searchParams.get('date');
  const initialDate = dateParam ? new Date(dateParam + 'T00:00:00') : new Date();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionPlain, setDescriptionPlain] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(initialDate);
  const [priority, setPriority] = useState<number>(4);
  const [effort, setEffort] = useState<number>(2);
  const [project, setProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const defaultDateStr = dateParam ?? TODAY;
  const isDirty =
    title.trim() !== '' ||
    description.trim() !== '' ||
    priority !== 4 ||
    effort !== 2 ||
    project !== null ||
    dueDate === null ||
    (dueDate != null && format(dueDate, 'yyyy-MM-dd') !== defaultDateStr);

  const selectedEffort = EFFORTS.find((e) => e.value === effort)!;

  useEffect(() => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then((data) => setProjects(data))
      .catch(() => toast.error('Failed to load projects'))
      .finally(() => setLoadingProjects(false));
  }, []);

  function handleClose() {
    router.back();
  }

  function handleRequestClose() {
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      handleClose();
    }
  }

  async function handleSubmit() {
    if (!title.trim() || saving) return;
    setSaving(true);

    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim() || null,
        description_text: descriptionPlain.trim().slice(0, 500) || null,
        project_id: project?.id ?? null,
        priority,
        effort: 2,
        due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : null,
      }),
    });

    if (!res.ok) {
      toast.error('Failed to create task');
      setSaving(false);
      return;
    }

    router.back();
    router.refresh();
  }

  const selectedPriority = PRIORITIES.find((p) => p.value === priority)!;

  return (
    <>
      <Dialog
        open
        onOpenChange={(open) => {
          if (!open) handleRequestClose();
        }}
      >
        <DialogContent showCloseButton={false} className="gap-0 p-0 sm:max-w-lg">
          {/* Main input area */}
          <div className="px-4 pt-4 pb-3">
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit();
                if (e.key === 'Escape') handleRequestClose();
              }}
              placeholder="Task name"
              className="placeholder:text-muted-foreground/50 w-full bg-transparent text-lg font-medium focus:outline-none"
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
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {/* Project */}
              <DropdownMenu>
                <DropdownMenuTrigger className={TOOLBAR_CLS}>
                  {project ? (
                    <>
                      <span
                        className="font-bold"
                        style={{ color: project.color }}
                      >
                        {project.emoji}
                      </span>
                      {project.name}
                    </>
                  ) : (
                    <>
                      <Inbox className="size-3.5 shrink-0" />
                      No Project
                    </>
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {loadingProjects ? (
                    <div>
                      <Spinner />
                    </div>
                  ) : (
                    <>
                      <DropdownMenuItem
                        onClick={() => setProject(null)}
                        className="gap-2"
                      >
                        <Inbox className="size-3.5" />
                        No Project
                      </DropdownMenuItem>
                      {projects.map((p) => (
                        <DropdownMenuItem
                          key={p.id}
                          onClick={() => setProject(p)}
                          className="gap-2"
                          style={{ color: p.color }}
                        >
                          <span className="font-bold">{p.emoji}</span>
                          {p.name}
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <DatePicker value={dueDate} onChange={setDueDate} />

              {/* Priority */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={cn(
                    'border-border text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-sm transition-colors',
                    priority < 4 && selectedPriority.color
                  )}
                >
                  <Flag className="size-3.5 shrink-0" />
                  <span>{priority < 4 ? `P${priority}` : 'Priority'}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {PRIORITIES.map((p) => (
                    <DropdownMenuItem
                      key={p.value}
                      onClick={() => setPriority(p.value)}
                      className="gap-2"
                    >
                      <Flag className={cn('size-3.5', p.color)} />
                      {p.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Effort */}
              <DropdownMenu>
                <DropdownMenuTrigger className={TOOLBAR_CLS}>
                  <Zap className="size-3.5 shrink-0" />
                  {selectedEffort.label}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {EFFORTS.map((e) => (
                    <DropdownMenuItem
                      key={e.value}
                      onClick={() => setEffort(e.value)}
                    >
                      {e.dropdownValue}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Footer */}
          <div className="border-border flex items-center justify-end border-t px-4 py-3">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRequestClose}
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

      {/* ── Confirm discard ── */}
      <AlertDialog open={showDiscardConfirm} onOpenChange={setShowDiscardConfirm}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to discard them?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel size="sm">Keep editing</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              size="sm"
              onClick={handleClose}
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
