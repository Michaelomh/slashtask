'use client';

import {
  createProject,
  deleteProject,
  ProjectInput,
  updateProject,
} from '@/app/actions/projects';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { useNewTask } from '@/contexts/new-task-context';
import { useProjects } from '@/contexts/projects-context';
import { Project } from '@/lib/project';
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
import { useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { NewTaskModal } from '../new-task-modal';
import { ProjectFormDialog } from '../project-form-dialog';
import GlobalSpinner from './global-spinner';

const navLinks = [
  { href: '/', label: 'Upcoming', icon: CalendarDays },
  { href: '/completed', label: 'Completed', icon: CheckCircle2 },
];

export function SidebarContent() {
  const { completedCount } = useProjects();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSyncing, startSyncTransition] = useTransition();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const { projects, setProjects } = useProjects();
  const { open: newTaskOpen, setOpen: setNewTaskOpen } = useNewTask();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Project | null>(null);

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        startSyncTransition(() => {
          router.refresh();
        });
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [router]);

  function navigate(href: string, e: React.MouseEvent) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0)
      return;
    e.preventDefault();
    if (href === pathname) return;
    setPendingHref(href);
    startTransition(() => {
      router.push(href);
    });
  }

  async function handleProjectCreate(data: ProjectInput) {
    try {
      const created = await createProject({
        ...data,
        order: projects.length + 1,
      });
      setProjects((prev) => [...prev, created]);
      toast.success(`${created.name} project has been created.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('projects_slug_unique_active')) {
        toast.error('Projects need to have a unique name.');
      } else {
        toast.error('Failed to create project');
      }
      throw err;
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
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('projects_slug_unique_active')) {
        toast.error('Projects need to have a unique name.');
      } else {
        toast.error('Failed to update project');
      }
      throw err;
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
        <button
          onClick={() => setNewTaskOpen(true)}
          className="text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors"
        >
          <CirclePlus className="size-4 shrink-0" />
          New Task
        </button>

        {navLinks.map(({ href, label, icon: Icon }) => {
          const isActive = pendingHref
            ? pendingHref === href
            : pathname === href;
          return (
            <Link
              key={href}
              href={href}
              prefetch={true}
              onClick={(e) => navigate(href, e)}
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
            const projectHref = `/project/${project.slug}`;
            const isActive = pendingHref
              ? pendingHref === projectHref
              : pathname === projectHref;
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
                  href={projectHref}
                  prefetch={true}
                  onClick={(e) => navigate(projectHref, e)}
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

      {/* Syncing indicator */}
      {isSyncing && (
        <div className="text-sidebar-foreground bg-sidebar-border mt-auto flex w-fit items-center gap-2 rounded-2xl px-4 py-2">
          <Spinner className="text-primary" />
          <p className="text-sm">Syncing data</p>
        </div>
      )}

      {/* Immediate navigation spinner — shows before loading.tsx Suspense fires */}
      {isPending && <GlobalSpinner />}

      {/* New task modal */}
      <NewTaskModal open={newTaskOpen} onClose={() => setNewTaskOpen(false)} />

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

export function Sidebar() {
  return (
    <aside className="border-sidebar-border bg-sidebar hidden w-64 shrink-0 border-r md:flex md:flex-col">
      <SidebarContent />
    </aside>
  );
}
