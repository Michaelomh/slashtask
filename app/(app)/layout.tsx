import { MobileHeader } from '@/components/mobile-header';
import { Sidebar } from '@/components/sidebar';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export default async function AppLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: projects }, { data: taskRows }] = await Promise.all([
    supabase
      .from('projects')
      .select('*')
      .eq('user_id', user!.id)
      .eq('is_deleted', false)
      .order('order', { ascending: true }),
    supabase
      .from('tasks')
      .select('project_id')
      .eq('user_id', user!.id)
      .eq('is_deleted', false)
      .eq('is_completed', false)
      .not('project_id', 'is', null),
  ]);

  const taskCountMap = (taskRows ?? []).reduce<Record<string, number>>(
    (acc, t) => {
      if (t.project_id) acc[t.project_id] = (acc[t.project_id] ?? 0) + 1;
      return acc;
    },
    {}
  );

  const projectList = (projects ?? []).map((p) => ({
    ...p,
    task_count: taskCountMap[p.id] ?? 0,
  }));

  return (
    <div className="flex flex-1 overflow-hidden">
      <Sidebar initialProjects={projectList} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <MobileHeader initialProjects={projectList} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      {modal}
    </div>
  );
}
