import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';

export default function Loading() {
  return (
    <div className="mx-auto max-w-200 px-4 py-8">
      <div className="mb-6 flex items-center gap-2">
        <Skeleton className="size-8" />
        <Skeleton className="h-8 w-40" />
      </div>

      <Spinner />
    </div>
  );
}
