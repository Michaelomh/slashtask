'use client';

import { useState } from 'react';
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
  TaskEditorValues,
} from './molecule/task-editor';
import { formatDueDate } from '@/lib/date';
import { Spinner } from './ui/spinner';
import { createTask } from '@/app/actions/tasks';
import { TaskItem } from './task-item';
import { useProjects } from '@/contexts/projects-context';

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
  const initialValues: TaskEditorValues = {
    ...INITIAL_EMPTY_TASK,
    dueDate: formatDueDate(group.date),
  };
  const [values, setValues] = useState<TaskEditorValues>(initialValues);
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!values.title.trim() || saving) return;
    setSaving(true);
    try {
      await createTask({
        title: values.title.trim(),
        description: values.description.trim() || null,
        description_text: values.descriptionPlain.trim().slice(0, 500) || null,
        project_id: values.project?.id ?? null,
        priority: values.priority,
        effort: values.effort,
        due_date: values.dueDate ? format(values.dueDate, 'yyyy-MM-dd') : null,
      });

      setIsAddingTask(false);
      toast.success('Task successfully created');
    } catch {
      toast.error('Failed to create task');
      setSaving(false);
    }
  }

  return (
    <>
      {isAddingTask ? (
        <div className="border-border rounded-lg border">
          <div className="px-3 pt-3 pb-2">
            <TaskEditor
              initialValues={initialValues}
              onChange={setValues}
              onSubmit={handleSubmit}
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
                disabled={!values.title.trim() || saving}
                onClick={handleSubmit}
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
