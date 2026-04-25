import { EditTaskModal } from '@/components/edit-task-modal';
import { Task, Project } from '@/lib/types';
import { getDbClient } from '@/utils/supabase/action-client';
import { notFound } from 'next/navigation';

export default async function InterceptedTaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, user } = await getDbClient();

  const [{ data: task }, { data: projects }, { data: subTasks }] =
    await Promise.all([
      supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .eq('is_deleted', false)
        .single(),
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
    <EditTaskModal
      id={id}
      task={task as Task}
      projects={(projects ?? []) as Project[]}
      subTasks={(subTasks ?? []) as Task[]}
    />
  );
}
