import { DEFAULT_EFFORT_INDEX, EffortValues, EFFORTS } from '@/lib/effort';
import { useMemo } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

type EffortBadgeType = {
  taskEffort: EffortValues;
};

export const EffortBadge = ({
  taskEffort = DEFAULT_EFFORT_INDEX,
}: EffortBadgeType) => {
  const effortData = useMemo(() => EFFORTS.at(taskEffort), [taskEffort]);

  if (taskEffort === DEFAULT_EFFORT_INDEX || !effortData) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger>
        <div className="flex size-5 items-center justify-center">
          {effortData.icon}
        </div>
      </TooltipTrigger>
      <TooltipContent>{effortData.shortDescription}</TooltipContent>
    </Tooltip>
  );
};
