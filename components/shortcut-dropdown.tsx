'use client';

import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';

export interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface ShortcutDropdownProps {
  items: DropdownItem[];
  highlightIndex: number;
  onSelect: (index: number) => void;
}

export function ShortcutDropdown({
  items,
  highlightIndex,
  onSelect,
}: ShortcutDropdownProps) {
  const listRef = useRef<HTMLDivElement>(null);

  // Scroll highlighted item into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const item = list.children[highlightIndex] as HTMLElement | undefined;
    item?.scrollIntoView({ block: 'nearest' });
  }, [highlightIndex]);

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
      className="border-border bg-popover absolute top-full left-0 z-50 mt-1 max-h-48 w-56 overflow-y-auto rounded-md border shadow-md"
    >
      {items.map((item, i) => (
        <div
          key={item.id}
          className={cn(
            'flex cursor-pointer items-center gap-2 px-3 py-2 text-sm',
            i === highlightIndex
              ? 'bg-accent text-accent-foreground'
              : 'text-foreground hover:bg-accent/50'
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
