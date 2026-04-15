'use client';

import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { type Task, type Project } from '@/lib/types';
import {
  formatDateHeading,
  type TaskGroup,
} from '@/lib/task-grouping';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { DraggableTaskItem, SortableTaskItem } from './sortable-task-item';


interface OverdueGroupProps {
  tasks: Task[];
  projects: Project[];
}

export function OverdueGroup({ tasks, projects }: OverdueGroupProps) {
  if (tasks.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-destructive text-sm font-semibold">Overdue</h2>
        <div className="bg-border h-px flex-1" />
      </div>

      <div className="flex flex-col">
        {tasks.map((task) => {
          const project =
            projects.find((p) => p.id === task.project_id) ?? null;
          return (
            <DraggableTaskItem key={task.id} task={task} project={project} />
          );
        })}
      </div>
    </div>
  );
}

interface DateGroupProps {
  group: TaskGroup;
  projects: Project[];
}

export function DateGroup({ group, projects }: DateGroupProps) {
  const { label, isOverdue } = formatDateHeading(group.date);
  const { setNodeRef, isOver } = useDroppable({ id: group.date });
  const taskIds = group.tasks.map((t) => t.id);

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center gap-2">
        <h2
          className={`text-sm font-semibold ${isOverdue ? 'text-destructive' : 'text-foreground'}`}
        >
          {label}
        </h2>
        <div className="bg-border h-px flex-1" />
      </div>

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`flex flex-col rounded transition-colors ${isOver ? 'bg-accent/30' : ''}`}
        >
          {group.tasks.map((task) => {
            const project =
              projects.find((p) => p.id === task.project_id) ?? null;
            return (
              <SortableTaskItem
                key={task.id}
                task={task}
                project={project}
                containerId={group.date}
              />
            );
          })}
          {/* Spacer so empty groups remain droppable */}
          {group.tasks.length === 0 && <div className="h-1" />}
        </div>
      </SortableContext>

      <Link
        href={`/task?date=${group.date}`}
        className="text-muted-foreground hover:text-foreground mt-2 flex items-center gap-2 py-1 text-sm transition-colors"
      >
        <Plus className="text-primary size-3.5 shrink-0" />
        Add task
      </Link>
    </div>
  );
}
