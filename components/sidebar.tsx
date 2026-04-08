'use client';

import { Badge } from '@/components/ui/badge';
import { mockProjects } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { CalendarDays, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/', label: 'Upcoming', icon: CalendarDays },
  { href: '/completed', label: 'Completed', icon: CheckCircle2 },
];

export function SidebarContent() {
  const pathname = usePathname();

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

      <div className="border-t border-sidebar-border" />

      {/* Projects */}
      <div className="flex flex-col gap-1">
        <p className="px-3 text-xs font-semibold tracking-wider text-sidebar-foreground/50 uppercase">
          My Projects
        </p>
        <div className="mt-1 flex flex-col gap-0.5">
          {mockProjects.map((project) => {
            const isActive = pathname === `/project/${project.id}`;
            return (
              <Link
                key={project.id}
                href={`/project/${project.id}`}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                )}
              >
                <span
                  className="shrink-0 text-base font-bold"
                  style={{ color: project.color }}
                >
                  #
                </span>
                <span className="flex-1 truncate">{project.name}</span>
                <Badge
                  variant="secondary"
                  className="ml-auto h-5 min-w-5 shrink-0 px-1.5 text-xs"
                >
                  {project.taskCount}
                </Badge>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar md:flex md:flex-col">
      <SidebarContent />
    </aside>
  );
}
