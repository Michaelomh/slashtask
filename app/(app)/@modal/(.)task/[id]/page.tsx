'use client';

import { getTaskWithSubtasks } from '@/app/actions/tasks';
import { EditTaskModal } from '@/components/edit-task-modal';
import { EditTaskModalSkeleton } from '@/components/edit-task-modal-skeleton';
import { useTaskModal } from '@/contexts/task-modal-context';
import { Task } from '@/lib/task';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';

export default function InterceptedEditTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { preloadedTask } = useTaskModal();
  const [fetched, setFetched] = useState<{
    task: Task;
    subTasks: Task[];
  } | null>(null);

  const preloaded = preloadedTask?.id === id ? preloadedTask : null;
  const initialTask = preloaded ?? fetched?.task ?? null;
  const initialSubTasks = fetched?.subTasks;

  useEffect(() => {
    if (preloaded && initialSubTasks !== undefined) return;
    if (fetched) return;
    let cancelled = false;
    getTaskWithSubtasks(id).then((res) => {
      if (cancelled) return;
      if (!res.task) {
        router.back();
        return;
      }
      setFetched({ task: res.task, subTasks: res.subTasks });
    });
    return () => {
      cancelled = true;
    };
  }, [id, preloaded, initialSubTasks, fetched, router]);

  if (!initialTask) return <EditTaskModalSkeleton />;

  return (
    <EditTaskModal
      id={id}
      initialTask={initialTask}
      initialSubTasks={initialSubTasks}
    />
  );
}
