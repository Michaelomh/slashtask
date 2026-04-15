import { findTrigger, removeTriggerToken } from '@/lib/shortcut-parser';
import { useMemo, useState } from 'react';

interface EffortItem {
  id: string;
  value: 1 | 2 | 3 | 4;
  label: string;
  matches: string[];
}

const EFFORT_ITEMS: EffortItem[] = [
  {
    id: '1',
    value: 1,
    label: 'S (Quick)',
    matches: ['1', 's', 'small', 'quick'],
  },
  { id: '2', value: 2, label: 'M (<1hr)', matches: ['2', 'm', 'medium'] },
  { id: '3', value: 3, label: 'L (1-3 hrs)', matches: ['3', 'l', 'large'] },
  { id: '4', value: 4, label: 'XL (>3 hrs)', matches: ['4', 'xl', 'huge'] },
];

interface ConfirmResult {
  newTitle: string;
  value: 1 | 2 | 3 | 4;
}

export function useEffortShortcut() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [triggerStart, setTriggerStart] = useState(-1);
  const [highlightIndex, setHighlightIndex] = useState(0);

  const filteredItems = useMemo(() => {
    if (!query) return EFFORT_ITEMS;
    const q = query.toLowerCase();
    return EFFORT_ITEMS.filter((item) =>
      item.matches.some((m) => m.startsWith(q))
    );
  }, [query]);

  function onInputChange(value: string, cursorPos: number) {
    const trigger = findTrigger(value, cursorPos, '@');
    if (trigger) {
      setIsOpen(true);
      setQuery(trigger.query);
      setTriggerStart(trigger.start);
      setHighlightIndex(0);
    } else {
      setIsOpen(false);
    }
  }

  function onKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>,
    currentTitle: string
  ): { consumed: boolean; confirm?: ConfirmResult; clearedTitle?: string } {
    if (!isOpen) return { consumed: false };

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, filteredItems.length - 1));
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

  function confirmAt(
    index: number,
    currentTitle: string
  ): ConfirmResult | null {
    const item = filteredItems[index];
    if (!item) return null;
    const end = triggerStart + 1 + query.length;
    const newTitle = removeTriggerToken(currentTitle, triggerStart, end);
    setIsOpen(false);
    return { newTitle, value: item.value };
  }

  return {
    isOpen,
    filteredItems,
    highlightIndex,
    onInputChange,
    onKeyDown,
    confirmAt,
    close: () => setIsOpen(false),
  };
}
