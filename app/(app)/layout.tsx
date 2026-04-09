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

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user!.id)
    .eq('is_deleted', false)
    .order('order', { ascending: true });

  return (
    <div className="flex flex-1 overflow-hidden">
      <Sidebar initialProjects={projects ?? []} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <MobileHeader initialProjects={projects ?? []} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      {modal}
    </div>
  );
}
