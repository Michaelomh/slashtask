'use client';

import { Task } from '@/lib/task';
import { createContext, useCallback, useContext, useRef } from 'react';

type Subscriber = (task: Task) => void;

type OptimisticTasksContextType = {
  publish: (task: Task) => void;
  subscribe: (fn: Subscriber) => () => void;
};

const OptimisticTasksContext = createContext<OptimisticTasksContextType>({
  publish: () => {},
  subscribe: () => () => {},
});

export function useOptimisticTasks() {
  return useContext(OptimisticTasksContext);
}

export function OptimisticTasksProvider({ children }: React.PropsWithChildren) {
  const subscribers = useRef(new Set<Subscriber>());

  const subscribe = useCallback((fn: Subscriber) => {
    subscribers.current.add(fn);
    return () => {
      subscribers.current.delete(fn);
    };
  }, []);

  const publish = useCallback((task: Task) => {
    subscribers.current.forEach((fn) => fn(task));
  }, []);

  return (
    <OptimisticTasksContext.Provider value={{ publish, subscribe }}>
      {children}
    </OptimisticTasksContext.Provider>
  );
}
