'use client';

import { TaskToolbarDropdown } from '@/components/task-toolbar-dropdown';
import { Button } from '@/components/ui/button';
import { useProjectShortcut } from '@/hooks/use-project-shortcut';
import { Project } from '@/lib/project';
import { useEffect, useRef, useState } from 'react';

type ProjectSelectorProps = {
  projects: Project[];
  project: Project | null;
  onProjectChange: (p: Project | null) => void;
  title: string;
  onTitleChange: (v: string) => void;

  projectShortcut: ReturnType<typeof useProjectShortcut>;
  titleInputRef: RefObject<HTMLInputElement | null>;
};

export function ProjectSelector({
  projects,
  project,
  onProjectChange,
  onTitleChange,
  title,
  projectShortcut,
  titleInputRef,
}: ProjectSelectorProps) {
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
      ),
    })),
  ];

  return (
    <div ref={projectWrapperRef} className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsProjectOpen((v) => !v)}
        className="max-w-40"
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

      {projectShortcut.isOpen && (
        <TaskToolbarDropdown
          items={projectShortcut.filteredProjects.map((p) => ({
            id: p.id,
            label: p.name,
            icon: p.emoji && (
              <span className="font-bold" style={{ color: p.color }}>
                {p.emoji}
              </span>
            ),
          }))}
          highlightIndex={projectShortcut.highlightIndex}
          onSelect={(i) => {
            const result = projectShortcut.confirmAt(i, title);
            if (result) {
              onTitleChange(result.newTitle);
              onProjectChange(result.project);
            }
            titleInputRef.current?.focus();
          }}
        />
      )}

      {isProjectOpen && (
        <TaskToolbarDropdown
          items={projectItems}
          highlightIndex={-1}
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
