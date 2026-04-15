export const PRIORITIES: priority[] = [
  {
    value: 1,
    label: 'High Priority',
    description: 'Must be done',
    color: 'text-red-500',
  },
  {
    value: 2,
    label: 'Medium Priority',
    description: 'Should be done',
    color: 'text-orange-500',
  },
  {
    value: 3,
    label: 'Low Priority',
    description: 'Good if done',
    color: 'text-blue-500',
  },
  {
    value: 4,
    label: 'No Priority',
    description: 'Bonus if can be done',
    color: 'text-muted-foreground',
  },
];

type priority = {
  value: number;
  label: string;
  description: string;
  color: string;
};

export const EFFORTS: effort[] = [
  { value: 1, label: 'Small', description: '', dropdownValue: 'S (Quick)' },
  { value: 2, label: 'Medium', description: '', dropdownValue: 'M (<1hr)' },
  { value: 3, label: 'Large', description: '', dropdownValue: 'L (1-3 hrs)' },
  { value: 4, label: 'Huge', description: '', dropdownValue: 'XL (>3 hrs)' },
];

type effort = {
  value: number;
  label: string;
  description: string;
  dropdownValue: string;
};
