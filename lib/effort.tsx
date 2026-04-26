import {
  BatteryFull,
  BatteryMedium,
  BatteryLow,
  BatteryWarning,
} from 'lucide-react';

export type EffortValues = 0 | 1 | 2 | 3 | 4;

export const DEFAULT_EFFORT_INDEX = 4;

export const EFFORTS: effort[] = [
  {
    value: 0,
    label: '<30min',
    description: '',
    dropdownValue: 'S (Quick)',
    icon: <BatteryLow className="size-4" />,
    matches: ['0', '30', 'quick', 'small', 's'],
  },
  {
    value: 1,
    label: '~1hr',
    description: '',
    dropdownValue: 'M (<1hr)',
    icon: <BatteryMedium className="size-4" />,
    matches: ['1', 'm', 'medium', 'hrs'],
  },
  {
    value: 2,
    label: '1-3hrs',
    description: '',
    dropdownValue: 'L (1-3 hrs)',
    icon: <BatteryFull className="size-4" />,
    matches: ['2', 'l', 'large', '1', '3', 'hrs'],
  },
  {
    value: 3,
    label: '>3hrs',
    description: '',
    dropdownValue: 'XL (>3 hrs)',
    icon: <BatteryWarning className="size-4" />,
    matches: ['3', 'xl', 'hrs'],
  },
  {
    value: 4,
    label: 'Effort',
    description: '',
    dropdownValue: 'No Effort',
    matches: ['4', 'no', '-'],
  },
];

type effort = {
  value: EffortValues;
  label: string;
  description: string;
  dropdownValue: string;
  icon?: React.ReactNode;
  matches?: string[];
};
