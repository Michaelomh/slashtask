import { Factory } from 'fishery';
import type { Task } from '@/lib/task';

export const taskFactory = Factory.define<Task>(() => ({
  id: 'task-1',
  title: 'Test task',
  description: null,
  description_text: null,
  project_id: null,
  priority: 2,
  effort: 2,
  due_date: null,
  is_completed: false,
  completed_at: null,
  order: 0,
  is_deleted: false,
  parent_task_id: null,
  recurrence_rule: null,
  user_id: 'user-1',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}));
