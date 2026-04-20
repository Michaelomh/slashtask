'use client';

import { DatePicker } from '@/components/molecule/date-picker';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RichTextEditor } from '@/components/rich-text-editor';
import { ShortcutDropdown } from '@/components/shortcut-dropdown';
import { TitleInput } from '@/components/title-input';
import { useEffortShortcut } from '@/hooks/use-effort-shortcut';
import { useProjectShortcut } from '@/hooks/use-project-shortcut';
import { usePriorityShortcut } from '@/hooks/use-priority-shortcut';
import { parseDateToken, removeTriggerToken } from '@/lib/shortcut-parser';
import { Spinner } from '@/components/ui/spinner';
import { EFFORTS, PRIORITIES } from '@/lib/enums';
import { Project, Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Flag,
  Inbox,
  Plus,
  Trash2,
  Zap,
} from 'lucide-react';
import { createTask, deleteTask, updateTask } from '@/app/actions/tasks';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { DeleteConfirmationDialog } from './molecule/delete-confirmation-dialog';

const TOOLBAR_CLS =
  'border-border text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-sm transition-colors';

type TaskDetailModalProps = {
  id: string;
  task: Task;
  projects: Project[];
  subTasks: Task[];
};

export function TaskDetailModal({
  id,
  task,
  projects,
  subTasks: initialSubTasks,
}: TaskDetailModalProps) {
  const router = useRouter();

  // Parent task fields
  const [completed, setCompleted] = useState(task.is_completed);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? '');
  const [pickerDate, setPickerDate] = useState<Date | null>(
    task.due_date ? new Date(task.due_date + 'T00:00:00') : null
  );
  const [lastSource, setLastSource] = useState<'picker' | 'shortcut'>('picker');
  const [priority, setPriority] = useState<number>(task.priority);
  const [effort, setEffort] = useState<number>(task.effort);
  const [project, setProject] = useState<Project | null>(
    projects.find((p) => p.id === task.project_id) ?? null
  );
  const [deleting, setDeleting] = useState(false);
  const [isSavingTask, setSavingTask] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Sub-tasks
  const [subTasks, setSubTasks] = useState<Task[]>(initialSubTasks);
  const [subTasksOpen, setSubTasksOpen] = useState(true);
  const [addingSubTask, setAddingSubTask] = useState(false);
  const [newSubTitle, setNewSubTitle] = useState('');
  const [newSubDescription, setNewSubDescription] = useState('');
  const [newSubDescriptionPlain, setNewSubDescriptionPlain] = useState('');
  const [newSubDueDate, setNewSubDueDate] = useState<Date | null>(null);
  const [newSubPriority, setNewSubPriority] = useState<number>(4);
  const [savingSubTask, setSavingSubTask] = useState(false);

  const newSubTitleRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const shortcut = useProjectShortcut(projects);
  const priorityShortcut = usePriorityShortcut();
  const effortShortcut = useEffortShortcut();

  // Date shortcut — derived from title, no confirm step
  const token = useMemo(() => parseDateToken(title, new Date()), [title]);
  const prevTokenText = useRef<string | null>(null);
  useEffect(() => {
    if (token?.text !== prevTokenText.current) {
      prevTokenText.current = token?.text ?? null;
      if (token) setLastSource('shortcut');
    }
  }, [token]);

  const effectiveDueDate =
    lastSource === 'shortcut' && token ? token.date : pickerDate;

  // Focus the new sub-task input when the form opens
  useEffect(() => {
    if (addingSubTask) {
      setTimeout(() => newSubTitleRef.current?.focus(), 50);
    }
  }, [addingSubTask]);

  function handleClose() {
    router.back();
  }

  async function patch(body: Parameters<typeof updateTask>[1]) {
    try {
      await updateTask(id, body);
    } catch {
      toast.error('Failed to save changes');
    }
  }

  function handleTitleChange(value: string) {
    setTitle(value);
  }

  async function handleTitleBlur() {
    setSavingTask(true);
    const cleanTitle = token
      ? removeTriggerToken(title, token.start, token.end)
      : title;
    if (cleanTitle !== title) setTitle(cleanTitle);
    const updates: Record<string, unknown> = { title: cleanTitle.trim() };
    if (lastSource === 'shortcut' && token) {
      updates.due_date = format(token.date, 'yyyy-MM-dd');
      setPickerDate(token.date);
      setLastSource('picker');
    }
    await patch(updates);
    setSavingTask(false);
  }

  const [descriptionPlain, setDescriptionPlain] = useState('');

  function handleDescriptionChange(markdown: string, plainText: string) {
    setDescription(markdown);
    setDescriptionPlain(plainText);
  }

  async function handleDescriptionBlur() {
    setSavingTask(true);
    await patch({
      description,
      description_text: descriptionPlain.slice(0, 500),
    });
    setSavingTask(false);
  }

  async function handleDueDateChange(date: Date | null) {
    setPickerDate(date);
    setLastSource('picker');
    setSavingTask(true);
    const due_date = date
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      : null;
    await patch({ due_date });
    setSavingTask(false);
  }

  async function handlePriorityChange(value: number) {
    setPriority(value);
    setSavingTask(true);
    await patch({ priority: value });
    setSavingTask(false);
  }

  async function handleEffortChange(value: number) {
    setEffort(value);
    setSavingTask(true);
    await patch({ effort: value });
    setSavingTask(false);
  }

  async function handleProjectChange(p: Project | null) {
    setProject(p);
    setSavingTask(true);
    await patch({ project_id: p?.id ?? null });
    setSavingTask(false);
  }

  async function handleToggleComplete() {
    const next = !completed;
    setCompleted(next);
    setSavingTask(true);
    await patch({ is_completed: next });
    setSavingTask(false);
  }

  function handleDeleteClick() {
    if (subTasks.length > 0) {
      setShowDeleteConfirm(true);
    } else {
      handleDelete();
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteTask(id);
      router.back();
    } catch {
      toast.error('Failed to delete task');
      setDeleting(false);
    }
  }

  // ── Sub-task actions ──────────────────────────────────────────────

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

  const selectedPriority = PRIORITIES.find((p) => p.value === priority)!;
  const selectedEffort = EFFORTS.find((e) => e.value === effort)!;
  const newSubPriorityObj = PRIORITIES.find((p) => p.value === newSubPriority)!;

  const subTaskCompleted = subTasks.filter((s) => s.is_completed).length;
  const subTaskTotal = subTasks.length;

  return (
    <>
      <Dialog
        open
        onOpenChange={(open) => {
          if (!open) handleClose();
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="gap-0 p-0 sm:max-w-lg"
        >
          {/* Body */}
          <div className="max-h-[80vh] overflow-y-auto px-4 pt-4 pb-3">
            <>
              {/* Title row */}
              <div className="flex items-start gap-3">
                <button
                  onClick={handleToggleComplete}
                  className="text-muted-foreground/50 hover:text-primary mt-0.5 shrink-0 transition-colors"
                >
                  {completed ? (
                    <CheckCircle2 className="text-primary size-5" />
                  ) : (
                    <Circle className="size-5" />
                  )}
                </button>
                <TitleInput
                  ref={titleInputRef}
                  value={title}
                  highlight={
                    token ? { start: token.start, end: token.end } : null
                  }
                  onBlur={handleTitleBlur}
                  onChange={(e) => {
                    const val = e.target.value;
                    const pos = e.target.selectionStart ?? 0;
                    handleTitleChange(val);
                    shortcut.onInputChange(val, pos);
                    priorityShortcut.onInputChange(val, pos);
                    effortShortcut.onInputChange(val, pos);
                  }}
                  onKeyDown={(e) => {
                    const projectResult = shortcut.onKeyDown(e, title);
                    if (projectResult.consumed) {
                      if (projectResult.confirm) {
                        handleTitleChange(projectResult.confirm.newTitle);
                        handleProjectChange(projectResult.confirm.project);
                      } else if (projectResult.clearedTitle !== undefined)
                        handleTitleChange(projectResult.clearedTitle);
                      return;
                    }
                    const priorityResult = priorityShortcut.onKeyDown(e, title);
                    if (priorityResult.consumed) {
                      if (priorityResult.confirm) {
                        handleTitleChange(priorityResult.confirm.newTitle);
                        handlePriorityChange(priorityResult.confirm.value);
                      } else if (priorityResult.clearedTitle !== undefined)
                        handleTitleChange(priorityResult.clearedTitle);
                      return;
                    }
                    const effortResult = effortShortcut.onKeyDown(e, title);
                    if (effortResult.consumed) {
                      if (effortResult.confirm) {
                        handleTitleChange(effortResult.confirm.newTitle);
                        handleEffortChange(effortResult.confirm.value);
                      } else if (effortResult.clearedTitle !== undefined)
                        handleTitleChange(effortResult.clearedTitle);
                      return;
                    }
                  }}
                  inputClassName={cn(
                    'placeholder:text-muted-foreground/50 w-full bg-transparent text-lg font-medium focus:outline-none',
                    completed && 'text-muted-foreground line-through'
                  )}
                />
              </div>

              {/* Description */}
              <RichTextEditor
                value={description}
                onChange={handleDescriptionChange}
                onBlur={handleDescriptionBlur}
                placeholder="Description"
                className="mt-1.5"
              />

              {/* Toolbar */}
              <div className="relative">
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {/* Project */}
                  <DropdownMenu>
                    <DropdownMenuTrigger className={TOOLBAR_CLS}>
                      {project ? (
                        <>
                          <span
                            className="font-bold"
                            style={{ color: project.color }}
                          >
                            {project.emoji}
                          </span>
                          {project.name}
                        </>
                      ) : (
                        <>
                          <Inbox className="size-3.5 shrink-0" />
                          No Project
                        </>
                      )}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem
                        onClick={() => handleProjectChange(null)}
                        className="gap-2"
                      >
                        <Inbox className="size-3.5" />
                        No Project
                      </DropdownMenuItem>
                      {projects.map((p) => (
                        <DropdownMenuItem
                          key={p.id}
                          onClick={() => handleProjectChange(p)}
                          className="gap-2"
                          style={{ color: p.color }}
                        >
                          <span className="font-bold">{p.emoji}</span>
                          {p.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DatePicker
                    value={effectiveDueDate}
                    onChange={handleDueDateChange}
                  />

                  {/* Priority */}
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className={cn(
                        TOOLBAR_CLS,
                        priority < 4 && selectedPriority.color
                      )}
                    >
                      <Flag className="size-3.5 shrink-0" />
                      {priority < 4 ? `P${priority}` : 'Priority'}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {PRIORITIES.map((p) => (
                        <DropdownMenuItem
                          key={p.value}
                          onClick={() => handlePriorityChange(p.value)}
                          className="gap-2"
                        >
                          <Flag className={cn('size-3.5', p.color)} />
                          {p.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Effort */}
                  <DropdownMenu>
                    <DropdownMenuTrigger className={TOOLBAR_CLS}>
                      <Zap className="size-3.5 shrink-0" />
                      {selectedEffort.label}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {EFFORTS.map((e) => (
                        <DropdownMenuItem
                          key={e.value}
                          onClick={() => handleEffortChange(e.value)}
                        >
                          {e.dropdownValue}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Shortcut dropdowns */}
                {shortcut.isOpen && (
                  <ShortcutDropdown
                    items={shortcut.filteredProjects.map((p) => ({
                      id: p.id,
                      label: p.name,
                      icon: p.emoji ? (
                        <span className="font-bold" style={{ color: p.color }}>
                          {p.emoji}
                        </span>
                      ) : (
                        <Inbox className="size-3.5 shrink-0" />
                      ),
                    }))}
                    highlightIndex={shortcut.highlightIndex}
                    onSelect={(i) => {
                      const result = shortcut.confirmAt(i, title);
                      if (result) {
                        handleTitleChange(result.newTitle);
                        handleProjectChange(result.project);
                      }
                      titleInputRef.current?.focus();
                    }}
                  />
                )}
                {priorityShortcut.isOpen && (
                  <ShortcutDropdown
                    items={priorityShortcut.filteredItems.map((item) => ({
                      id: item.id,
                      label: item.label,
                      icon: <Flag className={cn('size-3.5', item.color)} />,
                    }))}
                    highlightIndex={priorityShortcut.highlightIndex}
                    onSelect={(i) => {
                      const result = priorityShortcut.confirmAt(i, title);
                      if (result) {
                        handleTitleChange(result.newTitle);
                        handlePriorityChange(result.value);
                      }
                      titleInputRef.current?.focus();
                    }}
                  />
                )}
                {effortShortcut.isOpen && (
                  <ShortcutDropdown
                    items={effortShortcut.filteredItems.map((item) => ({
                      id: item.id,
                      label: item.label,
                      icon: <Zap className="size-3.5 shrink-0" />,
                    }))}
                    highlightIndex={effortShortcut.highlightIndex}
                    onSelect={(i) => {
                      const result = effortShortcut.confirmAt(i, title);
                      if (result) {
                        handleTitleChange(result.newTitle);
                        handleEffortChange(result.value);
                      }
                      titleInputRef.current?.focus();
                    }}
                  />
                )}
              </div>

              {/* ── Sub-tasks section ── */}
              <div className="mt-4">
                <div className="border-border border-t pt-4">
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
                          <div
                            key={sub.id}
                            className="border-border group border-t py-2.5"
                          >
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
                                  sub.is_completed &&
                                    'text-muted-foreground line-through'
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
                                {format(
                                  new Date(sub.due_date + 'T00:00:00'),
                                  'MMM d'
                                )}
                              </p>
                            )}
                          </div>
                        ))}

                        {/* Inline add form */}
                        {addingSubTask ? (
                          <div className="border-border mt-1 rounded-md border">
                            <div className="px-3 pt-3 pb-2">
                              <input
                                ref={newSubTitleRef}
                                value={newSubTitle}
                                onChange={(e) => setNewSubTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleAddSubTask();
                                  if (e.key === 'Escape')
                                    handleCancelAddSubTask();
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
                                      newSubPriority < 4 &&
                                        newSubPriorityObj.color
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
                                        onClick={() =>
                                          setNewSubPriority(p.value)
                                        }
                                        className="gap-2"
                                      >
                                        <Flag
                                          className={cn('size-3.5', p.color)}
                                        />
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
                        ) : (
                          <button
                            onClick={() => setAddingSubTask(true)}
                            className="text-muted-foreground hover:text-primary mt-2 flex items-center gap-1.5 text-sm transition-colors"
                          >
                            <Plus className="size-3.5 shrink-0" />
                            Add sub-task
                          </button>
                        )}
                      </>
                    )}
                  </>
                </div>
              </div>
            </>
          </div>

          {/* Footer */}
          <div className="border-border flex items-center justify-between border-t px-4 py-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteClick}
              disabled={deleting}
              className="text-muted-foreground hover:text-destructive gap-1.5"
            >
              {deleting ? (
                <Spinner size="sm" />
              ) : (
                <Trash2 className="size-3.5" />
              )}
              Delete task
            </Button>
            {isSavingTask && (
              <div className="flex items-center gap-2">
                <p className="text-sidebar-foreground/50 text-sm">Saving</p>
                <Spinner className="text-sidebar-foreground/50 size-3" />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        showDeleteConfirmationDialog={showDeleteConfirm}
        setShowDeleteConfirmationDialog={setShowDeleteConfirm}
        title="Are you sure?"
        description={`This will also delete ${subTasks.length} sub-task
              ${subTasks.length !== 1 ? 's' : ''}.`}
        isDeleting={deleting}
        handleDelete={handleDelete}
      />
    </>
  );
}
