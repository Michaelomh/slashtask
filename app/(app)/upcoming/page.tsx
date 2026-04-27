import { UpcomingView } from '@/components/page/upcoming-view';
import { Task } from '@/lib/task';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { Metadata } from 'next/types';

type RawTask = Task & {
  sub_tasks?: { id: string; is_completed: boolean; is_deleted: boolean }[];
};

export const metadata: Metadata = { title: 'Upcoming' };

export default async function UpcomingPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [tasksResult] = await Promise.all([
    supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user!.id)
      .eq('is_deleted', false)
      .eq('is_completed', false)
      .order('due_date', { ascending: true })
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

  return (
    <div className="mx-auto max-w-200 px-4 py-8">
      <h1 className="mb-6 text-xl font-semibold">Upcoming</h1>
      <UpcomingView tasks={tasks} />
    </div>
  );
}
