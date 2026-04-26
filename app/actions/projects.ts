'use server';

import { Project } from '@/lib/project';
import { toKebabCase } from '@/lib/utils';
import { getDbClient } from '@/utils/supabase/action-client';
import { revalidatePath } from 'next/cache';

export type ProjectInput = {
  name: string;
  color?: string;
  emoji?: string;
  order?: number;
};

export async function createProject(input: ProjectInput): Promise<Project> {
  const { supabase, user } = await getDbClient();

  const { name, emoji, color, order } = input;

  const { data, error } = await supabase
    .from('projects')
    .insert({
      name,
      slug: toKebabCase(name),
      emoji,
      color,
      order,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('[createProject]', error);
    throw new Error(error.message);
  }
  revalidatePath('/', 'layout');
  return data as Project;
}

export async function updateProject(
  id: string,
  input: ProjectInput
): Promise<Project> {
  const { supabase, user } = await getDbClient();

  const body: Record<string, unknown> = { ...input };
  if (input.name) body.slug = toKebabCase(input.name);

  const { data, error } = await supabase
    .from('projects')
    .update(body)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    console.error('[updateProject]', error);
    throw new Error(error.message);
  }
  revalidatePath('/', 'layout');
  return data as Project;
}

export async function deleteProject(id: string): Promise<Project> {
  const { supabase, user } = await getDbClient();

  const { error: taskError } = await supabase
    .from('tasks')
    .update({ is_deleted: true })
    .eq('project_id', id)
    .eq('user_id', user.id);

  if (taskError) throw new Error('Failed to delete project tasks');

  const { data, error } = await supabase
    .from('projects')
    .update({ is_deleted: true })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw new Error('Failed to delete project');
  revalidatePath('/', 'layout');

  return data as Project;
}
