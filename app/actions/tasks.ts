'use server';

import { type Task } from '@/lib/types';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

interface CreateTaskInput {
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
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

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

  if (error) throw new Error(error.message);
  return data as Task;
}

export async function updateTask(
  id: string,
  input: Record<string, unknown>
): Promise<Task> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

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

  if (error) throw new Error(error.message);
  return data as Task;
}

interface ReorderItem {
  id: string;
  order: number;
  due_date?: string | null;
}

export async function reorderTasks(items: ReorderItem[]): Promise<void> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

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
  if (failed?.error) throw new Error(failed.error.message);
}
