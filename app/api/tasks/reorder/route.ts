import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

interface ReorderItem {
  id: string;
  order: number;
  due_date?: string | null;
}

export async function PATCH(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const items: ReorderItem[] = await request.json();

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

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
    return NextResponse.json({ error: failed.error.message }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
