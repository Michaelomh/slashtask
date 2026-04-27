'use client';

import { cn } from '@/lib/utils';

interface TitleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputClassName?: string;
}

export function TitleInput({
  className,
  inputClassName,
  value = '',
  ...props
}: TitleInputProps) {
  return (
    <div className={cn('relative w-full', className)}>
      <input
        value={value}
        className={cn('caret-foreground', inputClassName)}
        {...props}
      />
    </div>
  );
}
