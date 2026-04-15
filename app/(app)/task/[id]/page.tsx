import { TaskDetailModal } from '@/components/task-detail-modal';
import { createClient } from '@/utils/supabase/server';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data } = await supabase
    .from('tasks')
    .select('title')
    .eq('id', id)
    .eq('is_deleted', false)
    .single();

  return { title: data?.title ?? 'Task' };
}

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from('tasks')
    .select('id')
    .eq('id', id)
    .eq('user_id', user!.id)
    .eq('is_deleted', false)
    .single();

  if (!data) notFound();

  return <TaskDetailModal id={id} />;
}
