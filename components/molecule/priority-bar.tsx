import { DEFAULT_PRIORITY_INDEX, PriorityValues } from '@/lib/priority';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

type PriorityBarType = {
  taskPriority: PriorityValues;
  hideWhenDefault?: boolean;
};

export const PriorityBar = ({
  taskPriority = DEFAULT_PRIORITY_INDEX,
  hideWhenDefault = false,
}: PriorityBarType) => {
  const priorityColor = useMemo(() => {
    switch (taskPriority) {
      case 0:
        return 'bg-red-600';
      case 1:
        return 'bg-amber-300';
      case 2:
        return 'bg-green-400';
      default:
        break;
    }
  }, [taskPriority]);

  if (hideWhenDefault && taskPriority === DEFAULT_PRIORITY_INDEX) {
    return null;
  }

  return <div className={cn('h-full w-2 rounded-xs', priorityColor)}></div>;
};
