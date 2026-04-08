import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export default async function Home() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data } = await supabase.from('ContactForm').select();

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      {data?.map((data) => (
        <li key={data.id}>{data.name}</li>
      ))}
      <Button>Click me</Button>
    </div>
  );
}
