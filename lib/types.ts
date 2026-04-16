export type Project = {
  id: string;
  name: string;
  slug: string;
  color: string;
  emoji: string;
  order: number;
  is_deleted: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
  // computed
  task_count?: number;
};

export type Task = {
  id: string;
  title: string;
  description: string | null;
  description_text: string | null;
  project_id: string | null;
  priority: 1 | 2 | 3 | 4;
  effort: 1 | 2 | 3 | 4;
  due_date: string | null; // YYYY-MM-DD
  is_completed: boolean;
  completed_at: string | null;
  order: number;
  is_deleted: boolean;
  parent_task_id: string | null;
  recurrence_rule: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  // computed
  sub_task_total?: number;
  sub_task_completed?: number;
};
