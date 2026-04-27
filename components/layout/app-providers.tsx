'use client';

import { NewTaskProvider } from '@/contexts/new-task-context';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <NewTaskProvider>{children}</NewTaskProvider>;
}
