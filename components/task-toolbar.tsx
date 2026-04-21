'use client';

import { DatePicker } from '@/components/molecule/date-picker';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TaskToolbarDropdown } from '@/components/task-toolbar-dropdown';
import { useEffortShortcut } from '@/hooks/use-effort-shortcut';
import { useProjectShortcut } from '@/hooks/use-project-shortcut';
import { usePriorityShortcut } from '@/hooks/use-priority-shortcut';
import { EFFORTS, PRIORITIES } from '@/lib/enums';
import { Project } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Flag, Inbox, Zap } from 'lucide-react';
import { RefObject, useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';

const TOOLBAR_CLS =
  'border-border text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-sm transition-colors cursor-pointer';

type TaskToolbarProps = {
  projects: Project[];
  project: Project | null;
  onProjectChange: (p: Project | null) => void;
  effectiveDueDate: Date | null;
  onDueDateChange: (d: Date | null) => void;
  priority: number;
  onPriorityChange: (v: number) => void;
  effort: number;
  onEffortChange: (v: number) => void;
  title: string;
  onTitleChange: (v: string) => void;
  titleInputRef: RefObject<HTMLInputElement | null>;
  projectShortcut: ReturnType<typeof useProjectShortcut>;
  priorityShortcut: ReturnType<typeof usePriorityShortcut>;
  effortShortcut: ReturnType<typeof useEffortShortcut>;
  className?: string;
};

export function TaskToolbar({
  projects,
  project,
  onProjectChange,
  effectiveDueDate,
  onDueDateChange,
  priority,
  onPriorityChange,
  effort,
  onEffortChange,
  title,
  onTitleChange,
  titleInputRef,
  projectShortcut,
  priorityShortcut,
  effortShortcut,
  className,
}: TaskToolbarProps) {
  const selectedPriority =
    PRIORITIES.find((p) => p.value === priority) || PRIORITIES[3];
  const selectedEffort = EFFORTS.find((e) => e.value === effort) || EFFORTS[4];

  const [isProjectOpen, setIsProjectOpen] = useState(false);
  const projectWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isProjectOpen) return;
    function handleOutsideClick(e: MouseEvent) {
      if (!projectWrapperRef.current?.contains(e.target as Node)) {
        setIsProjectOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsProjectOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isProjectOpen]);

  const projectItems = [
    { id: '__none__', label: 'No Project' },
    ...projects.map((p) => ({
      id: p.id,
      label: p.name,
      icon: (
        <span className="font-bold" style={{ color: p.color }}>
          {p.emoji}
        </span>
      ),
    })),
  ];

  return (
    <div className={cn('relative', className)}>
      <div className="flex flex-wrap items-center gap-2">
        {/* Project */}
        <div ref={projectWrapperRef} className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsProjectOpen((v) => !v)}
          >
            {project ? (
              <>
                <span className="font-bold" style={{ color: project.color }}>
                  {project.emoji}
                </span>
                {project.name}
              </>
            ) : (
              'No Project'
            )}
          </Button>
          {isProjectOpen && (
            <TaskToolbarDropdown
              items={projectItems}
              highlightIndex={-1}
              onSelect={(i) => {
                const item = projectItems[i];
                onProjectChange(
                  item.id === '__none__'
                    ? null
                    : (projects.find((p) => p.id === item.id) ?? null)
                );
                setIsProjectOpen(false);
              }}
            />
          )}
        </div>

        <DatePicker value={effectiveDueDate} onChange={onDueDateChange} />

        {/* Priority */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(TOOLBAR_CLS, priority < 4 && selectedPriority.color)}
          >
            {PRIORITIES[selectedPriority.value].icon}
            {PRIORITIES[selectedPriority.value].label}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-40">
            {PRIORITIES.map((p) => (
              <DropdownMenuItem
                key={p.value}
                onClick={() => onPriorityChange(p.value)}
                className="gap-2"
              >
                <b>{p.label}</b> ({p.description})
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Effort */}
        <DropdownMenu>
          <DropdownMenuTrigger className={TOOLBAR_CLS}>
            {EFFORTS[selectedEffort.value].icon}
            {EFFORTS[selectedEffort.value].label}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {EFFORTS.map((e) => (
              <DropdownMenuItem
                key={e.value}
                onClick={() => onEffortChange(e.value)}
              >
                {e.icon}
                {e.dropdownValue}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Shortcut dropdowns */}
      {projectShortcut.isOpen && (
        <TaskToolbarDropdown
          items={projectShortcut.filteredProjects.map((p) => ({
            id: p.id,
            label: p.name,
            icon: p.emoji ? (
              <span className="font-bold" style={{ color: p.color }}>
                {p.emoji}
              </span>
            ) : (
              <Inbox className="size-3 shrink-0" />
            ),
          }))}
          highlightIndex={projectShortcut.highlightIndex}
          onSelect={(i) => {
            const result = projectShortcut.confirmAt(i, title);
            if (result) {
              onTitleChange(result.newTitle);
              onProjectChange(result.project);
            }
            titleInputRef.current?.focus();
          }}
        />
      )}
      {priorityShortcut.isOpen && (
        <TaskToolbarDropdown
          items={priorityShortcut.filteredItems.map((item) => ({
            id: item.id,
            label: item.label,
            icon: <Flag className={cn('size-3', item.color)} />,
          }))}
          highlightIndex={priorityShortcut.highlightIndex}
          onSelect={(i) => {
            const result = priorityShortcut.confirmAt(i, title);
            if (result) {
              onTitleChange(result.newTitle);
              onPriorityChange(result.value);
            }
            titleInputRef.current?.focus();
          }}
        />
      )}
      {effortShortcut.isOpen && (
        <TaskToolbarDropdown
          items={effortShortcut.filteredItems.map((item) => ({
            id: item.id,
            label: item.label,
            icon: <Zap className="size-3 shrink-0" />,
          }))}
          highlightIndex={effortShortcut.highlightIndex}
          onSelect={(i) => {
            const result = effortShortcut.confirmAt(i, title);
            if (result) {
              onTitleChange(result.newTitle);
              onEffortChange(result.value);
            }
            titleInputRef.current?.focus();
          }}
        />
      )}
    </div>
  );
}
