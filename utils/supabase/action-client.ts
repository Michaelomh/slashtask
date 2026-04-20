import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function getDbClient() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  return { supabase, user };
}
