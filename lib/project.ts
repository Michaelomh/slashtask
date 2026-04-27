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
