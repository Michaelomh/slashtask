'use client';

import {
  DateGroup,
  NoDueDateGroup,
  OverdueGroup,
} from '@/components/date-group';
import { groupTasksByDate } from '@/lib/task-grouping';
import { Task } from '@/lib/task';
import { isBefore, parseISO, startOfDay } from 'date-fns';
import { useEffect, useMemo, useOptimistic } from 'react';
import { useProjects } from '@/contexts/projects-context';
import { useOptimisticTasks } from '@/contexts/optimistic-tasks-context';

const today = startOfDay(new Date());

type ProjectViewProps = {
  tasks: Task[];
  projectId: string;
};

export function ProjectView({
  tasks: initialTasks,
  projectId,
}: ProjectViewProps) {
  const { projects } = useProjects();
  const [tasks, addOptimisticTask] = useOptimistic<Task[], Task>(
    initialTasks,
    (state, t) => [...state, t]
  );
  const { subscribe } = useOptimisticTasks();

  useEffect(
    () =>
      subscribe((t) => {
        if (
          !t.is_completed &&
          !t.parent_task_id &&
          t.project_id === projectId
        ) {
          addOptimisticTask(t);
        }
      }),
    [subscribe, addOptimisticTask, projectId]
  );

  const noDueDateTasks = useMemo(() => {
    return tasks
      .filter((t) => !t.is_completed && !t.due_date)
      .sort((a, b) => {
        if (a.order !== b.order) return a.order - b.order;
        return a.created_at.localeCompare(b.created_at);
      });
  }, [tasks]);

  const overdueTasks = useMemo(() => {
    return tasks
      .filter(
        (t) =>
          !t.is_completed && t.due_date && isBefore(parseISO(t.due_date), today)
      )
      .sort((a, b) => a.due_date!.localeCompare(b.due_date!));
  }, [tasks]);

  const groups = useMemo(() => {
    const upcomingTasks = tasks.filter(
      (t) => t.due_date && !isBefore(parseISO(t.due_date), today)
    );
    return groupTasksByDate(upcomingTasks);
  }, [tasks]);

  const projectMap = useMemo(
    () => new Map(projects.map((p) => [p.id, p])),
    [projects]
  );

  return (
    <>
      <NoDueDateGroup tasks={noDueDateTasks} />
      <OverdueGroup tasks={overdueTasks} />
      {groups.map((group) => (
        <DateGroup key={group.date} group={group} projectMap={projectMap} />
      ))}
    </>
  );
}
