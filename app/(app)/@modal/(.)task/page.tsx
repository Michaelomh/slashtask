'use client';

import { getTaskById } from '@/app/actions/tasks';
import { ModalSkeleton } from '@/components/molecule/modal-skeleton';
import { NewTaskModal } from '@/components/new-task-modal';
import { useTaskModal } from '@/contexts/task-modal-context';
import { Task } from '@/lib/task';
import { use, useEffect, useState } from 'react';

export default function InterceptedNewTaskPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; duplicate?: string }>;
}) {
  const { duplicate } = use(searchParams);
  const { preloadedTask } = useTaskModal();
  const [fetched, setFetched] = useState<Task | null>(null);

  const preloaded =
    duplicate && preloadedTask?.id === duplicate ? preloadedTask : null;
  const initialTask = preloaded ?? fetched ?? undefined;
  const needsFetch = !!duplicate && !preloaded && !fetched;

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

  if (!needsFetch) return <ModalSkeleton />;

  return <NewTaskModal initialTask={initialTask} open />;
}
