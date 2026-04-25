'use client';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
  INITIAL_EMPTY_TASK,
  TaskEditor,
  TaskEditorValues,
} from '@/components/molecule/task-editor';
import { Project, Task } from '@/lib/types';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import { createTask } from '@/app/actions/tasks';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { SubTaskItem } from './subtask-item';

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

  useEffect(() => {
    setSubTasks(initialSubTasks);
  }, [initialSubTasks]);
  const [addingSubTask, setAddingSubTask] = useState(false);
  const [savingSubTask, setSavingSubTask] = useState(false);
  const [editorValues, setEditorValues] = useState<TaskEditorValues>({
    ...INITIAL_EMPTY_TASK,
    dueDate: parentTask.due_date
      ? new Date(parentTask.due_date + 'T00:00:00')
      : null,
    project: projects.find((p) => p.id === parentTask.project_id) ?? null,
  });

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
        project_id: editorValues.project?.id ?? null,
        description: editorValues.description.trim() || null,
        description_text:
          editorValues.descriptionPlain.trim().slice(0, 500) || null,
      });
      setSubTasks((prev) => [...prev, created]);
      setAddingSubTask(false);
      toast.success('Sub-task created');
    } catch {
      toast.error('Failed to add sub-task');
    } finally {
      setSavingSubTask(false);
    }
  }

  return (
    <div className="mt-4">
      {subTasks.length > 0 && <span className="font-bold">Sub-tasks</span>}
      {subTasks.map((subTask) => (
        <SubTaskItem
          key={subTask.id}
          task={subTask}
          project={projects.find((p) => p.id === subTask.project_id) ?? null}
          projects={projects}
        />
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
