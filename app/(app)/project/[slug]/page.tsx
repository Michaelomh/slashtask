import { ProjectView } from '@/components/page/project-view';
import { Task } from '@/lib/task';
import { createClient } from '@/utils/supabase/server';
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data } = await supabase
    .from('projects')
    .select('name, emoji')
    .eq('slug', slug)
    .eq('is_deleted', false)
    .single();

  return { title: data ? `${data.name}` : 'Project' };
}

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

  const [tasksResult] = await Promise.all([
    supabase
      .from('tasks')
      .select('*')
      .eq('project_id', project.id)
      .eq('user_id', user!.id)
      .eq('is_deleted', false)
      .eq('is_completed', false)
      .order('due_date', { ascending: true })
      .order('order', { ascending: true }),
  ]);

  const tasks: Task[] = ((tasksResult.data ?? []) as RawTask[]).map(
    ({ sub_tasks, ...t }) => ({
      ...t,
      sub_task_total: sub_tasks?.filter((s) => !s.is_deleted).length ?? 0,
      sub_task_completed:
        sub_tasks?.filter((s) => !s.is_deleted && s.is_completed).length ?? 0,
    })
  );

  return (
    <div className="mx-auto max-w-200 px-4 py-8">
      <div className="mb-6 flex items-center gap-2">
        <span className="size-8 text-center text-2xl">{project.emoji}</span>
        <h1 className="text-xl font-semibold">{project.name}</h1>
      </div>

      {tasks.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No upcoming tasks in this project.
        </p>
      ) : (
        <ProjectView tasks={tasks} />
      )}
    </div>
  );
}
