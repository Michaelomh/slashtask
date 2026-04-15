export const PRIORITIES: priority[] = [
  { value: 1, label: 'Priority 1', color: 'text-red-500' },
  { value: 2, label: 'Priority 2', color: 'text-orange-500' },
  { value: 3, label: 'Priority 3', color: 'text-blue-500' },
  { value: 4, label: 'Priority 4', color: 'text-muted-foreground' },
];

type priority = {
  value: number,
  label: string,
  color: string,
}

export const EFFORTS: effort[] = [
  { value: 1, label: 'Small', dropdownValue: 'S (Quick)' },
  { value: 2, label: 'Medium', dropdownValue: 'M (<1hr)' },
  { value: 3, label: 'Large', dropdownValue: 'L (1-3 hrs)' },
  { value: 4, label: 'Huge', dropdownValue: 'XL (>3 hrs)' },
];

type effort = {
  value: number,
  label: string,
  dropdownValue: string,
}
