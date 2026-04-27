/**
 * Takes the due_date string from database and format it to Date string.
 *
 * @param dueDate - string | null from the database
 * @returns Date object of due date at start of day
 */
export function formatDueDate(dueDate: string | null): Date | null {
  if (!dueDate) return null;
  return new Date(dueDate + 'T00:00:00');
}
