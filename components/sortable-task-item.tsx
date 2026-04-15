'use client';

import { useDraggable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { type Project, type Task } from '@/lib/types';
import { TaskItem } from './task-item';

/** Used inside a SortableContext (date groups). */
export function SortableTaskItem({
  task,
  project,
  containerId,
}: {
  task: Task;
  project: Project | null;
  containerId: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: task.id,
      data: { type: 'task', containerId },
    });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <TaskItem
        task={task}
        project={project}
        dragHandle={{ listeners, attributes, isDragging }}
      />
    </div>
  );
}

/** Used in OverdueGroup — draggable only, not sortable within overdue. */
export function DraggableTaskItem({
  task,
  project,
}: {
  task: Task;
  project: Project | null;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: { type: 'task', containerId: 'overdue' },
  });

  return (
    <div ref={setNodeRef} style={{ opacity: isDragging ? 0.4 : undefined }}>
      <TaskItem
        task={task}
        project={project}
        dragHandle={{ listeners, attributes, isDragging }}
      />
    </div>
  );
}
