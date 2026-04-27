import { NewTaskModal } from '@/components/new-task-modal';
import { Task } from '@/lib/task';
import { getDbClient } from '@/utils/supabase/action-client';

async function InterceptedNewTaskPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; duplicate?: string }>;
}) {
  const { supabase, user } = await getDbClient();
  const { duplicate } = await searchParams;

  const [duplicateResult] = await Promise.all([
    duplicate
      ? supabase
          .from('tasks')
          .select(
            'title, description, description_text, priority, effort, project_id, due_date'
          )
          .eq('id', duplicate)
          .eq('user_id', user.id)
          .single()
      : Promise.resolve({ data: null }),
  ]);

  return (
    <NewTaskModal
      initialTask={(duplicateResult.data as Task) ?? undefined}
      open
    />
  );
}

export default InterceptedNewTaskPage;
