/**
 * Takes the due_date string from database and converts it to a Date object.
 *
 * @param date - string | null from the database
 * @returns Date object at midnight local time, or null if input is falsy or invalid
 */
export function formatDueDate(date: string | null): Date | null {
  if (!date) return null;
  const formatDate = new Date(date + 'T00:00:00');
  return isNaN(formatDate.getTime()) ? null : formatDate;
}
