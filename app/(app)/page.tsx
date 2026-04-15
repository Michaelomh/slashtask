import { UpcomingView } from '@/components/upcoming-view';
import { type Task } from '@/lib/types';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

type RawTask = Task & {
  sub_tasks?: { id: string; is_completed: boolean; is_deleted: boolean }[];
};

export default async function UpcomingPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [tasksResult, projectsResult] = await Promise.all([
    supabase
      .from('tasks')
      .select('*, sub_tasks:tasks!parent_task_id(id,is_completed,is_deleted)')
      .eq('user_id', user!.id)
      .eq('is_deleted', false)
      .eq('is_completed', false)
      .is('parent_task_id', null)
      .order('due_date', { ascending: true })
      .order('order', { ascending: true }),
    supabase
      .from('projects')
      .select('*')
      .eq('user_id', user!.id)
      .eq('is_deleted', false)
      .order('order', { ascending: true }),
  ]);

  const tasks: Task[] = ((tasksResult.data ?? []) as RawTask[]).map(
    ({ sub_tasks, ...t }) => ({
      ...t,
      sub_task_total: sub_tasks?.filter((s) => !s.is_deleted).length ?? 0,
      sub_task_completed:
        sub_tasks?.filter((s) => !s.is_deleted && s.is_completed).length ?? 0,
    })
  );
  const projects = projectsResult.data ?? [];

  return (
    <div className="mx-auto max-w-[800px] px-4 py-8">
      <h1 className="mb-6 text-xl font-semibold">Upcoming</h1>
      <UpcomingView tasks={tasks} projects={projects} />
    </div>
  );
}
