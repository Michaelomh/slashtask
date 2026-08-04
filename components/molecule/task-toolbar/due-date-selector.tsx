'use client';

import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, isToday, isTomorrow } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import { useState } from 'react';

type DueDateSelectorProps = {
  value: Date | null;
  onChange: (date: Date | null) => void;
  className?: string;
  disabled?: boolean;
};

function formatDateLabel(date: Date): string {
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tmr';
  return format(date, 'MMM dd');
}

export function DueDateSelector({
  value,
  onChange,
  className,
  disabled = false,
}: DueDateSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={disabled ? false : open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={disabled}
        className={cn(
          'inline-flex h-8 items-center gap-1 rounded-md border px-2.5 text-sm transition-colors',
          value
            ? 'border-green-500/40 text-green-500 hover:border-green-500/60'
            : 'border-border text-muted-foreground hover:border-border/80 hover:text-foreground',
          disabled && 'cursor-default opacity-50 hover:border-green-500/40',
          className
        )}
      >
        <CalendarIcon className="size-3.5 shrink-0" />
        <span>{value ? formatDateLabel(value) : 'Date'}</span>
        {value && !disabled && (
          <span
            role="button"
            tabIndex={0}
            aria-label="Clear date"
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation();
                onChange(null);
              }
            }}
            className="hover:text-destructive ml-0.5 rounded"
          >
            <X className="size-3" />
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value ?? undefined}
          onSelect={(date) => {
            onChange(date ?? null);
            setOpen(false);
          }}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
