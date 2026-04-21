'use client';

import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Task, Project } from '@/lib/types';
import { formatDateHeading, TaskGroup } from '@/lib/task-grouping';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { DraggableTaskItem, SortableTaskItem } from './sortable-task-item';

type NoDueDateGroupProps = {
  tasks: Task[];
  projects: Project[];
};

export function NoDueDateGroup({ tasks, projects }: NoDueDateGroupProps) {
  if (tasks.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-foreground text-sm font-semibold">No Due Date</h2>
        <div className="bg-border h-px flex-1" />
      </div>
      <div className="flex flex-col">
        {tasks.map((task) => {
          const project =
            projects.find((p) => p.id === task.project_id) ?? null;
          return (
            <DraggableTaskItem
              key={task.id}
              task={task}
              project={project}
              containerId="no-due-date"
            />
          );
        })}
      </div>
    </div>
  );
}

type OverdueGroupProps = {
  tasks: Task[];
  projects: Project[];
};

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

type DateGroupProps = {
  group: TaskGroup;
  projectMap: Map<string, Project>;
};

export function DateGroup({ group, projectMap }: DateGroupProps) {
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
            const project = task.project_id
              ? projectMap.get(task.project_id)
              : null;

            return (
              <SortableTaskItem
                key={task.id}
                task={task}
                project={project || null}
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

export function TodayGroup({ group, projectMap }: DateGroupProps) {
  const { label } = formatDateHeading(group.date);
  const { setNodeRef, isOver } = useDroppable({ id: group.date });
  const taskIds = group.tasks.map((t) => t.id);

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center gap-2 rounded-2xl">
        <h2 className="text-foreground text-sm font-semibold">{label}</h2>
        <div className="bg-border h-px flex-1" />
      </div>

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`flex flex-col rounded transition-colors ${isOver ? 'bg-accent/30' : ''}`}
        >
          {group.tasks.map((task) => {
            const project = task.project_id
              ? projectMap.get(task.project_id)
              : null;

            return (
              <SortableTaskItem
                key={task.id}
                task={task}
                project={project || null}
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
