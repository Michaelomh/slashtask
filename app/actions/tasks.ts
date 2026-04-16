'use server';

import { Task } from '@/lib/types';
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
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const { supabase, user } = await getDbClient();

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      title: input.title,
      description: input.description ?? null,
      description_text: input.description_text ?? null,
      project_id: input.project_id ?? null,
      priority: input.priority ?? 4,
      effort: input.effort ?? 2,
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
  revalidatePath('/', 'layout');
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
}

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
  revalidatePath('/', 'layout');
  return data as Task;
}

type ReorderItem = {
  id: string;
  order: number;
  due_date?: string | null;
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
  revalidatePath('/', 'layout');
}

export async function reorderTasks(items: ReorderItem[]): Promise<void> {
  const { supabase, user } = await getDbClient();

  const results = await Promise.all(
    items.map(({ id, order, due_date }) => {
      const update: Record<string, unknown> = { order };
      if (due_date !== undefined) update.due_date = due_date;
      return supabase
        .from('tasks')
        .update(update)
        .eq('id', id)
        .eq('user_id', user.id);
    })
  );

  const failed = results.find((r) => r.error);
  if (failed?.error) {
    console.error('[reorderTasks]', failed.error);
    throw new Error('Failed to reorder tasks');
  }
  revalidatePath('/', 'layout');
}
