import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('project_id');
  const completed = searchParams.get('completed');

  let query = supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_deleted', false)
    .order('due_date', { ascending: true })
    .order('order', { ascending: true });

  if (projectId) {
    query = query.eq('project_id', projectId);
  }

  if (completed === 'true') {
    query = query.eq('is_completed', true);
  } else if (completed === 'false') {
    query = query.eq('is_completed', false);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const {
    title,
    description,
    description_text,
    project_id,
    priority,
    effort,
    due_date,
    parent_task_id,
    recurrence_rule,
    order,
  } = body;

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      title,
      description: description ?? null,
      description_text: description_text ?? null,
      project_id: project_id ?? null,
      priority: priority ?? 4,
      effort: effort ?? 2,
      due_date: due_date ?? null,
      parent_task_id: parent_task_id ?? null,
      recurrence_rule: recurrence_rule ?? null,
      order: order ?? 0,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
