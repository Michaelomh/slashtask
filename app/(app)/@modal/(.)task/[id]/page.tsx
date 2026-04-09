import { TaskDetailModal } from '@/components/task-detail-modal';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

export default async function InterceptedTaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [taskResult, tasksResult, projectsResult] = await Promise.all([
    supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .eq('user_id', user!.id)
      .eq('is_deleted', false)
      .single(),
    supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user!.id)
      .eq('is_deleted', false)
      .eq('is_completed', false)
      .order('due_date', { ascending: true })
      .order('order', { ascending: true }),
    supabase
      .from('projects')
      .select('*')
      .eq('user_id', user!.id)
      .eq('is_deleted', false)
      .order('order', { ascending: true }),
  ]);

  if (!taskResult.data) notFound();

  return (
    <TaskDetailModal
      task={taskResult.data}
      allTasks={tasksResult.data ?? []}
      projects={projectsResult.data ?? []}
    />
  );
}
