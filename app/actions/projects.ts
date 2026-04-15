'use server';

import { type Project } from '@/lib/types';
import { toKebabCase } from '@/lib/utils';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

type ProjectInput = Pick<Project, 'name' | 'emoji' | 'color' | 'order'>;

export async function createProject(input: ProjectInput): Promise<Project> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { name, emoji, color, order } = input;

  const { data, error } = await supabase
    .from('projects')
    .insert({ name, slug: toKebabCase(name), emoji, color, order, user_id: user.id })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Project;
}

export async function updateProject(
  id: string,
  input: Partial<ProjectInput>
): Promise<Project> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const body: Record<string, unknown> = { ...input };
  if (input.name) body.slug = toKebabCase(input.name);

  const { data, error } = await supabase
    .from('projects')
    .update(body)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Project;
}

export async function deleteProject(id: string): Promise<void> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  await supabase
    .from('tasks')
    .update({ is_deleted: true })
    .eq('project_id', id)
    .eq('user_id', user.id);

  const { error } = await supabase
    .from('projects')
    .update({ is_deleted: true })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);
}
