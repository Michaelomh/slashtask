'use client';

import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';

export type DropdownItem = {
  id: string;
  label: string;
  icon?: React.ReactNode;
};

type TaskToolbarDropdownProps = {
  items: DropdownItem[];
  onSelect: (index: number) => void;
};

export function TaskToolbarDropdown({
  items,
  onSelect,
}: TaskToolbarDropdownProps) {
  const listRef = useRef<HTMLDivElement>(null);

  if (items.length === 0) {
    return (
      <div className="border-border bg-popover text-muted-foreground absolute top-full left-0 z-50 mt-1 w-56 rounded-md border p-2 text-sm shadow-md">
        No matches
      </div>
    );
  }

  return (
    <div
      ref={listRef}
      role="listbox"
      className="border-border bg-popover absolute top-full left-0 z-50 mt-1 max-h-48 w-56 overflow-y-auto rounded-md border shadow-md"
    >
      {items.map((item, i) => (
        <div
          role="option"
          key={item.id}
          title={item.label}
          className={cn(
            'flex cursor-pointer items-center gap-2 px-3 py-2 text-sm',
            'text-foreground hover:bg-accent/50'
          )}
          // preventDefault keeps focus in the <input>
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(i);
          }}
        >
          {item.icon && <span className="shrink-0">{item.icon}</span>}
          <span className="truncate">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
