'use client';

import { Badge } from '@/components/ui/badge';
import { type Project } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  CalendarDays,
  CheckCircle2,
  CirclePlus,
  MoreHorizontal,
  Plus,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { ProjectFormDialog } from './project-form-dialog';

const navLinks = [
  { href: '/task', label: 'New Task', icon: CirclePlus },
  { href: '/', label: 'Upcoming', icon: CalendarDays },
  { href: '/completed', label: 'Completed', icon: CheckCircle2 },
];

interface SidebarContentProps {
  initialProjects: Project[];
}

export function SidebarContent({ initialProjects }: SidebarContentProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Project | null>(null);

  async function handleCreate(
    data: Omit<Project, 'is_deleted' | 'user_id' | 'created_at' | 'updated_at'>
  ) {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, order: projects.length + 1 }),
    });
    if (!res.ok) {
      toast.error('Failed to create project');
      return;
    }
    const created: Project = await res.json();
    setProjects((prev) => [...prev, created]);
    router.refresh();
  }

  async function handleUpdate(
    id: string,
    data: Omit<Project, 'is_deleted' | 'user_id' | 'created_at' | 'updated_at'>
  ) {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      toast.error('Failed to update project');
      return;
    }
    const updated: Project = await res.json();
    setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
    router.refresh();
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      toast.error('Failed to delete project');
      return;
    }
    setProjects((prev) => prev.filter((p) => p.id !== id));
    router.refresh();
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
          <p className="text-sidebar-foreground/50 flex-1 text-xs font-semibold tracking-wider uppercase">
            My Projects
          </p>
          <button
            onClick={() => setCreateOpen(true)}
            className="text-sidebar-foreground/50 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground rounded-md p-0.5 transition-colors"
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

                  {/* More button — shown on hover */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setEditTarget(project);
                    }}
                    className="text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ml-auto hidden size-5 shrink-0 items-center justify-center rounded transition-colors group-hover/project:flex"
                    aria-label={`Edit ${project.name}`}
                  >
                    <MoreHorizontal className="size-3.5" />
                  </button>

                  <Badge
                    variant="secondary"
                    className="ml-auto h-5 min-w-5 shrink-0 px-1.5 text-xs group-hover/project:hidden"
                  >
                    1
                  </Badge>
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
        onSave={handleCreate}
      />

      {/* Edit dialog */}
      {editTarget && (
        <ProjectFormDialog
          key={editTarget.id}
          open={!!editTarget}
          onOpenChange={(open) => {
            if (!open) setEditTarget(null);
          }}
          mode="edit"
          initialData={editTarget}
          onSave={(data) => handleUpdate(editTarget.id, data)}
          onDelete={() => handleDelete(editTarget.id)}
        />
      )}
    </div>
  );
}

interface SidebarProps {
  initialProjects: Project[];
}

export function Sidebar({ initialProjects }: SidebarProps) {
  return (
    <aside className="border-sidebar-border bg-sidebar hidden w-64 shrink-0 border-r md:flex md:flex-col">
      <SidebarContent initialProjects={initialProjects} />
    </aside>
  );
}
