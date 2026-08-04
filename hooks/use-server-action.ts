import { useTransition } from 'react';
import { toast } from 'sonner';

export function useServerAction() {
  const [isPending, startTransition] = useTransition();

  function run(action: () => Promise<void>) {
    startTransition(async () => {
      try {
        await action();
      } catch {
        toast.error('Something went wrong');
      }
    });
  }

  return { isPending, run };
}
