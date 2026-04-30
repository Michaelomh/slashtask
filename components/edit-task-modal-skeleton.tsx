'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

export function EditTaskModalSkeleton() {
  return (
    <Dialog open>
      <DialogContent
        showCloseButton={false}
        className="gap-0 p-0 sm:max-w-lg"
        aria-describedby={undefined}
      >
        <div className="px-4 pt-4 pb-3">
          <Skeleton className="h-7 w-2/3" />

          <div className="mt-3 space-y-2">
            <Skeleton className="h-5 w-full" />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Skeleton className="h-7 w-20 rounded-full" />
            <Skeleton className="h-7 w-20 rounded-full" />
            <Skeleton className="h-7 w-28 rounded-full" />
            <Skeleton className="h-7 w-24 rounded-full" />
          </div>

          <div className="mt-4 mb-2">
            <Skeleton className="h-8 w-28" />
          </div>
        </div>

        <div className="border-border flex items-center justify-between border-t px-4 py-3">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
