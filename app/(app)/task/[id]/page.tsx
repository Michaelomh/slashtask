import { TaskDetailModal } from '@/components/task-detail-modal';
import { Task, Project } from '@/lib/types';
import { getDbClient } from '@/utils/supabase/action-client';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';

const getTask = cache(async (id: string) => {
  const { supabase, user } = await getDbClient();
  const { data } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .eq('is_deleted', false)
    .single();
  return data as Task | null;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const task = await getTask(id);
  return { title: task?.title ?? 'Task' };
}

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, user } = await getDbClient();

  const [task, { data: projects }, { data: subTasks }] = await Promise.all([
    getTask(id),
    supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_deleted', false)
      .order('order', { ascending: true }),
    supabase
      .from('tasks')
      .select('*')
      .eq('parent_task_id', id)
      .eq('user_id', user.id)
      .eq('is_deleted', false)
      .order('due_date', { ascending: true })
      .order('order', { ascending: true }),
  ]);

  if (!task) notFound();

  return (
    <TaskDetailModal
      id={id}
      task={task}
      projects={(projects ?? []) as Project[]}
      subTasks={(subTasks ?? []) as Task[]}
    />
  );
}
