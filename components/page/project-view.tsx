'use client';

import { reorderTasks } from '@/app/actions/tasks';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  DateGroup,
  NoDueDateGroup,
  OverdueGroup,
} from '@/components/date-group';
import { groupTasksByDate } from '@/lib/task-grouping';
import { TaskItem } from '@/components/task-item';
import { Project, Task } from '@/lib/types';
import { isBefore, parseISO, startOfDay } from 'date-fns';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

const today = startOfDay(new Date());

type ProjectViewProps = {
  tasks: Task[];
  projects: Project[];
};

export function ProjectView({
  tasks: initialTasks,
  projects,
}: ProjectViewProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const prevTasksRef = useRef<Task[]>(initialTasks);

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    })
  );

  const noDueDateTasks = useMemo(() => {
    return tasks
      .filter((t) => !t.is_completed && !t.due_date)
      .sort((a, b) => {
        if (a.order !== b.order) return a.order - b.order;
        return a.created_at.localeCompare(b.created_at);
      });
  }, [tasks]);

  const overdueTasks = useMemo(() => {
    return tasks
      .filter(
        (t) =>
          !t.is_completed && t.due_date && isBefore(parseISO(t.due_date), today)
      )
      .sort((a, b) => a.due_date!.localeCompare(b.due_date!));
  }, [tasks]);

  const groups = useMemo(() => {
    const upcomingTasks = tasks.filter(
      (t) => t.due_date && !isBefore(parseISO(t.due_date), today)
    );
    return groupTasksByDate(upcomingTasks);
  }, [tasks]);

  const projectMap = useMemo(
    () => new Map(projects.map((p) => [p.id, p])),
    [projects]
  );

  function handleDragStart({ active }: { active: { id: string | number } }) {
    setActiveTask(tasks.find((t) => t.id === active.id) ?? null);
    prevTasksRef.current = tasks;
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    const sourceContainerId = active.data.current?.containerId as string;
    const destContainerId =
      (over.data.current?.containerId as string | undefined) ?? overId;

    if (destContainerId === 'overdue') return;
    if (destContainerId === 'no-due-date') return;
    if (!destContainerId) return;

    const updated = [...tasks];
    const activeIndex = updated.findIndex((t) => t.id === activeId);
    if (activeIndex === -1) return;

    const movedTask = { ...updated[activeIndex] };
    const dueDateChanged = sourceContainerId !== destContainerId;
    if (dueDateChanged) movedTask.due_date = destContainerId;

    updated.splice(activeIndex, 1);

    const overIndex = updated.findIndex((t) => t.id === overId);
    if (overIndex !== -1 && over.data.current?.type === 'task') {
      updated.splice(overIndex, 0, movedTask);
    } else {
      const lastInDest = updated.reduce<number>(
        (last, t, i) => (t.due_date === destContainerId ? i : last),
        -1
      );
      updated.splice(lastInDest + 1, 0, movedTask);
    }

    const affectedDates = new Set([sourceContainerId, destContainerId]);
    const reorderPayload: {
      id: string;
      order: number;
      due_date?: string | null;
    }[] = [];

    for (const date of affectedDates) {
      const groupTasks = updated.filter((t) => t.due_date === date);
      groupTasks.forEach((t, i) => {
        t.order = (i + 1) * 1000;
        const entry: { id: string; order: number; due_date?: string | null } = {
          id: t.id,
          order: t.order,
        };
        if (t.id === activeId && dueDateChanged)
          entry.due_date = destContainerId;
        reorderPayload.push(entry);
      });
    }

    setTasks(updated);
    reorderTasks(reorderPayload).catch(() => {
      setTasks(prevTasksRef.current);
      toast.error('Failed to save order');
    });
  }

  const activeProject = activeTask
    ? (projects.find((p) => p.id === activeTask.project_id) ?? null)
    : null;

  const isEmpty =
    noDueDateTasks.length === 0 &&
    overdueTasks.length === 0 &&
    groups.length === 0;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {isEmpty ? (
        <p className="text-muted-foreground text-sm">
          No upcoming tasks in this project.
        </p>
      ) : (
        <>
          <NoDueDateGroup tasks={noDueDateTasks} projects={projects} />
          <OverdueGroup tasks={overdueTasks} projects={projects} />
          {groups.map((group) => (
            <DateGroup
              key={group.date}
              group={group}
              projectMap={projectMap}
              projects={projects}
            />
          ))}
        </>
      )}

      <DragOverlay>
        {activeTask && (
          <div className="rounded opacity-95 shadow-md">
            <TaskItem task={activeTask} project={activeProject} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
