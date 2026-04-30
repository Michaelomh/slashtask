'use client';

import { getTaskById } from '@/app/actions/tasks';
import { NewTaskModal } from '@/components/new-task-modal';
import { NewTaskModalSkeleton } from '@/components/new-task-modal-skeleton';
import { useTaskModal } from '@/contexts/task-modal-context';
import { Task } from '@/lib/task';
import { use, useEffect, useState } from 'react';

export default function InterceptedNewTaskPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; duplicate?: string }>;
}) {
  const { duplicate } = use(searchParams);
  const { primedTask } = useTaskModal();
  const [fetched, setFetched] = useState<Task | null>(null);

  const primed = duplicate && primedTask?.id === duplicate ? primedTask : null;
  const initialTask = primed ?? fetched ?? undefined;
  const needsFetch = !!duplicate && !primed && !fetched;

  useEffect(() => {
    if (!needsFetch || !duplicate) return;
    let cancelled = false;
    getTaskById(duplicate).then((task) => {
      if (cancelled || !task) return;
      setFetched(task);
    });
    return () => {
      cancelled = true;
    };
  }, [duplicate, needsFetch]);

  if (needsFetch) return <NewTaskModalSkeleton />;

  return <NewTaskModal initialTask={initialTask} open />;
}
