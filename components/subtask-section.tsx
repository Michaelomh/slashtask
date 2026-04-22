'use client';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { TaskEditor, TaskEditorValues } from '@/components/task-editor';
import { Project, Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react';
import { createTask, deleteTask, updateTask } from '@/app/actions/tasks';
import { useState } from 'react';
import { toast } from 'sonner';

type SubTaskSectionProps = {
  projects: Project[];
  subTasks: Task[];
  parentTask: Task;
};

export function SubTaskSection({
  parentTask,
  projects,
  subTasks: initialSubTasks,
}: SubTaskSectionProps) {
  const [subTasks, setSubTasks] = useState<Task[]>(initialSubTasks);
  const [addingSubTask, setAddingSubTask] = useState(false);
  const [savingSubTask, setSavingSubTask] = useState(false);
  const [editorValues, setEditorValues] = useState<TaskEditorValues>({
    title: '',
    description: '',
    descriptionPlain: '',
    priority: 3,
    effort: 4,
    project: null,
    dueDate: parentTask.due_date
      ? new Date(parentTask.due_date + 'T00:00:00')
      : null,
  });

  async function handleToggleSubTask(subId: string, current: boolean) {
    setSubTasks((prev) =>
      prev.map((s) => (s.id === subId ? { ...s, is_completed: !current } : s))
    );
    try {
      await updateTask(subId, { is_completed: !current });
    } catch {
      setSubTasks((prev) =>
        prev.map((s) => (s.id === subId ? { ...s, is_completed: current } : s))
      );
      toast.error('Failed to update sub-task');
    }
  }

  async function handleDeleteSubTask(subId: string) {
    const snapshot = subTasks;
    setSubTasks((prev) => prev.filter((s) => s.id !== subId));
    try {
      await deleteTask(subId);
    } catch {
      toast.error('Failed to delete sub-task');
      setSubTasks(snapshot);
    }
  }

  async function handleAddSubTask() {
    if (!editorValues.title.trim() || savingSubTask) return;
    setSavingSubTask(true);
    try {
      const created = await createTask({
        title: editorValues.title.trim(),
        parent_task_id: parentTask.id,
        priority: editorValues.priority,
        effort: editorValues.effort,
        due_date: editorValues.dueDate
          ? format(editorValues.dueDate, 'yyyy-MM-dd')
          : null,
        description: editorValues.description.trim() || null,
        description_text:
          editorValues.descriptionPlain.trim().slice(0, 500) || null,
      });
      setSubTasks((prev) => [...prev, created]);
      setAddingSubTask(false);
    } catch {
      toast.error('Failed to add sub-task');
    } finally {
      setSavingSubTask(false);
    }
  }

  return (
    <div className="mt-4">
      {subTasks.map((sub) => (
        <div key={sub.id} className="border-border group border-t py-2.5">
          <div className="flex items-start gap-2.5">
            <button
              onClick={() => handleToggleSubTask(sub.id, sub.is_completed)}
              className="text-muted-foreground/50 hover:text-primary mt-0.5 shrink-0 transition-colors"
            >
              {sub.is_completed ? (
                <CheckCircle2 className="text-primary size-4" />
              ) : (
                <Circle className="size-4" />
              )}
            </button>
            <span
              className={cn(
                'flex-1 text-sm',
                sub.is_completed && 'text-muted-foreground line-through'
              )}
            >
              {sub.title}
            </span>
            <button
              onClick={() => handleDeleteSubTask(sub.id)}
              className="text-muted-foreground/0 hover:text-destructive group-hover:text-muted-foreground/50 size-4 shrink-0 transition-colors"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
          {sub.due_date && (
            <p className="mt-0.5 ml-7 text-xs text-green-500">
              {format(new Date(sub.due_date + 'T00:00:00'), 'MMM d')}
            </p>
          )}
        </div>
      ))}

      {addingSubTask ? (
        <div className="border-border mt-1 rounded-md border">
          <div className="px-3 pt-3 pb-2">
            <TaskEditor
              projects={projects}
              initialValues={editorValues}
              onChange={setEditorValues}
              onSubmit={handleAddSubTask}
              onCancel={() => setAddingSubTask(false)}
              autoFocus
            />
          </div>
          <div className="border-border flex items-center justify-end gap-2 border-t px-3 py-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAddingSubTask(false)}
              disabled={savingSubTask}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!editorValues.title.trim() || savingSubTask}
              onClick={handleAddSubTask}
            >
              {savingSubTask ? <Spinner size="sm" className="mr-1.5" /> : null}
              Add task
            </Button>
          </div>
        </div>
      ) : (
        <Button
          onClick={() => setAddingSubTask(true)}
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground mt-1 gap-1.5"
        >
          <Plus className="size-3.5 shrink-0" />
          Add sub-task
        </Button>
      )}
    </div>
  );
}
