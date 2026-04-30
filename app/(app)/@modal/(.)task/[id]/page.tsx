'use client';

import { getTaskWithSubtasks } from '@/app/actions/tasks';
import { EditTaskModal } from '@/components/edit-task-modal';
import { EditTaskModalSkeleton } from '@/components/edit-task-modal-skeleton';
import { useTaskModal } from '@/contexts/task-modal-context';
import { Task } from '@/lib/task';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';

export default function InterceptedTaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { primedTask } = useTaskModal();
  const [fetched, setFetched] = useState<{
    task: Task;
    subTasks: Task[];
  } | null>(null);

  const primed = primedTask?.id === id ? primedTask : null;
  const initialTask = primed ?? fetched?.task ?? null;
  const initialSubTasks = fetched?.subTasks;

  useEffect(() => {
    if (primed && initialSubTasks !== undefined) return;
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
  }, [id, primed, initialSubTasks, fetched, router]);

  if (!initialTask) return <EditTaskModalSkeleton />;

  return (
    <EditTaskModal
      id={id}
      initialTask={initialTask}
      initialSubTasks={initialSubTasks}
    />
  );
}
