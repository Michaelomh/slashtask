'use client';

import { buildDateGroups, DateGroup, OverdueGroup } from '@/components/date-group';
import { type Project, type Task } from '@/lib/types';
import { addDays, isBefore, max, parseISO, startOfDay } from 'date-fns';
import { useEffect, useRef, useState } from 'react';

const DAYS_PER_PAGE = 7;
const MIN_HORIZON_DAYS = 30;

interface UpcomingViewProps {
  tasks: Task[];
  projects: Project[];
}

export function UpcomingView({ tasks, projects }: UpcomingViewProps) {
  const today = startOfDay(new Date());
  const defaultHorizon = addDays(today, MIN_HORIZON_DAYS);

  // Overdue: incomplete tasks with a due date strictly before today
  const overdueTasks = tasks
    .filter((t) => !t.is_completed && t.due_date && isBefore(parseISO(t.due_date), today))
    .sort((a, b) => a.due_date!.localeCompare(b.due_date!));

  // Extend horizon to cover any task that has a due date beyond the default
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
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((prev) => prev + DAYS_PER_PAGE);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore]);

  const visibleGroups = allGroups.slice(0, visibleCount);

  return (
    <>
      <OverdueGroup tasks={overdueTasks} projects={projects} />
      {visibleGroups.map((group) => (
        <DateGroup key={group.date} group={group} projects={projects} />
      ))}
      {hasMore && (
        <div ref={sentinelRef} className="h-8" aria-hidden="true" />
      )}
    </>
  );
}
