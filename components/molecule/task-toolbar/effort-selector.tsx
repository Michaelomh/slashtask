'use client';

import { TaskToolbarDropdown } from '@/components/task-toolbar-dropdown';
import { Button } from '@/components/ui/button';
import { EFFORTS, EffortValues } from '@/lib/effort';
import { useEffect, useRef, useState } from 'react';

type EffortSelectorProps = {
  effort: EffortValues;
  onEffortChange: (p: EffortValues) => void;
};

export function EffortSelector({
  effort,
  onEffortChange,
}: EffortSelectorProps) {
  const selectedEffort = EFFORTS.find((p) => p.value === effort) || EFFORTS[3];
  const [isEffortOpen, setIsEffortOpen] = useState(false);
  const effortWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isEffortOpen) return;
    function handleOutsideClick(e: MouseEvent) {
      if (!effortWrapperRef.current?.contains(e.target as Node)) {
        setIsEffortOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsEffortOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isEffortOpen]);

  const effortItems = EFFORTS.map((p) => ({
    id: p.value,
    label: p.description,
    icon: (<span className="font-bold">{p.icon}</span>) as React.ReactNode,
  }));

  return (
    <div ref={effortWrapperRef} className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsEffortOpen((v) => !v)}
        className="max-w-40"
      >
        <span className="font-bold">{selectedEffort.icon}</span>
        <span className="truncate">{selectedEffort.label}</span>
      </Button>
      {isEffortOpen && (
        <TaskToolbarDropdown
          items={effortItems}
          onSelect={(i) => {
            onEffortChange(i as EffortValues);
            setIsEffortOpen(false);
          }}
        />
      )}
    </div>
  );
}
