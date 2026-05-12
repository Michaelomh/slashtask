'use client';

import { Task } from '@/lib/task';
import { createContext, useCallback, useContext, useRef } from 'react';

// Pub/sub bridge for optimistic task updates. Mutation sites (create/delete)
// publish an action; each list view subscribes and applies the action to its
// own useOptimistic state. Lets a single click update many views at once
// without lifting all task state into a shared store.
export type OptimisticTaskAction =
  | { type: 'add'; task: Task }
  | { type: 'remove'; id: string };

type Subscriber = (action: OptimisticTaskAction) => void;

type OptimisticTasksContextType = {
  publishAdd: (task: Task) => void;
  publishRemove: (id: string) => void;
  subscribe: (fn: Subscriber) => () => void;
};

const OptimisticTasksContext = createContext<OptimisticTasksContextType>({
  publishAdd: () => {},
  publishRemove: () => {},
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

  // Publishers must be called inside a transition (e.g. useServerAction.run)
  // so useOptimistic in subscribers holds the optimistic state until the
  // server action and its revalidation complete.
  const publishAdd = useCallback((task: Task) => {
    subscribers.current.forEach((fn) => fn({ type: 'add', task }));
  }, []);

  const publishRemove = useCallback((id: string) => {
    subscribers.current.forEach((fn) => fn({ type: 'remove', id }));
  }, []);

  return (
    <OptimisticTasksContext.Provider
      value={{ publishAdd, publishRemove, subscribe }}
    >
      {children}
    </OptimisticTasksContext.Provider>
  );
}
