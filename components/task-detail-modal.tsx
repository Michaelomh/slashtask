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
import { Textarea } from '@/components/ui/textarea';
import { mockProjects, type Task } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Flag,
  MoreHorizontal,
  X,
  Zap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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
}

export function TaskDetailModal({ task, allTasks }: TaskDetailModalProps) {
  const router = useRouter();
  const [completed, setCompleted] = useState(task.is_completed);
  const [dueDate, setDueDate] = useState<Date | null>(
    task.due_date ? new Date(task.due_date + 'T00:00:00') : null
  );
  const [priority, setPriority] = useState<1 | 2 | 3 | 4>(task.priority);
  const [effort, setEffort] = useState<1 | 2 | 3 | 4>(task.effort);
  const [project, setProject] = useState(
    mockProjects.find((p) => p.id === task.project_id) ?? null
  );

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
            <Button variant="ghost" size="icon-sm">
              <MoreHorizontal className="size-4" />
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
                onClick={() => setCompleted((v) => !v)}
                className="text-muted-foreground/50 hover:text-primary mt-1 shrink-0 transition-colors"
              >
                {completed ? (
                  <CheckCircle2 className="text-primary size-5" />
                ) : (
                  <Circle className="size-5" />
                )}
              </button>
              <h2
                className={cn(
                  'text-xl leading-tight font-semibold',
                  completed && 'text-muted-foreground line-through'
                )}
              >
                {task.title}
              </h2>
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
                  <DropdownMenuItem onClick={() => setProject(null)}>
                    No project
                  </DropdownMenuItem>
                  {mockProjects.map((p) => (
                    <DropdownMenuItem
                      key={p.id}
                      onClick={() => setProject(p)}
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
              <DatePicker value={dueDate} onChange={setDueDate} />
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
                      onClick={() => setPriority(p.value)}
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
                      onClick={() => setEffort(e.value)}
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
