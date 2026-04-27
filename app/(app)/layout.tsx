import { AppProviders } from '@/components/layout/app-providers';
import { MobileHeader } from '@/components/layout/mobile-header';
import { Sidebar } from '@/components/layout/sidebar';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { Suspense } from 'react';

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

  const [{ data: projects }, { count: completedCount }] = await Promise.all([
    supabase
      .from('projects')
      .select('*, tasks!left(count)')
      .eq('user_id', user!.id)
      .eq('is_deleted', false)
      .eq('tasks.is_deleted', false)
      .eq('tasks.is_completed', false)
      .order('order', { ascending: true }),
    supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user!.id)
      .eq('is_deleted', false)
      .eq('is_completed', true),
  ]);

  const projectList = (projects ?? []).map((p) => ({
    ...p,
    task_count: (p.tasks as { count: number }[])[0]?.count ?? 0,
  }));

  return (
    <AppProviders initialProjects={projectList}>
      <div className="flex flex-1 overflow-hidden">
        <Suspense fallback={null}>
          <Sidebar completedCount={completedCount ?? 0} />
        </Suspense>
        <div className="flex flex-1 flex-col overflow-hidden">
          <Suspense fallback={null}>
            <MobileHeader completedCount={completedCount ?? 0} />
          </Suspense>
          <main
            className="flex-1 overflow-y-auto"
            style={{ scrollbarGutter: 'stable both-edges' }}
          >
            {children}
          </main>
        </div>
        {modal}
      </div>
    </AppProviders>
  );
}
