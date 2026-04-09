import { NewTaskModal } from '@/components/new-task-modal';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export default async function NewTaskPage() {
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

  return <NewTaskModal projects={projects ?? []} />;
}
