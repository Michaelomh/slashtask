import {
  BatteryFull,
  BatteryMedium,
  BatteryLow,
  BatteryWarning,
  Battery,
  Star,
} from 'lucide-react';

export type PriorityValues = 0 | 1 | 2 | 3;

export const PRIORITIES: priority[] = [
  {
    value: 0,
    label: 'High',
    description: 'Must be done',
    color: 'text-red-500 hover:text-red-500 border-red-500',
    icon: (
      <>
        <Star className="size-3" />
        <Star className="size-3" />
        <Star className="size-3" />
      </>
    ),
  },
  {
    value: 1,
    label: 'Medium',
    description: 'Should be done',
    color: 'text-amber-500 hover:text-amber-500 border-amber-500',
    icon: (
      <>
        <Star className="size-3" />
        <Star className="size-3" />
      </>
    ),
  },
  {
    value: 2,
    label: 'Low',
    description: 'Good if done',
    color: 'text-lime-500 hover:text-lime-500 border-lime-500',
    icon: <Star className="size-3" />,
  },
  {
    value: 3,
    label: 'No Priority',
    description: 'Bonus if can be done',
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

export type EffortValues = 0 | 1 | 2 | 3 | 4;

export const EFFORTS: effort[] = [
  {
    value: 0,
    label: 'Small (Quick)',
    description: '',
    dropdownValue: 'S (Quick)',
    icon: <BatteryLow className="size-3" />,
  },
  {
    value: 1,
    label: 'Medium (<1hr)',
    description: '',
    dropdownValue: 'M (<1hr)',
    icon: <BatteryMedium className="size-3" />,
  },
  {
    value: 2,
    label: 'Large (1-3hrs)',
    description: '',
    dropdownValue: 'L (1-3 hrs)',
    icon: <BatteryFull className="size-3" />,
  },
  {
    value: 3,
    label: 'Huge (>3hrs',
    description: '',
    dropdownValue: 'XL (>3 hrs)',
    icon: <BatteryWarning className="size-3" />,
  },
  {
    value: 4,
    label: 'Effort',
    description: '',
    dropdownValue: '-',
    icon: <Battery className="size-3" />,
  },
];

type effort = {
  value: number;
  label: string;
  description: string;
  dropdownValue: string;
  icon?: React.ReactNode;
};
