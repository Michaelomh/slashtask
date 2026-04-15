'use client';

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
import { arrayMove } from '@dnd-kit/sortable';
import { buildDateGroups, DateGroup, OverdueGroup } from '@/components/date-group';
import { TaskItem } from '@/components/task-item';
import { type Project, type Task } from '@/lib/types';
import { addDays, isBefore, max, parseISO, startOfDay } from 'date-fns';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const DAYS_PER_PAGE = 7;
const MIN_HORIZON_DAYS = 30;

interface UpcomingViewProps {
  tasks: Task[];
  projects: Project[];
}

export function UpcomingView({ tasks: initialTasks, projects }: UpcomingViewProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const prevTasksRef = useRef<Task[]>(initialTasks);

  // Keep local state in sync when the page re-renders (e.g. after router.refresh())
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  const today = startOfDay(new Date());
  const defaultHorizon = addDays(today, MIN_HORIZON_DAYS);

  const overdueTasks = tasks
    .filter((t) => !t.is_completed && t.due_date && isBefore(parseISO(t.due_date), today))
    .sort((a, b) => a.due_date!.localeCompare(b.due_date!));

  const latestTaskDate = tasks.reduce<Date>((acc, t) => {
    if (!t.due_date || t.is_completed) return acc;
    const d = parseISO(t.due_date);
    return d > acc ? d : acc;
  }, defaultHorizon);

  const horizon = max([defaultHorizon, latestTaskDate]);
  const allGroups = buildDateGroups(tasks, today, horizon);

  const [visibleCount, setVisibleCount] = useState(DAYS_PER_PAGE);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const hasMore = visibleCount < allGroups.length;

  useEffect(() => {
    if (!hasMore) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisibleCount((p) => p + DAYS_PER_PAGE); },
      { threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore]);

  const visibleGroups = allGroups.slice(0, visibleCount);

  // ── helpers ──────────────────────────────────────────────────────────────
  function getContainerId(taskId: string): string | null {
    const t = tasks.find((t) => t.id === taskId);
    if (!t || !t.due_date) return null;
    if (isBefore(parseISO(t.due_date), today)) return 'overdue';
    return t.due_date;
  }

  // ── drag handlers ─────────────────────────────────────────────────────────
  function handleDragStart({ active }: { active: { id: string | number } }) {
    const task = tasks.find((t) => t.id === active.id);
    setActiveTask(task ?? null);
    prevTasksRef.current = tasks;
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    // Determine containers
    const sourceContainerId = active.data.current?.containerId as string;
    const destContainerId =
      (over.data.current?.containerId as string | undefined) ?? overId;

    // Refuse to drop into overdue
    if (destContainerId === 'overdue') return;
    // Refuse to drop on a non-date container (shouldn't happen but guard)
    if (!destContainerId || destContainerId === 'overdue') return;

    setTasks((prev) => {
      const updated = [...prev];
      const activeIndex = updated.findIndex((t) => t.id === activeId);
      if (activeIndex === -1) return prev;

      const movedTask = { ...updated[activeIndex] };

      // Cross-container: update due_date
      const dueDateChanged = sourceContainerId !== destContainerId;
      if (dueDateChanged) {
        movedTask.due_date = destContainerId;
      }

      // Remove from old position
      updated.splice(activeIndex, 1);

      // Find insertion point in destination group
      const overIndex = updated.findIndex((t) => t.id === overId);
      if (overIndex !== -1 && over.data.current?.type === 'task') {
        updated.splice(overIndex, 0, movedTask);
      } else {
        // Dropped on empty container or container edge — add at end of that day
        const lastInDest = updated.reduce<number>(
          (last, t, i) => (t.due_date === destContainerId ? i : last),
          -1
        );
        updated.splice(lastInDest + 1, 0, movedTask);
      }

      // Recalculate orders for all affected date groups
      const affectedDates = new Set([sourceContainerId, destContainerId]);
      const reorderPayload: { id: string; order: number; due_date?: string }[] = [];

      for (const date of affectedDates) {
        const groupTasks = updated.filter((t) => t.due_date === date);
        groupTasks.forEach((t, i) => {
          t.order = (i + 1) * 1000;
          const entry: { id: string; order: number; due_date?: string } = {
            id: t.id,
            order: t.order,
          };
          if (t.id === activeId && dueDateChanged) entry.due_date = destContainerId;
          reorderPayload.push(entry);
        });
      }

      // Fire API (optimistic — revert on failure)
      fetch('/api/tasks/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reorderPayload),
      }).then((res) => {
        if (!res.ok) {
          setTasks(prevTasksRef.current);
          toast.error('Failed to save order');
        }
      });

      return updated;
    });
  }

  // ── render ────────────────────────────────────────────────────────────────
  const activeProject = activeTask
    ? (projects.find((p) => p.id === activeTask.project_id) ?? null)
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <OverdueGroup tasks={overdueTasks} projects={projects} />
      {visibleGroups.map((group) => (
        <DateGroup key={group.date} group={group} projects={projects} />
      ))}
      {hasMore && <div ref={sentinelRef} className="h-8" aria-hidden="true" />}

      {/* Ghost preview while dragging */}
      <DragOverlay>
        {activeTask && (
          <div className="shadow-md opacity-95 rounded">
            <TaskItem task={activeTask} project={activeProject} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
