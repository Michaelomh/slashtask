'use client';

import { cn } from '@/lib/utils';
import { forwardRef, useRef } from 'react';

interface TitleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  highlight?: { start: number; end: number } | null;
  inputClassName?: string;
}

export const TitleInput = forwardRef<HTMLInputElement, TitleInputProps>(function TitleInput({
  highlight,
  className,
  inputClassName,
  value = '',
  onScroll,
  ...props
}, ref) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const str = String(value);

  const before = highlight ? str.slice(0, highlight.start) : str;
  const token = highlight ? str.slice(highlight.start, highlight.end) : '';
  const after = highlight ? str.slice(highlight.end) : '';

  return (
    <div className={cn('relative', className)}>
      {/* Highlight overlay — sits behind the input, pointer-events-none */}
      <div
        ref={overlayRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre"
        style={{ font: 'inherit' }}
      >
        <span className="text-foreground">{before}</span>
        {token && (
          <span className="bg-primary/20 text-primary rounded-sm px-0.5">
            {token}
          </span>
        )}
        <span className="text-foreground">{after}</span>
      </div>

      {/* Actual input — text transparent so overlay shows through, caret remains visible */}
      <input
        ref={ref}
        value={value}
        className={cn('[caret-color:var(--foreground)] text-transparent', inputClassName)}
        onScroll={(e) => {
          if (overlayRef.current) {
            overlayRef.current.scrollLeft = e.currentTarget.scrollLeft;
          }
          onScroll?.(e);
        }}
        {...props}
      />
    </div>
  );
});
