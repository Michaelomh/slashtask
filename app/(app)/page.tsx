import { UpcomingView } from '@/components/upcoming-view';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export default async function UpcomingPage() {
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

  const tasks = tasksResult.data ?? [];
  const projects = projectsResult.data ?? [];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-xl font-semibold">Upcoming</h1>
      <UpcomingView tasks={tasks} projects={projects} />
    </div>
  );
}
