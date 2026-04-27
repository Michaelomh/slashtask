'use client';

import {
  DateGroup,
  NoDueDateGroup,
  OverdueGroup,
} from '@/components/date-group';
import { groupTasksByDate } from '@/lib/task-grouping';
import { Project } from '@/lib/project';
import { Task } from '@/lib/task';
import { isBefore, parseISO, startOfDay } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';

const today = startOfDay(new Date());

type ProjectViewProps = {
  tasks: Task[];
  projects: Project[];
};

export function ProjectView({
  tasks: initialTasks,
  projects,
}: ProjectViewProps) {
  const [tasks, setTasks] = useState(initialTasks);

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

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

  const isEmpty =
    noDueDateTasks.length === 0 &&
    overdueTasks.length === 0 &&
    groups.length === 0;

  return (
    <>
      {isEmpty ? (
        <p className="text-muted-foreground text-sm">
          No upcoming tasks in this project.
        </p>
      ) : (
        <>
          <NoDueDateGroup tasks={noDueDateTasks} projects={projects} />
          <OverdueGroup tasks={overdueTasks} projects={projects} />
          {groups.map((group) => (
            <DateGroup
              key={group.date}
              group={group}
              projectMap={projectMap}
              projects={projects}
            />
          ))}
        </>
      )}
    </>
  );
}
