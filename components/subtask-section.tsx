'use client';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
  INITIAL_EMPTY_TASK,
  TaskEditor,
  TaskEditorValues,
} from '@/components/molecule/task-editor';
import { truncateDescriptionText, Task } from '@/lib/task';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import { createTask } from '@/app/actions/tasks';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { SubTaskItem } from './subtask-item';
import { useProjects } from '@/contexts/projects-context';
import { useServerAction } from '@/hooks/use-server-action';

type SubTaskSectionProps = {
  subTasks: Task[];
  parentTask: Task;
};

export function SubTaskSection({
  parentTask,
  subTasks: initialSubTasks,
}: SubTaskSectionProps) {
  const { projects, adjustProjectTaskCount } = useProjects();
  const [subTasks, setSubTasks] = useState<Task[]>(initialSubTasks);
  const { isPending, run } = useServerAction();

  useEffect(() => {
    setSubTasks(initialSubTasks);
  }, [initialSubTasks]);
  const [addingSubTask, setAddingSubTask] = useState(false);
  const [editorValues, setEditorValues] = useState<TaskEditorValues>({
    ...INITIAL_EMPTY_TASK,
    dueDate: parentTask.due_date
      ? new Date(parentTask.due_date + 'T00:00:00')
      : null,
    project: projects.find((p) => p.id === parentTask.project_id) ?? null,
  });

  function handleAddSubTask() {
    if (!editorValues.title.trim()) return;
    const projectId = editorValues.project?.id ?? null;
    adjustProjectTaskCount(projectId, 1);
    run(async () => {
      try {
        const created = await createTask({
          title: editorValues.title.trim(),
          parent_task_id: parentTask.id,
          priority: editorValues.priority,
          effort: editorValues.effort,
          due_date: editorValues.dueDate
            ? format(editorValues.dueDate, 'yyyy-MM-dd')
            : null,
          project_id: projectId,
          description: editorValues.description.trim() || null,
          description_text: truncateDescriptionText(
            editorValues.descriptionPlain
          ),
        });
        setSubTasks((prev) => [...prev, created]);
        setAddingSubTask(false);
        toast.success('Sub-task created');
      } catch {
        adjustProjectTaskCount(projectId, -1);
        toast.error('Failed to add sub-task');
      }
    });
  }

  return (
    <div className="mt-4">
      {subTasks.length > 0 && <span className="font-bold">Sub-tasks</span>}
      {subTasks.map((subTask) => (
        <SubTaskItem
          key={subTask.id}
          task={subTask}
          project={projects.find((p) => p.id === subTask.project_id) ?? null}
        />
      ))}

      {addingSubTask ? (
        <div className="border-border mt-1 rounded-md border">
          <div className="px-3 pt-3 pb-2">
            <TaskEditor
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
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!editorValues.title.trim() || isPending}
              onClick={handleAddSubTask}
            >
              {isPending ? <Spinner size="sm" className="mr-1.5" /> : null}
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
