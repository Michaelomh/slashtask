import { DateGroup, groupTasksByDate } from '@/components/date-group';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

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
      .select('*')
      .eq('project_id', project.id)
      .eq('user_id', user!.id)
      .eq('is_deleted', false)
      .eq('is_completed', false)
      .order('due_date', { ascending: true })
      .order('order', { ascending: true }),
    supabase
      .from('projects')
      .select('*')
      .eq('user_id', user!.id)
      .eq('is_deleted', false),
  ]);

  const tasks = tasksResult.data ?? [];
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
