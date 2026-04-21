'use client';

import { DatePicker } from '@/components/molecule/date-picker';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RichTextEditor } from '@/components/rich-text-editor';
import { Spinner } from '@/components/ui/spinner';
import { PRIORITIES } from '@/lib/enums';
import { Project, Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Flag,
  Plus,
  Trash2,
} from 'lucide-react';
import { createTask, deleteTask, updateTask } from '@/app/actions/tasks';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

type SubTaskSectionProps = {
  projects: Project[];
  subTasks: Task[];
};

export function SubTaskSection({
  projects,
  subTasks: initialSubTasks,
}: SubTaskSectionProps) {
  const [subTasks, setSubTasks] = useState<Task[]>(initialSubTasks);
  const [hasSubTask, setHasSubTask] = useState(subTasks.length > 0);
  const [subTasksOpen, setSubTasksOpen] = useState(true);
  const [addingSubTask, setAddingSubTask] = useState(false);
  const [newSubTitle, setNewSubTitle] = useState('');
  const [newSubDescription, setNewSubDescription] = useState('');
  const [newSubDescriptionPlain, setNewSubDescriptionPlain] = useState('');
  const [newSubDueDate, setNewSubDueDate] = useState<Date | null>(null);
  const [newSubPriority, setNewSubPriority] = useState<number>(4);
  const [savingSubTask, setSavingSubTask] = useState(false);
  const newSubTitleRef = useRef<HTMLInputElement>(null);

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
    if (!newSubTitle.trim() || savingSubTask) return;
    setSavingSubTask(true);
    try {
      const created = await createTask({
        title: newSubTitle.trim(),
        parent_task_id: id,
        priority: newSubPriority,
        due_date: newSubDueDate ? format(newSubDueDate, 'yyyy-MM-dd') : null,
        description: newSubDescription.trim() || null,
        description_text: newSubDescriptionPlain.trim().slice(0, 500) || null,
      });
      setSubTasks((prev) => [...prev, created]);
      setNewSubTitle('');
      setNewSubDescription('');
      setNewSubDescriptionPlain('');
      setNewSubDueDate(null);
      setNewSubPriority(4);
      setAddingSubTask(false);
    } catch {
      toast.error('Failed to add sub-task');
    } finally {
      setSavingSubTask(false);
    }
  }

  function handleCancelAddSubTask() {
    setAddingSubTask(false);
    setNewSubTitle('');
    setNewSubDescription('');
    setNewSubDescriptionPlain('');
    setNewSubDueDate(null);
    setNewSubPriority(4);
  }

  const newSubPriorityObj = PRIORITIES.find((p) => p.value === newSubPriority)!;

  const subTaskCompleted = subTasks.filter((s) => s.is_completed).length;
  const subTaskTotal = subTasks.length;

  return (
    <>
      {/* ── Sub-tasks section ── */}
      <div className="mt-4">
        <Button
          onClick={() => setAddingSubTask(true)}
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-destructive gap-1.5"
        >
          <Plus className="size-3.5 shrink-0" />
          Add sub-task
        </Button>

        <>
          {/* Section header */}
          <button
            onClick={() => setSubTasksOpen((v) => !v)}
            className="text-foreground mb-3 flex items-center gap-1.5 text-sm font-semibold"
          >
            {subTasksOpen ? (
              <ChevronDown className="size-4 shrink-0" />
            ) : (
              <ChevronRight className="size-4 shrink-0" />
            )}
            Sub-tasks
            <span className="text-muted-foreground font-normal">
              {subTaskCompleted}/{subTaskTotal}
            </span>
          </button>

          {subTasksOpen && (
            <>
              {subTasks.map((sub) => (
                <div key={sub.id} className="py-2.5">
                  <div className="flex items-start gap-2.5">
                    <button
                      onClick={() =>
                        handleToggleSubTask(sub.id, sub.is_completed)
                      }
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

              {/* Inline add form */}
              {addingSubTask && (
                <div className="border-border mt-1 rounded-md border">
                  <div className="px-3 pt-3 pb-2">
                    <input
                      ref={newSubTitleRef}
                      value={newSubTitle}
                      onChange={(e) => setNewSubTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddSubTask();
                        if (e.key === 'Escape') handleCancelAddSubTask();
                      }}
                      placeholder="Task name"
                      className="placeholder:text-muted-foreground/50 w-full bg-transparent text-sm font-medium focus:outline-none"
                    />
                    <RichTextEditor
                      value={newSubDescription}
                      onChange={(md, plain) => {
                        setNewSubDescription(md);
                        setNewSubDescriptionPlain(plain);
                      }}
                      placeholder="Description"
                      className="mt-1"
                    />
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <DatePicker
                        value={newSubDueDate}
                        onChange={setNewSubDueDate}
                        className="text-xs"
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className={cn(
                            'border-border text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs transition-colors',
                            newSubPriority < 4 && newSubPriorityObj.color
                          )}
                        >
                          <Flag className="size-3 shrink-0" />
                          {newSubPriority < 4
                            ? `P${newSubPriority}`
                            : 'Priority'}
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          {PRIORITIES.map((p) => (
                            <DropdownMenuItem
                              key={p.value}
                              onClick={() => setNewSubPriority(p.value)}
                              className="gap-2"
                            >
                              <Flag className={cn('size-3.5', p.color)} />
                              {p.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <div className="border-border flex items-center justify-end gap-2 border-t px-3 py-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelAddSubTask}
                      disabled={savingSubTask}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      disabled={!newSubTitle.trim() || savingSubTask}
                      onClick={handleAddSubTask}
                    >
                      {savingSubTask ? (
                        <Spinner size="sm" className="mr-1.5" />
                      ) : null}
                      Add task
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      </div>
    </>
  );
}
