'use client';

import { NewTaskProvider } from '@/contexts/new-task-context';
import {
  ProjectsProvider,
  ProjectsProviderType,
} from '@/contexts/projects-context';

type AppProvidersType = ProjectsProviderType;

export function AppProviders({
  initialProjects,
  children,
}: React.PropsWithChildren<AppProvidersType>) {
  return (
    <ProjectsProvider initialProjects={initialProjects}>
      <NewTaskProvider>{children}</NewTaskProvider>
    </ProjectsProvider>
  );
}
