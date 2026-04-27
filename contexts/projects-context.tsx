'use client';

import { Project } from '@/lib/project';
import { createContext, useContext, useEffect, useState } from 'react';

type ProjectsContextType = {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
};

const ProjectsContext = createContext<ProjectsContextType>({
  projects: [],
  setProjects: () => {},
});

export function useProjects() {
  return useContext(ProjectsContext);
}

export type ProjectsProviderType = {
  initialProjects: Project[];
};

export function ProjectsProvider({
  initialProjects,
  children,
}: React.PropsWithChildren<ProjectsProviderType>) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);

  useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);

  return (
    <ProjectsContext.Provider value={{ projects, setProjects }}>
      {children}
    </ProjectsContext.Provider>
  );
}
