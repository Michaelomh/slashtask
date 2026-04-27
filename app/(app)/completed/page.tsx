import { CompletedView } from '@/components/page/completed-view';
import { TaskItem } from '@/components/task-item';
import { Task } from '@/lib/task';
import { createClient } from '@/utils/supabase/server';
import { Metadata } from 'next';
import { cookies } from 'next/headers';

export const metadata: Metadata = { title: 'Completed' };

type RawTask = Task & {
  sub_tasks?: { id: string; is_completed: boolean; is_deleted: boolean }[];
};

export default async function CompletedPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [tasksResult] = await Promise.all([
    supabase
      .from('tasks')
      .select('*, sub_tasks:tasks!parent_task_id(id,is_completed,is_deleted)')
      .eq('user_id', user!.id)
      .eq('is_deleted', false)
      .eq('is_completed', true)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false }),
  ]);

  const completedTasks: Task[] = ((tasksResult.data ?? []) as RawTask[]).map(
    ({ sub_tasks, ...t }) => ({
      ...t,
      sub_task_total: sub_tasks?.filter((s) => !s.is_deleted).length ?? 0,
      sub_task_completed:
        sub_tasks?.filter((s) => !s.is_deleted && s.is_completed).length ?? 0,
    })
  );

  return (
    <div className="mx-auto max-w-200 px-4 py-8">
      <h1 className="mb-6 text-xl font-semibold">Completed</h1>
      {completedTasks.length === 0 ? (
        <p className="text-muted-foreground text-sm">No completed tasks yet.</p>
      ) : (
        <CompletedView tasks={completedTasks} />
      )}
    </div>
  );
}
