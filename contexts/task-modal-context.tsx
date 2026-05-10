'use client';

import { Task } from '@/lib/task';
import { createContext, useContext, useState } from 'react';

type TaskModalContextType = {
  preloadedTask: Task | null;
  setPreloadTask: (task: Task) => void;
  clearPreloadedTask: () => void;
};

const TaskModalContext = createContext<TaskModalContextType>({
  preloadedTask: null,
  setPreloadTask: () => {},
  clearPreloadedTask: () => {},
});

export function useTaskModal() {
  return useContext(TaskModalContext);
}

export function TaskModalProvider({ children }: React.PropsWithChildren) {
  const [preloadedTask, setPreloadedTask] = useState<Task | null>(null);
  return (
    <TaskModalContext.Provider
      value={{
        preloadedTask,
        setPreloadTask: setPreloadedTask,
        clearPreloadedTask: () => setPreloadedTask(null),
      }}
    >
      {children}
    </TaskModalContext.Provider>
  );
}
