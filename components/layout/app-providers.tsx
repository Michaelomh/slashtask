'use client';

import { NewTaskProvider } from '@/contexts/new-task-context';
import {
  ProjectsProvider,
  ProjectsProviderType,
} from '@/contexts/projects-context';
import { TaskModalProvider } from '@/contexts/task-modal-context';

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
        <TaskModalProvider>{children}</TaskModalProvider>
      </NewTaskProvider>
    </ProjectsProvider>
  );
}
