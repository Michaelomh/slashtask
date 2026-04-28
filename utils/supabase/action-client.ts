import { createClient, getUser } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function getDbClient() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const user = await getUser();

  if (!user) throw new Error('Unauthorized');

  return { supabase, user };
}
