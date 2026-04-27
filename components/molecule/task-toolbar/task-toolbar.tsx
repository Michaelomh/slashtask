'use client';

import { DueDateSelector } from '@/components/molecule/task-toolbar/due-date-selector';
import { EFFORTS, EffortValues } from '@/lib/effort';
import { PRIORITIES, PriorityValues } from '@/lib/priority';
import { Project } from '@/lib/project';
import { cn } from '@/lib/utils';
import { ProjectSelector } from './project-selector';
import { PrioritySelector } from './priority-selector';
import { EffortSelector } from './effort-selector';

// const TOOLBAR_CLS =
// 'border-border text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-sm transition-colors cursor-pointer';

type TaskToolbarProps = {
  projects: Project[];
  project: Project | null;
  onProjectChange: (p: Project | null) => void;
  dueDate: Date | null;
  onDueDateChange: (d: Date | null) => void;
  priority: number;
  onPriorityChange: (v: number) => void;
  effort: number;
  onEffortChange: (v: number) => void;
  className?: string;
};

export function TaskToolbar({
  projects,
  project,
  onProjectChange,
  dueDate,
  onDueDateChange,
  priority,
  onPriorityChange,
  effort,
  onEffortChange,
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
        />

        <DueDateSelector value={dueDate} onChange={onDueDateChange} />

        <PrioritySelector
          priority={priority as PriorityValues}
          onPriorityChange={onPriorityChange}
        />

        <EffortSelector
          effort={effort as EffortValues}
          onEffortChange={onEffortChange}
        />
      </div>
    </div>
  );
}
