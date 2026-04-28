'use client';

import { NewTaskProvider } from '@/contexts/new-task-context';
import {
  ProjectsProvider,
  ProjectsProviderType,
} from '@/contexts/projects-context';

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
      <NewTaskProvider>{children}</NewTaskProvider>
    </ProjectsProvider>
  );
}
