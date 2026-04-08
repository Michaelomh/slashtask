export type Project = {
  id: string;
  name: string;
  color: string;
  emoji: string;
  order: number;
  taskCount: number;
};

export type Task = {
  id: string;
  title: string;
  description_text?: string;
  project_id: string | null;
  priority: 1 | 2 | 3 | 4;
  effort: 1 | 2 | 3 | 4;
  due_date: string | null; // YYYY-MM-DD
  is_completed: boolean;
  completed_at: string | null;
  order: number;
};

function dateStr(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

export const mockProjects: Project[] = [
  { id: 'p1', name: 'Work', color: '#4a90d9', emoji: '💼', order: 1, taskCount: 5 },
  { id: 'p2', name: 'Health', color: '#27ae60', emoji: '🏃', order: 2, taskCount: 8 },
  { id: 'p3', name: 'Personal', color: '#e67e22', emoji: '🏠', order: 3, taskCount: 4 },
  { id: 'p4', name: 'Learning', color: '#9b59b6', emoji: '📚', order: 4, taskCount: 6 },
  { id: 'p5', name: 'Finance', color: '#e74c3c', emoji: '💰', order: 5, taskCount: 2 },
];

export const mockTasks: Task[] = [
  // Overdue
  { id: 't1', title: 'Review Q1 report', description_text: 'Go through the quarterly figures and prepare summary', project_id: 'p1', priority: 2, effort: 3, due_date: dateStr(-3), is_completed: false, completed_at: null, order: 1 },
  { id: 't2', title: 'Book dentist appointment', project_id: 'p2', priority: 1, effort: 1, due_date: dateStr(-3), is_completed: false, completed_at: null, order: 2 },
  { id: 't3', title: 'Pay credit card bill', project_id: 'p5', priority: 3, effort: 1, due_date: dateStr(-1), is_completed: false, completed_at: null, order: 1 },

  // Today
  { id: 't4', title: 'Team standup', description_text: 'Daily sync with the engineering team', project_id: 'p1', priority: 2, effort: 1, due_date: dateStr(0), is_completed: false, completed_at: null, order: 1 },
  { id: 't5', title: 'Morning run', project_id: 'p2', priority: 1, effort: 2, due_date: dateStr(0), is_completed: false, completed_at: null, order: 2 },
  { id: 't6', title: 'Read chapter 4', project_id: 'p4', priority: 1, effort: 2, due_date: dateStr(0), is_completed: false, completed_at: null, order: 3 },

  // Tomorrow
  { id: 't7', title: 'Prepare design review slides', description_text: 'Cover the new onboarding flow', project_id: 'p1', priority: 3, effort: 3, due_date: dateStr(1), is_completed: false, completed_at: null, order: 1 },
  { id: 't8', title: 'Grocery shopping', project_id: 'p3', priority: 1, effort: 2, due_date: dateStr(1), is_completed: false, completed_at: null, order: 2 },

  // Day 3
  { id: 't9', title: 'Weekly retrospective', project_id: 'p1', priority: 2, effort: 2, due_date: dateStr(3), is_completed: false, completed_at: null, order: 1 },
  { id: 't10', title: 'Yoga class', project_id: 'p2', priority: 1, effort: 2, due_date: dateStr(3), is_completed: false, completed_at: null, order: 2 },

  // Day 5
  { id: 't11', title: 'Finish React course module 6', project_id: 'p4', priority: 2, effort: 3, due_date: dateStr(5), is_completed: false, completed_at: null, order: 1 },
  { id: 't12', title: 'Call parents', project_id: 'p3', priority: 2, effort: 1, due_date: dateStr(5), is_completed: false, completed_at: null, order: 2 },

  // Day 7
  { id: 't13', title: 'Submit expense report', project_id: 'p5', priority: 3, effort: 2, due_date: dateStr(7), is_completed: false, completed_at: null, order: 1 },
  { id: 't14', title: 'Deep work session: refactor auth module', project_id: 'p1', priority: 2, effort: 4, due_date: dateStr(7), is_completed: false, completed_at: null, order: 2 },

  // Day 9
  { id: 't15', title: 'Physio appointment', project_id: 'p2', priority: 2, effort: 1, due_date: dateStr(9), is_completed: false, completed_at: null, order: 1 },

  // Day 11
  { id: 't16', title: 'Write blog post draft', project_id: 'p4', priority: 1, effort: 3, due_date: dateStr(11), is_completed: false, completed_at: null, order: 1 },
  { id: 't17', title: 'Plan weekend trip', project_id: 'p3', priority: 1, effort: 2, due_date: dateStr(11), is_completed: false, completed_at: null, order: 2 },

  // Day 14
  { id: 't18', title: 'Quarterly OKR review', project_id: 'p1', priority: 3, effort: 3, due_date: dateStr(14), is_completed: false, completed_at: null, order: 1 },
  { id: 't19', title: 'Monthly budget review', project_id: 'p5', priority: 2, effort: 2, due_date: dateStr(14), is_completed: false, completed_at: null, order: 2 },

  // Day 16
  { id: 't20', title: 'Run 10k', project_id: 'p2', priority: 2, effort: 3, due_date: dateStr(16), is_completed: false, completed_at: null, order: 1 },

  // Day 18
  { id: 't21', title: 'Read "Deep Work" chapter 7', project_id: 'p4', priority: 1, effort: 2, due_date: dateStr(18), is_completed: false, completed_at: null, order: 1 },
  { id: 't22', title: 'Fix production bug #231', project_id: 'p1', priority: 4, effort: 3, due_date: dateStr(18), is_completed: false, completed_at: null, order: 2 },

  // Day 21
  { id: 't23', title: 'Renew gym membership', project_id: 'p2', priority: 1, effort: 1, due_date: dateStr(21), is_completed: false, completed_at: null, order: 1 },
  { id: 't24', title: 'House cleaning', project_id: 'p3', priority: 1, effort: 2, due_date: dateStr(21), is_completed: false, completed_at: null, order: 2 },

  // Completed tasks
  { id: 'tc1', title: 'Setup project repository', project_id: 'p1', priority: 2, effort: 2, due_date: dateStr(-5), is_completed: true, completed_at: new Date(Date.now() - 5 * 86400000).toISOString(), order: 1 },
  { id: 'tc2', title: 'Morning meditation', project_id: 'p2', priority: 1, effort: 1, due_date: dateStr(-4), is_completed: true, completed_at: new Date(Date.now() - 4 * 86400000).toISOString(), order: 1 },
  { id: 'tc3', title: 'Read "Atomic Habits" chapter 3', project_id: 'p4', priority: 1, effort: 2, due_date: dateStr(-2), is_completed: true, completed_at: new Date(Date.now() - 2 * 86400000).toISOString(), order: 1 },
];
