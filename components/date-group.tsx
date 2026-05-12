'use client';

import { useRef, useState } from 'react';
import { Project } from '@/lib/project';
import { Task } from '@/lib/task';
import { formatDateHeading, TaskGroup } from '@/lib/task-grouping';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Button } from './ui/button';
import {
  INITIAL_EMPTY_TASK,
  TaskEditor,
  TaskEditorHandle,
  TaskEditorValues,
} from './molecule/task-editor';
import { formatDueDate } from '@/lib/date';
import { Spinner } from './ui/spinner';
import { createTask } from '@/app/actions/tasks';
import { TaskItem } from './task-item';
import { useProjects } from '@/contexts/projects-context';
import { useOptimisticTasks } from '@/contexts/optimistic-tasks-context';
import { useServerAction } from '@/hooks/use-server-action';

type NoDueDateGroupProps = {
  tasks: Task[];
};

export function NoDueDateGroup({ tasks }: NoDueDateGroupProps) {
  const { projects } = useProjects();
  if (tasks.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-foreground text-sm font-semibold">No Due Date</h2>
        <div className="bg-border h-px flex-1" />
      </div>
      <div className="flex flex-col">
        {tasks.map((task) => {
          const project =
            projects.find((p) => p.id === task.project_id) ?? null;
          return <TaskItem key={task.id} task={task} project={project} />;
        })}
      </div>
    </div>
  );
}

type OverdueGroupProps = {
  tasks: Task[];
};

export function OverdueGroup({ tasks }: OverdueGroupProps) {
  const { projects } = useProjects();
  if (tasks.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-destructive text-sm font-semibold">Overdue</h2>
        <div className="bg-border h-px flex-1" />
      </div>

      <div className="flex flex-col">
        {tasks.map((task) => {
          const project =
            projects.find((p) => p.id === task.project_id) ?? null;
          return <TaskItem key={task.id} task={task} project={project} />;
        })}
      </div>
    </div>
  );
}

type DateGroupProps = {
  group: TaskGroup;
  projectMap: Map<string, Project>;
};

export function DateGroup({ group, projectMap }: DateGroupProps) {
  const { label, isOverdue } = formatDateHeading(group.date);

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center gap-2">
        <h2
          className={`text-sm font-semibold ${isOverdue ? 'text-destructive' : 'text-foreground'}`}
        >
          {label}
        </h2>
        <div className="bg-border h-px flex-1" />
      </div>

      <div className={`flex flex-col rounded transition-colors`}>
        {group.tasks.map((task) => {
          const project = task.project_id
            ? projectMap.get(task.project_id)
            : null;

          return (
            <TaskItem key={task.id} task={task} project={project || null} />
          );
        })}
      </div>

      <AddTaskComponent group={group} />
    </div>
  );
}

export function TodayGroup({ group, projectMap }: DateGroupProps) {
  const { label } = formatDateHeading(group.date);

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center gap-2 rounded-2xl">
        <h2 className="text-foreground text-sm font-semibold">{label}</h2>
        <div className="bg-border h-px flex-1" />
      </div>

      <div className={`flex flex-col rounded transition-colors`}>
        {group.tasks.map((task) => {
          const project = task.project_id
            ? projectMap.get(task.project_id)
            : null;

          return (
            <TaskItem key={task.id} task={task} project={project || null} />
          );
        })}
      </div>

      <AddTaskComponent group={group} />
    </div>
  );
}

function AddTaskComponent({ group }: { group: TaskGroup }) {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [hasTitle, setHasTitle] = useState(false);
  const editorRef = useRef<TaskEditorHandle>(null);
  const initialValues: TaskEditorValues = {
    ...INITIAL_EMPTY_TASK,
    dueDate: formatDueDate(group.date),
  };
  const { adjustProjectTaskCount } = useProjects();
  const { publishAdd } = useOptimisticTasks();
  const { isPending: saving, run } = useServerAction();

  function handleCreate(values: TaskEditorValues) {
    const projectId = values.project?.id ?? null;
    const trimmedTitle = values.title.trim();
    const trimmedDescription = values.description.trim() || null;
    const description_text =
      values.descriptionPlain.trim().slice(0, 500) || null;
    const due_date = values.dueDate
      ? format(values.dueDate, 'yyyy-MM-dd')
      : null;
    const now = new Date().toISOString();
    const optimisticTask: Task = {
      id: crypto.randomUUID(),
      title: trimmedTitle,
      description: trimmedDescription,
      description_text,
      project_id: projectId,
      priority: values.priority as Task['priority'],
      effort: values.effort as Task['effort'],
      due_date,
      is_completed: false,
      completed_at: null,
      order: 0,
      is_deleted: false,
      parent_task_id: null,
      recurrence_rule: null,
      user_id: '',
      created_at: now,
      updated_at: now,
    };
    adjustProjectTaskCount(projectId, 1);
    setIsAddingTask(false);
    run(async () => {
      publishAdd(optimisticTask);
      try {
        await createTask({
          title: trimmedTitle,
          description: trimmedDescription,
          description_text,
          project_id: projectId,
          priority: values.priority,
          effort: values.effort,
          due_date,
        });
      } catch {
        adjustProjectTaskCount(projectId, -1);
        toast.error('Failed to create task');
      }
    });
  }

  return (
    <>
      {isAddingTask ? (
        <div className="border-border rounded-lg border">
          <div className="px-3 pt-3 pb-2">
            <TaskEditor
              ref={editorRef}
              initialValues={initialValues}
              onSubmit={handleCreate}
              onTitleChange={(t) => setHasTitle(!!t.trim())}
              onCancel={() => setIsAddingTask(false)}
              autoFocus
            />
          </div>

          <div className="border-border flex items-center justify-end border-t px-3 py-2">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddingTask(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!hasTitle || saving}
                onClick={() => editorRef.current?.submit()}
              >
                {saving ? <Spinner size="sm" className="mr-1.5" /> : null}
                Add task
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Button
          size="sm"
          onClick={() => setIsAddingTask(true)}
          variant="ghost"
          className="text-muted-foreground hover:text-destructive mt-2 gap-1.5"
        >
          <Plus />
          Add task
        </Button>
      )}
    </>
  );
}
