'use client';

import { NewTaskProvider } from '@/contexts/new-task-context';
import { OptimisticTasksProvider } from '@/contexts/optimistic-tasks-context';
import {
  ProjectsProvider,
  ProjectsProviderType,
} from '@/contexts/projects-context';
import { TaskModalProvider } from '@/contexts/task-modal-context';
import { TooltipProvider } from '@/components/ui/tooltip';

type AppProvidersType = ProjectsProviderType;

export function AppProviders({
  initialProjects,
  initialCompletedCount,
  children,
}: React.PropsWithChildren<AppProvidersType>) {
  return (
    <ProjectsProvider
      initialProjects={initialProjects}
      initialCompletedCount={initialCompletedCount}
    >
      <NewTaskProvider>
        <TaskModalProvider>
          <OptimisticTasksProvider>
            <TooltipProvider delay={300}>{children}</TooltipProvider>
          </OptimisticTasksProvider>
        </TaskModalProvider>
      </NewTaskProvider>
    </ProjectsProvider>
  );
}
