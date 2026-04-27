import { Star, StarOff, StarHalf } from 'lucide-react';

export type PriorityValues = 0 | 1 | 2 | 3;

export const DEFAULT_PRIORITY_INDEX = 3;

export const PRIORITIES: priority[] = [
  {
    value: 0,
    label: 'High',
    description: 'Must be done',
    color: 'text-red-500 hover:text-red-500 border-red-500',
    icon: <Star className="size-3" />,
  },
  {
    value: 1,
    label: 'Medium',
    description: 'Should be done',
    color: 'text-amber-500 hover:text-amber-500 border-amber-500',
    icon: <StarHalf className="size-3" />,
  },
  {
    value: 2,
    label: 'Low',
    description: 'Good if done',
    color: 'text-lime-500 hover:text-lime-500 border-lime-500',
    icon: <StarOff className="size-3" />,
  },
  {
    value: 3,
    label: 'No Priority',
    description: 'No Priority',
    color:
      'text-muted-foreground hover:text-muted-foreground border-muted-foreground',
  },
];

type priority = {
  value: number;
  label: string;
  description: string;
  color: string;
  icon?: React.ReactNode;
};
