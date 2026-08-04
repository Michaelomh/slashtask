'use client';

import { Project } from '@/lib/project';
import { createContext, useContext, useEffect, useState } from 'react';

type ProjectsContextType = {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  completedCount: number;
  setCompletedCount: React.Dispatch<React.SetStateAction<number>>;
  adjustProjectTaskCount: (
    projectId: string | null | undefined,
    delta: number
  ) => void;
  adjustCompletedCount: (delta: number) => void;
};

const ProjectsContext = createContext<ProjectsContextType>({
  projects: [],
  setProjects: () => {},
  completedCount: 0,
  setCompletedCount: () => {},
  adjustProjectTaskCount: () => {},
  adjustCompletedCount: () => {},
});

export function useProjects() {
  return useContext(ProjectsContext);
}

export type ProjectsProviderType = {
  initialProjects: Project[];
  initialCompletedCount: number;
};

export function ProjectsProvider({
  initialProjects,
  initialCompletedCount,
  children,
}: React.PropsWithChildren<ProjectsProviderType>) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [completedCount, setCompletedCount] = useState(initialCompletedCount);

  useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);

  useEffect(() => {
    setCompletedCount(initialCompletedCount);
  }, [initialCompletedCount]);

  function adjustProjectTaskCount(
    projectId: string | null | undefined,
    delta: number
  ) {
    if (!projectId) {
      return;
    }

    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, task_count: Math.max(0, (p.task_count ?? 0) + delta) }
          : p
      )
    );
  }

  function adjustCompletedCount(delta: number) {
    setCompletedCount((prev) => Math.max(0, prev + delta));
  }

  return (
    <ProjectsContext.Provider
      value={{
        projects,
        setProjects,
        completedCount,
        setCompletedCount,
        adjustProjectTaskCount,
        adjustCompletedCount,
      }}
    >
      {children}
    </ProjectsContext.Provider>
  );
}
