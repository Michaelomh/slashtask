'use client';

import { TaskToolbarDropdown } from '@/components/task-toolbar-dropdown';
import { Button } from '@/components/ui/button';
import { useProjects } from '@/contexts/projects-context';
import { Project } from '@/lib/project';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';

type ProjectSelectorProps = {
  project: Project | null;
  onProjectChange: (p: Project | null) => void;
  disabled?: boolean;
};

export function ProjectSelector({
  project,
  onProjectChange,
  disabled = false,
}: ProjectSelectorProps) {
  const { projects } = useProjects();
  const [isProjectOpen, setIsProjectOpen] = useState(false);
  const projectWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isProjectOpen) return;
    function handleOutsideClick(e: MouseEvent) {
      if (!projectWrapperRef.current?.contains(e.target as Node)) {
        setIsProjectOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsProjectOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isProjectOpen]);

  const projectItems = [
    { id: '__none__', label: 'No Project' },
    ...projects.map((p) => ({
      id: p.id,
      label: p.name,
      icon: (
        <span className="font-bold" style={{ color: p.color }}>
          {p.emoji}
        </span>
      ) as React.ReactNode,
    })),
  ];

  return (
    <div ref={projectWrapperRef} className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsProjectOpen((v) => !v)}
        disabled={disabled}
        className={cn('max-w-40', disabled && 'cursor-not-allowed opacity-100')}
      >
        {project ? (
          <>
            <span className="font-bold" style={{ color: project.color }}>
              {project.emoji}
            </span>
            <span className="truncate">{project.name}</span>
          </>
        ) : (
          'No Project'
        )}
      </Button>

      {isProjectOpen && (
        <TaskToolbarDropdown
          items={projectItems}
          onSelect={(i) => {
            const item = projectItems[i];
            onProjectChange(
              item.id === '__none__'
                ? null
                : (projects.find((p) => p.id === item.id) ?? null)
            );
            setIsProjectOpen(false);
          }}
        />
      )}
    </div>
  );
}
