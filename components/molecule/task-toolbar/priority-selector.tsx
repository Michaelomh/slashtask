'use client';

import { TaskToolbarDropdown } from '@/components/task-toolbar-dropdown';
import { Button } from '@/components/ui/button';
import { PRIORITIES, PriorityValues } from '@/lib/priority';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';

type PrioritySelectorProps = {
  priority: PriorityValues;
  onPriorityChange: (p: PriorityValues) => void;
};

export function PrioritySelector({
  priority,
  onPriorityChange,
}: PrioritySelectorProps) {
  const selectedPriority =
    PRIORITIES.find((p) => p.value === priority) || PRIORITIES[3];
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const priorityWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isPriorityOpen) return;
    function handleOutsideClick(e: MouseEvent) {
      if (!priorityWrapperRef.current?.contains(e.target as Node)) {
        setIsPriorityOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsPriorityOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPriorityOpen]);

  const priorityItems = PRIORITIES.map((p) => ({
    id: p.value,
    label: p.description,
    icon: (
      <span className="font-bold" style={{ color: p.color }}>
        {p.icon}
      </span>
    ) as React.ReactNode,
  }));

  return (
    <div ref={priorityWrapperRef} className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsPriorityOpen((v) => !v)}
        className="max-w-40"
      >
        <span className={cn('font-bold', selectedPriority.color)}>
          {selectedPriority.icon}
        </span>
        <span className="truncate">{selectedPriority.label}</span>
      </Button>
      {isPriorityOpen && (
        <TaskToolbarDropdown
          items={priorityItems}
          onSelect={(i) => {
            onPriorityChange(i as PriorityValues);
            setIsPriorityOpen(false);
          }}
        />
      )}
    </div>
  );
}
