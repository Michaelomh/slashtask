'use client';

import { DateGroup, groupTasksByDate } from '@/components/date-group';
import { mockProjects, mockTasks } from '@/lib/mock-data';
import { useEffect, useRef, useState } from 'react';

const DAYS_PER_PAGE = 7;

export default function UpcomingPage() {
  const allGroups = groupTasksByDate(mockTasks);
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
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-xl font-semibold">Upcoming</h1>

      {allGroups.length === 0 ? (
        <p className="text-sm text-muted-foreground">No upcoming tasks.</p>
      ) : (
        <>
          {visibleGroups.map((group) => (
            <DateGroup
              key={group.date}
              group={group}
              projects={mockProjects}
            />
          ))}
          {hasMore && (
            <div ref={sentinelRef} className="h-8" aria-hidden="true" />
          )}
        </>
      )}
    </div>
  );
}
