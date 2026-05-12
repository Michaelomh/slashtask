'use client';

import {
  DateGroup,
  NoDueDateGroup,
  OverdueGroup,
  TodayGroup,
} from '@/components/date-group';
import { buildDateGroups } from '@/lib/task-grouping';
import { Task } from '@/lib/task';
import { addDays, isBefore, max, parseISO, startOfDay } from 'date-fns';
import { useEffect, useMemo, useOptimistic, useRef, useState } from 'react';
import { useProjects } from '@/contexts/projects-context';
import {
  OptimisticTaskAction,
  useOptimisticTasks,
} from '@/contexts/optimistic-tasks-context';

const DAYS_PER_PAGE = 7;
const MIN_HORIZON_DAYS = 30;

type UpcomingViewProps = {
  tasks: Task[];
};

const today = startOfDay(new Date());
const defaultHorizon = addDays(today, MIN_HORIZON_DAYS);

export function UpcomingView({ tasks: initialTasks }: UpcomingViewProps) {
  const { projects } = useProjects();
  const [tasks, dispatchOptimistic] = useOptimistic<
    Task[],
    OptimisticTaskAction
  >(initialTasks, (state, action) => {
    if (action.type === 'add') return [...state, action.task];
    return state.filter((t) => t.id !== action.id);
  });
  const [visibleCount, setVisibleCount] = useState(DAYS_PER_PAGE);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { subscribe } = useOptimisticTasks();

  useEffect(
    () =>
      subscribe((action) => {
        if (action.type === 'add') {
          if (!action.task.is_completed && !action.task.parent_task_id) {
            dispatchOptimistic(action);
          }
        } else {
          dispatchOptimistic(action);
        }
      }),
    [subscribe, dispatchOptimistic]
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
    return (
      tasks
        .filter(
          (t) =>
            !t.is_completed &&
            t.due_date &&
            isBefore(parseISO(t.due_date), today)
        )
        .sort((a, b) => a.due_date!.localeCompare(b.due_date!)) ?? []
    );
  }, [tasks]);

  const latestTaskDate = tasks.reduce<Date>((acc, t) => {
    if (!t.due_date || t.is_completed) return acc;
    const d = parseISO(t.due_date);
    return d > acc ? d : acc;
  }, defaultHorizon);

  const horizon = max([defaultHorizon, latestTaskDate]);
  const allGroups = useMemo(() => {
    return buildDateGroups(tasks, today, horizon) ?? [];
  }, [tasks, horizon]);

  const hasMore = visibleCount < allGroups.length;

  useEffect(() => {
    if (!hasMore) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisibleCount((p) => p + DAYS_PER_PAGE);
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore]);

  const visibleGroups = allGroups.slice(1, visibleCount);
  const todayGroup = allGroups.slice(0, 1)[0];

  const projectMap = useMemo(
    () => new Map(projects.map((p) => [p.id, p])),
    [projects]
  );

  return (
    <>
      <NoDueDateGroup tasks={noDueDateTasks} />
      <OverdueGroup tasks={overdueTasks} />
      <TodayGroup group={todayGroup} projectMap={projectMap} />
      {visibleGroups.map((group) => (
        <DateGroup key={group.date} group={group} projectMap={projectMap} />
      ))}
      {hasMore && <div ref={sentinelRef} className="h-8" aria-hidden="true" />}
    </>
  );
}
