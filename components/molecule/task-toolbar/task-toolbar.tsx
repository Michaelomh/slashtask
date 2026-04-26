'use client';

import { DueDateSelector } from '@/components/molecule/task-toolbar/due-date-selector';
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
import { EFFORTS } from '@/lib/effort';
import { PRIORITIES, PriorityValues } from '@/lib/priority';
import { Project } from '@/lib/project';
import { cn } from '@/lib/utils';
import { Flag, Inbox, Zap } from 'lucide-react';
import { RefObject } from 'react';
import { ProjectSelector } from './project-selector';
import { PrioritySelector } from './priority-selector';

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

  return (
    <div className={cn('relative', className)}>
      <div className="flex flex-wrap items-center gap-2">
        <ProjectSelector
          projects={projects}
          project={project}
          onProjectChange={onProjectChange}
          projectShortcut={projectShortcut}
        />

        <DueDateSelector value={effectiveDueDate} onChange={onDueDateChange} />

        <PrioritySelector
          priority={priority as PriorityValues}
          onPriorityChange={onPriorityChange}
        />

        {/* Priority */}
        <DropdownMenu open={priorityShortcut.isOpen}>
          <DropdownMenuTrigger
            className={cn(TOOLBAR_CLS, priority < 4 && selectedPriority.color)}
            onClick={() => priorityShortcut.setIsOpen(true)}
          >
            {PRIORITIES[selectedPriority.value].icon}
            {PRIORITIES[selectedPriority.value].label}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-40">
            {PRIORITIES.map((p) => (
              <DropdownMenuItem
                key={p.value}
                onClick={() => {
                  onPriorityChange(p.value);
                  priorityShortcut.setIsOpen(false);
                }}
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
