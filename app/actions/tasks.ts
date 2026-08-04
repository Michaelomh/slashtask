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

  let projectId = input.project_id ?? null;
  let dueDate = input.due_date ?? null;

  // Subtasks always inherit project and due date from their parent.
  if (input.parent_task_id) {
    const { data: parent, error: parentErr } = await supabase
      .from('tasks')
      .select('project_id, due_date')
      .eq('id', input.parent_task_id)
      .eq('user_id', user.id)
      .single();
    if (parentErr || !parent) {
      console.error('[createTask] parent lookup failed', parentErr);
      throw new Error('Failed to create task');
    }
    projectId = parent.project_id ?? null;
    dueDate = parent.due_date ?? null;
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      title: input.title,
      description: input.description ?? null,
      description_text: input.description_text ?? null,
      project_id: projectId,
      priority: input.priority ?? DEFAULT_PRIORITY_INDEX,
      effort: input.effort ?? DEFAULT_EFFORT_INDEX,
      due_date: dueDate,
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

  // Subtasks can't have their project or due date edited directly; those
  // fields are owned by the parent and propagated below.
  const { data: existing, error: existingErr } = await supabase
    .from('tasks')
    .select('parent_task_id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();
  if (existingErr || !existing) {
    console.error('[updateTask] lookup failed', existingErr);
    throw new Error('Failed to update task');
  }
  if (existing.parent_task_id) {
    delete body.project_id;
    delete body.due_date;
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

  // Cascade project/due_date changes from a parent down to its subtasks.
  if (!existing.parent_task_id) {
    const cascade: { project_id?: string | null; due_date?: string | null } =
      {};
    if ('project_id' in input) cascade.project_id = input.project_id ?? null;
    if ('due_date' in input) cascade.due_date = input.due_date ?? null;
    if (Object.keys(cascade).length > 0) {
      const { error: cascadeErr } = await supabase
        .from('tasks')
        .update(cascade)
        .eq('parent_task_id', id)
        .eq('user_id', user.id)
        .eq('is_deleted', false);
      if (cascadeErr) {
        console.error('[updateTask] cascade failed', cascadeErr);
        throw new Error('Failed to update task');
      }
    }

    // Completing a parent also completes all its incomplete subtasks. The
    // reverse (un-completing) intentionally doesn't cascade.
    if (input.is_completed === true) {
      const { error: completeErr } = await supabase
        .from('tasks')
        .update({ is_completed: true, completed_at: body.completed_at })
        .eq('parent_task_id', id)
        .eq('user_id', user.id)
        .eq('is_deleted', false)
        .eq('is_completed', false);
      if (completeErr) {
        console.error('[updateTask] complete cascade failed', completeErr);
        throw new Error('Failed to update task');
      }
    }
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

export async function getTaskWithSubtasks(
  id: string
): Promise<{ task: Task | null; subTasks: Task[] }> {
  const { supabase, user } = await getDbClient();

  const [taskResult, subTasksResult] = await Promise.all([
    supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .eq('is_deleted', false)
      .single(),
    supabase
      .from('tasks')
      .select('*')
      .eq('parent_task_id', id)
      .eq('user_id', user.id)
      .eq('is_deleted', false)
      .order('due_date', { ascending: true })
      .order('order', { ascending: true }),
  ]);

  return {
    task: (taskResult.data ?? null) as Task | null,
    subTasks: (subTasksResult.data ?? []) as Task[],
  };
}

export async function getTaskById(id: string): Promise<Task | null> {
  const { supabase, user } = await getDbClient();
  const { data } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .eq('is_deleted', false)
    .single();
  return (data ?? null) as Task | null;
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
