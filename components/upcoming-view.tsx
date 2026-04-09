'use client';

import { DateGroup, groupTasksByDate } from '@/components/date-group';
import { type Project } from '@/lib/types';
import { type Task } from '@/lib/types';
import { useEffect, useRef, useState } from 'react';

const DAYS_PER_PAGE = 7;

interface UpcomingViewProps {
  tasks: Task[];
  projects: Project[];
}

export function UpcomingView({ tasks, projects }: UpcomingViewProps) {
  const allGroups = groupTasksByDate(tasks);
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
      {allGroups.length === 0 ? (
        <p className="text-muted-foreground text-sm">No upcoming tasks.</p>
      ) : (
        <>
          {visibleGroups.map((group) => (
            <DateGroup key={group.date} group={group} projects={projects} />
          ))}
          {hasMore && (
            <div ref={sentinelRef} className="h-8" aria-hidden="true" />
          )}
        </>
      )}
    </>
  );
}
