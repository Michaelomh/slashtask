'use client';

import { DateGroup, groupTasksByDate } from '@/components/date-group';
import { mockProjects, mockTasks } from '@/lib/mock-data';
import { notFound } from 'next/navigation';
import { use } from 'react';

export default function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const project = mockProjects.find((p) => p.id === id);

  if (!project) notFound();

  const projectTasks = mockTasks.filter(
    (t) => t.project_id === id && !t.is_completed
  );
  const groups = groupTasksByDate(projectTasks);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center gap-2">
        <span className="text-2xl">{project.emoji}</span>
        <h1 className="text-xl font-semibold">{project.name}</h1>
      </div>

      {groups.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No upcoming tasks in this project.
        </p>
      ) : (
        groups.map((group) => (
          <DateGroup key={group.date} group={group} projects={mockProjects} />
        ))
      )}
    </div>
  );
}
