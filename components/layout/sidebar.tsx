'use client';

import {
  createProject,
  deleteProject,
  ProjectInput,
  updateProject,
} from '@/app/actions/projects';
import { Badge } from '@/components/ui/badge';
import { Project } from '@/lib/types';
import { cn, toKebabCase } from '@/lib/utils';
import {
  CalendarDays,
  CheckCircle2,
  CirclePlus,
  PencilLine,
  Plus,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ProjectFormDialog } from '../project-form-dialog';

const navLinks = [
  { href: '/task', label: 'New Task', icon: CirclePlus },
  { href: '/', label: 'Upcoming', icon: CalendarDays },
  { href: '/completed', label: 'Completed', icon: CheckCircle2 },
];

type SidebarContentProps = {
  initialProjects: Project[];
  completedCount: number;
};

export function SidebarContent({
  initialProjects,
  completedCount,
}: SidebarContentProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Project | null>(null);

  // This would update the project data whenever there is a change.
  useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);

  async function handleProjectCreate(data: ProjectInput) {
    try {
      const created = await createProject({
        ...data,
        order: projects.length + 1,
      });
      setProjects((prev) => [...prev, created]);
      toast.success(`${created.name} project has been created.`);
    } catch {
      toast.error('Failed to create project');
    }
  }

  async function handleProjectUpdate(data: ProjectInput) {
    try {
      if (editTarget) {
        const updated = await updateProject(editTarget.id, data);
        setProjects((prev) =>
          prev.map((p) => (p.id === editTarget.id ? updated : p))
        );
        if (
          pathname.includes(`/project/${editTarget.slug}`) &&
          editTarget.name !== data.name
        ) {
          router.push(`/project/${toKebabCase(data.name)}`);
        }
        toast.success(`${updated.name} project has been successfully updated.`);
      }
    } catch {
      toast.error('Failed to update project');
    }
  }

  async function handleProjectDelete(id: string, projectSlug: string) {
    try {
      const deleted = await deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));

      toast.success(`${deleted.name} project has been successfully deleted.`);
      if (pathname.includes(`/project/${projectSlug}`)) {
        router.push('/');
      }
    } catch {
      toast.error('Failed to delete project');
    }
  }

  return (
    <div className="flex h-full flex-col gap-4 px-3 py-4">
      {/* Logo */}
      <Link href="/">
        <div className="flex items-center gap-2.5 px-3 py-1">
          <Image
            src="/logo.png"
            priority
            alt="SlashTask logo"
            width={24}
            height={24}
            className="shrink-0"
          />
          <span className="text-sm font-semibold tracking-tight">
            SlashTask
          </span>
        </div>
      </Link>

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

              {label === 'Completed' && (
                <Badge
                  variant="secondary"
                  className="ml-auto h-5 min-w-5 shrink-0 px-1.5 text-xs group-hover/project:hidden"
                >
                  {completedCount}
                </Badge>
              )}
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
            Projects
          </p>
          <button
            onClick={() => setCreateOpen(true)}
            className="text-sidebar-foreground/50 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground cursor-pointer rounded-md p-0.5 transition-colors"
            aria-label="Add project"
          >
            <Plus className="size-4" />
          </button>
        </div>

        {/* Project list */}
        <div className="mt-1 flex flex-col gap-0.5">
          {projects.map((project) => {
            const isActive = pathname === `/project/${project.slug}`;
            return (
              <div
                key={project.id}
                className="group/project relative border-l-4"
                style={
                  {
                    borderLeftColor: project.color,
                    '--project-color': project.color,
                    '--project-bg-active': `${project.color}25`,
                    '--project-bg-hover': `${project.color}15`,
                  } as React.CSSProperties
                }
              >
                <Link
                  href={`/project/${project.slug}`}
                  className={cn(
                    'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-(--project-bg-active) text-(--project-color)'
                      : 'text-sidebar-foreground hov hover:bg-(--project-bg-hover) hover:text-(--project-color)'
                  )}
                >
                  <span className="shrink-0 text-base leading-none">
                    {project.emoji}
                  </span>
                  <span className="flex-1 truncate">{project.name}</span>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setEditTarget(project);
                    }}
                    className="ml-auto hidden size-5 shrink-0 items-center justify-center rounded opacity-60 transition-colors group-hover/project:flex hover:cursor-pointer hover:opacity-100"
                    aria-label={`Edit ${project.name}`}
                  >
                    <PencilLine className="size-3.5" />
                  </button>

                  {(project.task_count ?? 0) > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-auto h-5 min-w-5 shrink-0 px-1.5 text-xs group-hover/project:hidden"
                    >
                      {project.task_count}
                    </Badge>
                  )}
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
        onSave={handleProjectCreate}
      />

      {/* Edit dialog */}
      {editTarget && (
        <ProjectFormDialog
          open={!!editTarget}
          onOpenChange={(open) => {
            if (!open) setEditTarget(null);
          }}
          mode="edit"
          data={editTarget}
          onSave={(data) => handleProjectUpdate(data)}
          onDelete={() => handleProjectDelete(editTarget.id, editTarget.slug)}
        />
      )}
    </div>
  );
}

type SidebarProps = {
  projects: Project[];
  completedCount: number;
};

export function Sidebar({ projects, completedCount }: SidebarProps) {
  return (
    <aside className="border-sidebar-border bg-sidebar hidden w-64 shrink-0 border-r md:flex md:flex-col">
      <SidebarContent
        initialProjects={projects}
        completedCount={completedCount}
      />
    </aside>
  );
}
