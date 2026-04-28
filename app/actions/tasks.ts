'use server';

import { DEFAULT_EFFORT_INDEX } from '@/lib/effort';
import { DEFAULT_PRIORITY_INDEX } from '@/lib/priority';
import { Task } from '@/lib/task';
import { getDbClient } from '@/utils/supabase/action-client';
import { revalidatePath } from 'next/cache';

type CreateTaskInput = {
  title: string;
  description?: string | null;
  description_text?: string | null;
  project_id?: string | null;
  priority?: number;
  effort?: number;
  due_date?: string | null;
  parent_task_id?: string | null;
  order?: number;
};

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const { supabase, user } = await getDbClient();

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      title: input.title,
      description: input.description ?? null,
      description_text: input.description_text ?? null,
      project_id: input.project_id ?? null,
      priority: input.priority ?? DEFAULT_PRIORITY_INDEX,
      effort: input.effort ?? DEFAULT_EFFORT_INDEX,
      due_date: input.due_date ?? null,
      parent_task_id: input.parent_task_id ?? null,
      order: input.order ?? 0,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('[createTask]', error);
    throw new Error('Failed to create task');
  }
  revalidatePath('/', 'page');
  revalidatePath('/project/[slug]', 'page');
  return data as Task;
}

type UpdateTaskInput = {
  title?: string;
  description?: string | null;
  description_text?: string | null;
  is_completed?: boolean;
  priority?: number;
  effort?: number;
  due_date?: string | null;
  project_id?: string | null;
  completed_at?: string | null;
  is_deleted?: boolean;
};

export async function updateTask(
  id: string,
  input: UpdateTaskInput
): Promise<Task> {
  const { supabase, user } = await getDbClient();

  const body = { ...input };
  if ('is_completed' in body) {
    body.completed_at = body.is_completed ? new Date().toISOString() : null;
  }

  const { data, error } = await supabase
    .from('tasks')
    .update(body)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    console.error('[updateTask]', error);
    throw new Error('Failed to update task');
  }
  revalidatePath('/', 'page');
  revalidatePath('/completed', 'page');
  revalidatePath('/project/[slug]', 'page');
  return data as Task;
}

export async function deleteTask(id: string): Promise<void> {
  const { supabase, user } = await getDbClient();

  const { error } = await supabase
    .from('tasks')
    .update({ is_deleted: true })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('[deleteTask]', error);
    throw new Error('Failed to delete task');
  }
  revalidatePath('/', 'page');
  revalidatePath('/completed', 'page');
  revalidatePath('/project/[slug]', 'page');
}

export async function deleteTaskWithSubtasks(
  parentId: string
): Promise<string[]> {
  const { supabase, user } = await getDbClient();

  const { data: subtasks, error: fetchError } = await supabase
    .from('tasks')
    .select('id')
    .eq('parent_task_id', parentId)
    .eq('user_id', user.id)
    .eq('is_deleted', false);

  if (fetchError) {
    console.error('[deleteTaskWithSubtasks]', fetchError);
    throw new Error('Failed to delete task');
  }

  const ids = [parentId, ...(subtasks ?? []).map((s) => s.id)];

  const { error } = await supabase
    .from('tasks')
    .update({ is_deleted: true })
    .in('id', ids)
    .eq('user_id', user.id);

  if (error) {
    console.error('[deleteTaskWithSubtasks]', error);
    throw new Error('Failed to delete task');
  }

  revalidatePath('/', 'page');
  revalidatePath('/completed', 'page');
  revalidatePath('/project/[slug]', 'page');
  return ids;
}

export async function restoreTasks(ids: string[]): Promise<void> {
  const { supabase, user } = await getDbClient();

  const { error } = await supabase
    .from('tasks')
    .update({ is_deleted: false })
    .in('id', ids)
    .eq('user_id', user.id);

  if (error) {
    console.error('[restoreTasks]', error);
    throw new Error('Failed to restore tasks');
  }

  revalidatePath('/', 'page');
  revalidatePath('/completed', 'page');
  revalidatePath('/project/[slug]', 'page');
}
