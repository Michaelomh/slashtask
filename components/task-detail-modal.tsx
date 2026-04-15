'use client';

import { DatePicker } from '@/components/date-picker';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { EFFORTS, PRIORITIES } from '@/lib/enums';
import { type Project, type Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, Flag, Inbox, Trash2, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const TOOLBAR_CLS =
  'border-border text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-sm transition-colors';

interface TaskDetailModalProps {
  id: string;
}

export function TaskDetailModal({ id }: TaskDetailModalProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState<Task | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);

  const [completed, setCompleted] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [priority, setPriority] = useState<number>(4);
  const [effort, setEffort] = useState<number>(2);
  const [project, setProject] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [isSavingTask, setSavingTask] = useState(false);

  const titleDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const descDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/tasks/${id}`).then((r) => r.json()),
      fetch('/api/projects').then((r) => r.json()),
    ])
      .then(([taskData, projectsData]) => {
        setTask(taskData);
        setProjects(projectsData);
        setCompleted(taskData.is_completed);
        setTitle(taskData.title);
        setDescription(taskData.description ?? '');
        setDueDate(
          taskData.due_date ? new Date(taskData.due_date + 'T00:00:00') : null
        );
        setPriority(taskData.priority);
        setEffort(taskData.effort);
        setProject(
          projectsData.find((p: Project) => p.id === taskData.project_id) ??
            null
        );
      })
      .catch(() => toast.error('Failed to load task'))
      .finally(() => setLoading(false));
  }, [id]);

  function handleClose() {
    router.back();
  }

  async function patch(body: Record<string, unknown>) {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      toast.error('Failed to save changes');
    } else {
      router.refresh();
    }
  }

  function handleTitleChange(value: string) {
    setTitle(value);
    if (titleDebounce.current) clearTimeout(titleDebounce.current);
    titleDebounce.current = setTimeout(async () => {
      setSavingTask(true);
      await patch({ title: value });
      setSavingTask(false);
    }, 500);
  }

  function handleDescriptionChange(value: string) {
    setDescription(value);
    if (descDebounce.current) clearTimeout(descDebounce.current);
    descDebounce.current = setTimeout(async () => {
      setSavingTask(true);
      await patch({
        description: value,
        description_text: value.slice(0, 500),
      });
      setSavingTask(false);
    }, 500);
  }

  async function handleDueDateChange(date: Date | null) {
    setDueDate(date);
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

  async function handleToggleComplete() {
    const next = !completed;
    setCompleted(next);
    setSavingTask(true);
    await patch({ is_completed: next });
    setSavingTask(false);
  }

  async function handleDelete() {
    setDeleting(true);
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      toast.error('Failed to delete task');
      setDeleting(false);
      return;
    }
    router.back();
    router.refresh();
  }

  const selectedPriority = PRIORITIES.find((p) => p.value === priority)!;
  const selectedEffort = EFFORTS.find((e) => e.value === effort)!;

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent showCloseButton={false} className="gap-0 p-0 sm:max-w-lg">
        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-3">
          {loading ? (
            <>
              <div className="mb-4 flex items-start gap-3">
                <Skeleton className="mt-0.5 size-5 shrink-0 rounded-full" />
                <Skeleton className="h-6 w-3/4 rounded" />
              </div>
              <Skeleton className="mb-1.5 h-4 w-full rounded" />
              <Skeleton className="mb-1.5 h-4 w-5/6 rounded" />
              <Skeleton className="mb-4 h-4 w-2/3 rounded" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-24 rounded-md" />
                <Skeleton className="h-8 w-20 rounded-md" />
                <Skeleton className="h-8 w-20 rounded-md" />
                <Skeleton className="h-8 w-24 rounded-md" />
              </div>
            </>
          ) : (
            <>
              {/* Title row */}
              <div className="flex items-start gap-3">
                <button
                  onClick={handleToggleComplete}
                  className="text-muted-foreground/50 hover:text-primary mt-0.5 shrink-0 transition-colors"
                >
                  {completed ? (
                    <CheckCircle2 className="text-primary size-5" />
                  ) : (
                    <Circle className="size-5" />
                  )}
                </button>
                <input
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className={cn(
                    'placeholder:text-muted-foreground/50 w-full bg-transparent text-lg font-medium focus:outline-none',
                    completed && 'text-muted-foreground line-through'
                  )}
                />
              </div>

              {/* Description */}
              <Textarea
                placeholder="Description"
                value={description}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                rows={4}
                className="placeholder:text-muted-foreground/40 mt-1.5 resize-none border-none bg-transparent text-sm shadow-none focus-visible:ring-0"
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
                    <DropdownMenuItem
                      onClick={() => handleProjectChange(null)}
                      className="gap-2"
                    >
                      <Inbox className="size-3.5" />
                      No Project
                    </DropdownMenuItem>
                    {projects.map((p) => (
                      <DropdownMenuItem
                        key={p.id}
                        onClick={() => handleProjectChange(p)}
                        className="gap-2"
                        style={{ color: p.color }}
                      >
                        <span className="font-bold">{p.emoji}</span>
                        {p.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Due Date */}
                <DatePicker value={dueDate} onChange={handleDueDateChange} />

                {/* Priority */}
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className={cn(
                      TOOLBAR_CLS,
                      priority < 4 && selectedPriority.color
                    )}
                  >
                    <Flag className="size-3.5 shrink-0" />
                    {priority < 4 ? `P${priority}` : 'Priority'}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {PRIORITIES.map((p) => (
                      <DropdownMenuItem
                        key={p.value}
                        onClick={() => handlePriorityChange(p.value)}
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
                        onClick={() => handleEffortChange(e.value)}
                      >
                        {e.dropdownValue}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-border flex items-center justify-between border-t px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={loading || deleting}
            className="text-muted-foreground hover:text-destructive gap-1.5"
          >
            {deleting ? <Spinner size="sm" /> : <Trash2 className="size-3.5" />}
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
  );
}
