'use client';

import { Task } from '@/lib/task';
import { useEffect, useOptimistic } from 'react';
import { useProjects } from '@/contexts/projects-context';
import {
  OptimisticTaskAction,
  useOptimisticTasks,
} from '@/contexts/optimistic-tasks-context';
import { TaskItem } from '../task-item';

type CompletedViewProps = {
  tasks: Task[];
};

export function CompletedView({ tasks: initialTasks }: CompletedViewProps) {
  const { projects } = useProjects();
  const [tasks, dispatchOptimistic] = useOptimistic<
    Task[],
    OptimisticTaskAction
  >(initialTasks, (state, action) => {
    if (action.type === 'add') return [...state, action.task];
    return state.filter((t) => t.id !== action.id);
  });
  const { subscribe } = useOptimisticTasks();

  useEffect(
    () =>
      subscribe((action) => {
        if (action.type === 'add') {
          if (action.task.is_completed) dispatchOptimistic(action);
        } else {
          dispatchOptimistic(action);
        }
      }),
    [subscribe, dispatchOptimistic]
  );

  return (
    <div className="flex flex-col">
      {tasks.map((task) => {
        const project = projects.find((p) => p.id === task.project_id) ?? null;
        return (
          <TaskItem
            key={task.id}
            task={task}
            project={project}
            variant="completed"
          />
        );
      })}
    </div>
  );
}
