'use client';

import { Task } from '@/lib/task';
import { useEffect, useState } from 'react';
import { useProjects } from '@/contexts/projects-context';
import { TaskItem } from '../task-item';

type CompletedViewProps = {
  tasks: Task[];
};

export function CompletedView({ tasks: initialTasks }: CompletedViewProps) {
  const { projects } = useProjects();
  const [tasks, setTasks] = useState(initialTasks);

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

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
