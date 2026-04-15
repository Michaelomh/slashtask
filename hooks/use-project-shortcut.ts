import { findProjectTrigger, removeTriggerToken } from '@/lib/shortcut-parser';
import { type Project } from '@/lib/types';
import { useMemo, useState } from 'react';

interface ConfirmResult {
  newTitle: string;
  project: Project;
}

export function useProjectShortcut(projects: Project[]) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [triggerStart, setTriggerStart] = useState(-1);
  const [highlightIndex, setHighlightIndex] = useState(0);

  const filteredProjects = useMemo(
    () =>
      projects.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase())
      ),
    [projects, query]
  );

  /** Call on every <input> onChange. */
  function onInputChange(value: string, cursorPos: number) {
    const trigger = findProjectTrigger(value, cursorPos);
    if (trigger) {
      setIsOpen(true);
      setQuery(trigger.query);
      setTriggerStart(trigger.start);
      setHighlightIndex(0);
    } else {
      setIsOpen(false);
    }
  }

  /**
   * Call on <input> onKeyDown.
   * Returns `{ consumed: true }` if the key was handled by the shortcut.
   * Returns `{ consumed: true, confirm }` when a project was selected via Enter.
   * Returns `{ consumed: false }` if the key should be handled by the caller.
   */
  function onKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>,
    currentTitle: string
  ): { consumed: boolean; confirm?: ConfirmResult; clearedTitle?: string } {
    if (!isOpen) return { consumed: false };

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, filteredProjects.length - 1));
      return { consumed: true };
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
      return { consumed: true };
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      const result = confirmAt(highlightIndex, currentTitle);
      return { consumed: true, confirm: result ?? undefined };
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      const end = triggerStart + 1 + query.length;
      const clearedTitle = removeTriggerToken(currentTitle, triggerStart, end);
      setIsOpen(false);
      return { consumed: true, clearedTitle };
    }

    return { consumed: false };
  }

  /** Call when user clicks a dropdown item. */
  function confirmAt(index: number, currentTitle: string): ConfirmResult | null {
    const project = filteredProjects[index];
    if (!project) return null;

    const end = triggerStart + 1 + query.length;
    const newTitle = removeTriggerToken(currentTitle, triggerStart, end);
    setIsOpen(false);
    return { newTitle, project };
  }

  function close() {
    setIsOpen(false);
  }

  return {
    isOpen,
    filteredProjects,
    highlightIndex,
    onInputChange,
    onKeyDown,
    confirmAt,
    close,
  };
}
