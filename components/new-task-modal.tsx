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
import { mockProjects, type Project } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { ChevronDown, Flag, Inbox } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const PRIORITIES = [
  { value: 1 as const, label: 'Priority 1', color: 'text-red-500' },
  { value: 2 as const, label: 'Priority 2', color: 'text-orange-500' },
  { value: 3 as const, label: 'Priority 3', color: 'text-blue-500' },
  { value: 4 as const, label: 'Priority 4', color: 'text-muted-foreground' },
];

export function NewTaskModal() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [priority, setPriority] = useState<1 | 2 | 3 | 4>(4);
  const [project, setProject] = useState<Project | null>(null);

  function handleClose() {
    router.back();
  }

  function handleSubmit() {
    if (!title.trim()) return;
    // Wire to DB later
    handleClose();
  }

  const selectedPriority = PRIORITIES.find((p) => p.value === priority)!;

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) handleClose();
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
              if (e.key === 'Escape') handleClose();
            }}
            placeholder="Task name"
            className="placeholder:text-muted-foreground/50 w-full bg-transparent text-lg font-medium focus:outline-none"
          />
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            rows={2}
            className="placeholder:text-muted-foreground/40 mt-1.5 resize-none border-none bg-transparent text-sm shadow-none focus-visible:ring-0"
          />

          {/* Toolbar */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
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
          </div>
        </div>

        {/* Footer */}
        <div className="border-border flex items-center justify-between border-t px-4 py-3">
          <DropdownMenu>
            <DropdownMenuTrigger className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm">
              {project ? (
                <>
                  <span className="font-bold" style={{ color: project.color }}>
                    #
                  </span>
                  {project.name}
                </>
              ) : (
                <>
                  <Inbox className="size-3.5 shrink-0" />
                  No Project
                </>
              )}
              <ChevronDown className="size-3 opacity-60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem
                onClick={() => setProject(null)}
                className="gap-2"
              >
                <Inbox className="size-3.5" />
                No Project
              </DropdownMenuItem>
              {mockProjects.map((p) => (
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
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleClose}>
              Cancel
            </Button>
            <Button size="sm" disabled={!title.trim()} onClick={handleSubmit}>
              Add task
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
