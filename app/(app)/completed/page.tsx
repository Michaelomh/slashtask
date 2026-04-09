import { TaskItem } from '@/components/task-item';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export default async function CompletedPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [tasksResult, projectsResult] = await Promise.all([
    supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user!.id)
      .eq('is_deleted', false)
      .eq('is_completed', true)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false }),
    supabase
      .from('projects')
      .select('*')
      .eq('user_id', user!.id)
      .eq('is_deleted', false),
  ]);

  const completedTasks = tasksResult.data ?? [];
  const projects = projectsResult.data ?? [];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-xl font-semibold">Completed</h1>

      {completedTasks.length === 0 ? (
        <p className="text-sm text-muted-foreground">No completed tasks yet.</p>
      ) : (
        <div className="flex flex-col">
          {completedTasks.map((task) => {
            const project = projects.find((p) => p.id === task.project_id) ?? null;
            return <TaskItem key={task.id} task={task} project={project} />;
          })}
        </div>
      )}
    </div>
  );
}
