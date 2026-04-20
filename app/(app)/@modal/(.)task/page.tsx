import { NewTaskModal } from '@/components/new-task-modal';
import { getDbClient } from '@/utils/supabase/action-client';
import { Suspense } from 'react';

async function InterceptedNewTaskPage() {
  const { supabase, user } = await getDbClient();
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_deleted', false)
    .order('order', { ascending: true });

  return (
    <Suspense fallback={null}>
      <NewTaskModal projects={projects ?? []} />
    </Suspense>
  );
}

export default InterceptedNewTaskPage;
