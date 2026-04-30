'use client';

import { Task } from '@/lib/task';
import { createContext, useContext, useState } from 'react';

type TaskModalContextType = {
  primedTask: Task | null;
  primeTask: (task: Task) => void;
  clearPrimedTask: () => void;
};

const TaskModalContext = createContext<TaskModalContextType>({
  primedTask: null,
  primeTask: () => {},
  clearPrimedTask: () => {},
});

export function useTaskModal() {
  return useContext(TaskModalContext);
}

export function TaskModalProvider({ children }: React.PropsWithChildren) {
  const [primedTask, setPrimedTask] = useState<Task | null>(null);
  return (
    <TaskModalContext.Provider
      value={{
        primedTask,
        primeTask: setPrimedTask,
        clearPrimedTask: () => setPrimedTask(null),
      }}
    >
      {children}
    </TaskModalContext.Provider>
  );
}
