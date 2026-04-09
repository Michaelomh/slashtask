'use client';

import { DatePicker } from '@/components/date-picker';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { type Project, type Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Flag,
  Trash2,
  X,
  Zap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

const PRIORITIES = [
  { value: 1 as const, label: 'P1 — Urgent', color: 'text-red-500' },
  { value: 2 as const, label: 'P2 — High', color: 'text-orange-500' },
  { value: 3 as const, label: 'P3 — Medium', color: 'text-blue-500' },
  { value: 4 as const, label: 'P4 — Low', color: 'text-muted-foreground' },
];

const EFFORTS = [
  { value: 1 as const, label: 'XS — 15 min' },
  { value: 2 as const, label: 'S — 30 min' },
  { value: 3 as const, label: 'M — 1–2 hrs' },
  { value: 4 as const, label: 'L — half day+' },
];

interface TaskDetailModalProps {
  task: Task;
  allTasks: Task[];
  projects: Project[];
}

export function TaskDetailModal({ task, allTasks, projects }: TaskDetailModalProps) {
  const router = useRouter();
  const [completed, setCompleted] = useState(task.is_completed);
  const [title, setTitle] = useState(task.title);
  const [dueDate, setDueDate] = useState<Date | null>(
    task.due_date ? new Date(task.due_date + 'T00:00:00') : null
  );
  const [priority, setPriority] = useState<1 | 2 | 3 | 4>(task.priority);
  const [effort, setEffort] = useState<1 | 2 | 3 | 4>(task.effort);
  const [project, setProject] = useState(
    projects.find((p) => p.id === task.project_id) ?? null
  );
  const [deleting, setDeleting] = useState(false);

  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const incompleteTasks = allTasks.filter((t) => !t.is_completed);
  const currentIndex = incompleteTasks.findIndex((t) => t.id === task.id);
  const prevTask = currentIndex > 0 ? incompleteTasks[currentIndex - 1] : null;
  const nextTask =
    currentIndex < incompleteTasks.length - 1
      ? incompleteTasks[currentIndex + 1]
      : null;

  function handleClose() {
    router.back();
  }

  async function patch(body: Record<string, unknown>) {
    const res = await fetch(`/api/tasks/${task.id}`, {
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

  function scheduleSave(body: Record<string, unknown>) {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => patch(body), 600);
  }

  async function handleToggleComplete() {
    const next = !completed;
    setCompleted(next);
    await patch({ is_completed: next });
  }

  function handleTitleChange(value: string) {
    setTitle(value);
    scheduleSave({ title: value });
  }

  async function handleDueDateChange(date: Date | null) {
    setDueDate(date);
    const due_date = date
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      : null;
    await patch({ due_date });
  }

  async function handlePriorityChange(value: 1 | 2 | 3 | 4) {
    setPriority(value);
    await patch({ priority: value });
  }

  async function handleEffortChange(value: 1 | 2 | 3 | 4) {
    setEffort(value);
    await patch({ effort: value });
  }

  async function handleProjectChange(p: Project | null) {
    setProject(p);
    await patch({ project_id: p?.id ?? null });
  }

  async function handleDelete() {
    setDeleting(true);
    const res = await fetch(`/api/tasks/${task.id}`, { method: 'DELETE' });
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
      <DialogContent
        showCloseButton={false}
        className="max-h-[90dvh] gap-0 overflow-hidden p-0 sm:max-w-3xl"
      >
        {/* Header */}
        <div className="border-border flex items-center justify-between border-b px-4 py-3">
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            {project && (
              <>
                <span className="font-bold" style={{ color: project.color }}>
                  #
                </span>
                <span>{project.name}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={!prevTask}
              onClick={() => prevTask && router.replace(`/task/${prevTask.id}`)}
            >
              <ChevronUp className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={!nextTask}
              onClick={() => nextTask && router.replace(`/task/${nextTask.id}`)}
            >
              <ChevronDown className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleDelete}
              disabled={deleting}
              className="text-muted-foreground hover:text-destructive"
            >
              {deleting ? (
                <Spinner size="sm" />
              ) : (
                <Trash2 className="size-4" />
              )}
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={handleClose}>
              <X className="size-4" />
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col overflow-y-auto sm:max-h-[70dvh] sm:flex-row">
          {/* Left — main content */}
          <div className="flex flex-1 flex-col gap-4 px-6 py-5">
            <div className="flex items-start gap-3">
              <button
                onClick={handleToggleComplete}
                className="text-muted-foreground/50 hover:text-primary mt-1 shrink-0 transition-colors"
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
                  'w-full bg-transparent text-xl font-semibold leading-tight focus:outline-none',
                  completed && 'text-muted-foreground line-through'
                )}
              />
            </div>

            <Textarea
              placeholder="Description"
              defaultValue={task.description_text ?? ''}
              rows={4}
              className="placeholder:text-muted-foreground/40 resize-none border-none bg-transparent text-sm shadow-none focus-visible:ring-0"
            />

            <button className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm">
              <span className="text-lg leading-none">+</span>
              Add sub-task
            </button>
          </div>

          {/* Right — metadata */}
          <div className="border-border flex flex-col border-t sm:w-56 sm:shrink-0 sm:border-t-0 sm:border-l">
            <MetaRow label="Project">
              <DropdownMenu>
                <DropdownMenuTrigger className="hover:text-foreground flex items-center gap-1.5 text-sm">
                  {project ? (
                    <>
                      <span
                        className="font-bold"
                        style={{ color: project.color }}
                      >
                        #
                      </span>
                      {project.name}
                    </>
                  ) : (
                    <span className="text-muted-foreground">None</span>
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => handleProjectChange(null)}>
                    No project
                  </DropdownMenuItem>
                  {projects.map((p) => (
                    <DropdownMenuItem
                      key={p.id}
                      onClick={() => handleProjectChange(p)}
                      className="gap-2"
                    >
                      <span className="font-bold" style={{ color: p.color }}>
                        #
                      </span>
                      {p.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </MetaRow>

            <MetaRow label="Date">
              <DatePicker value={dueDate} onChange={handleDueDateChange} />
            </MetaRow>

            <MetaRow label="Priority">
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={cn(
                    'hover:text-foreground flex items-center gap-1.5 text-sm',
                    selectedPriority.color
                  )}
                >
                  <Flag className="size-3.5 shrink-0" />
                  {selectedPriority.label.split(' — ')[0]}
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
            </MetaRow>

            <MetaRow label="Effort">
              <DropdownMenu>
                <DropdownMenuTrigger className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm">
                  <Zap className="size-3.5 shrink-0" />
                  {selectedEffort.label}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {EFFORTS.map((e) => (
                    <DropdownMenuItem
                      key={e.value}
                      onClick={() => handleEffortChange(e.value)}
                    >
                      {e.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </MetaRow>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MetaRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-border flex flex-col gap-1 border-b px-4 py-3 last:border-b-0">
      <span className="text-muted-foreground text-xs font-medium">{label}</span>
      <div className="text-sm">{children}</div>
    </div>
  );
}
