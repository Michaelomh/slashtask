import { DateGroup, groupTasksByDate } from '@/components/date-group';
import { type Task } from '@/lib/types';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

type RawTask = Task & {
  sub_tasks?: { id: string; is_completed: boolean; is_deleted: boolean }[];
};

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const projectResult = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .eq('user_id', user!.id)
    .eq('is_deleted', false)
    .single();

  if (!projectResult.data) notFound();

  const project = projectResult.data;

  const [tasksResult, projectsResult] = await Promise.all([
    supabase
      .from('tasks')
      .select('*, sub_tasks:tasks!parent_task_id(id,is_completed,is_deleted)')
      .eq('project_id', project.id)
      .eq('user_id', user!.id)
      .eq('is_deleted', false)
      .eq('is_completed', false)
      .is('parent_task_id', null)
      .order('due_date', { ascending: true })
      .order('order', { ascending: true }),
    supabase
      .from('projects')
      .select('*')
      .eq('user_id', user!.id)
      .eq('is_deleted', false),
  ]);

  const tasks: Task[] = ((tasksResult.data ?? []) as RawTask[]).map(
    ({ sub_tasks, ...t }) => ({
      ...t,
      sub_task_total: sub_tasks?.filter((s) => !s.is_deleted).length ?? 0,
      sub_task_completed:
        sub_tasks?.filter((s) => !s.is_deleted && s.is_completed).length ?? 0,
    })
  );
  const projects = projectsResult.data ?? [];
  const groups = groupTasksByDate(tasks);

  return (
    <div className="mx-auto max-w-[800px] px-4 py-8">
      <div className="mb-6 flex items-center gap-2">
        <span className="text-2xl">{project.emoji}</span>
        <h1 className="text-xl font-semibold">{project.name}</h1>
      </div>

      {groups.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No upcoming tasks in this project.
        </p>
      ) : (
        groups.map((group) => (
          <DateGroup key={group.date} group={group} projects={projects} />
        ))
      )}
    </div>
  );
}
