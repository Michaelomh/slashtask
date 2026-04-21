import { NewTaskModal } from '@/components/new-task-modal';
import { getDbClient } from '@/utils/supabase/action-client';
import { Suspense } from 'react';

async function InterceptedNewTaskPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; duplicate?: string }>;
}) {
  const { supabase, user } = await getDbClient();
  const { duplicate } = await searchParams;

  const [projectsResult, duplicateResult] = await Promise.all([
    supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_deleted', false)
      .order('order', { ascending: true }),
    duplicate
      ? supabase
          .from('tasks')
          .select('title, description, description_text, priority, effort, project_id, due_date')
          .eq('id', duplicate)
          .eq('user_id', user.id)
          .single()
      : Promise.resolve({ data: null }),
  ]);

  return (
    <Suspense fallback={null}>
      <NewTaskModal
        projects={projectsResult.data ?? []}
        initialData={duplicateResult.data ?? undefined}
      />
    </Suspense>
  );
}

export default InterceptedNewTaskPage;
