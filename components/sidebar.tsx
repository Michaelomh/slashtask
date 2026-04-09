'use client';

import { Badge } from '@/components/ui/badge';
import { mockProjects, type Project } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { CalendarDays, CheckCircle2, CirclePlus, MoreHorizontal, Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ProjectFormDialog } from './project-form-dialog';

const navLinks = [
  { href: '/task', label: 'New Task', icon: CirclePlus },
  { href: '/', label: 'Upcoming', icon: CalendarDays },
  { href: '/completed', label: 'Completed', icon: CheckCircle2 },
];

export function SidebarContent() {
  const pathname = usePathname();
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Project | null>(null);

  function addProject(data: Omit<Project, 'taskCount'>) {
    setProjects((prev) => [
      ...prev,
      { ...data, order: prev.length + 1, taskCount: 0 },
    ]);
  }

  function updateProject(id: string, data: Omit<Project, 'taskCount'>) {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data } : p))
    );
  }

  function deleteProject(id: string) {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="flex h-full flex-col gap-4 px-3 py-4">
      {/* Navigation */}
      <nav className="flex flex-col gap-0.5">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-sidebar-border border-t" />

      {/* Projects */}
      <div className="flex flex-col gap-1">
        {/* Heading row */}
        <div className="flex items-center px-3">
          <p className="flex-1 text-xs font-semibold tracking-wider text-sidebar-foreground/50 uppercase">
            My Projects
          </p>
          <button
            onClick={() => setCreateOpen(true)}
            className="rounded-md p-0.5 text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            aria-label="Add project"
          >
            <Plus className="size-3.5" />
          </button>
        </div>

        {/* Project list */}
        <div className="mt-1 flex flex-col gap-0.5">
          {projects.map((project) => {
            const isActive = pathname === `/project/${project.id}`;
            return (
              <div key={project.id} className="group/project relative">
                <Link
                  href={`/project/${project.id}`}
                  className={cn(
                    'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                  )}
                >
                  <span className="shrink-0 text-base leading-none">
                    {project.emoji}
                  </span>
                  <span className="flex-1 truncate">{project.name}</span>

                  {/* Task count — hidden on hover */}
                  <Badge
                    variant="secondary"
                    className="ml-auto h-5 min-w-5 shrink-0 px-1.5 text-xs group-hover/project:hidden"
                  >
                    {project.taskCount}
                  </Badge>

                  {/* More button — shown on hover */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setEditTarget(project);
                    }}
                    className="ml-auto hidden size-5 shrink-0 items-center justify-center rounded text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-hover/project:flex"
                    aria-label={`Edit ${project.name}`}
                  >
                    <MoreHorizontal className="size-3.5" />
                  </button>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create dialog */}
      <ProjectFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
        onSave={addProject}
      />

      {/* Edit dialog */}
      {editTarget && (
        <ProjectFormDialog
          key={editTarget.id}
          open={!!editTarget}
          onOpenChange={(open) => { if (!open) setEditTarget(null); }}
          mode="edit"
          initialData={editTarget}
          onSave={(data) => updateProject(editTarget.id, data)}
          onDelete={() => deleteProject(editTarget.id)}
        />
      )}
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="border-sidebar-border bg-sidebar hidden w-64 shrink-0 border-r md:flex md:flex-col">
      <SidebarContent />
    </aside>
  );
}
