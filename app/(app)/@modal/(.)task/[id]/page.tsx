import { getTaskWithSubtasks } from '@/app/actions/tasks';
import { EditTaskModal } from '@/components/edit-task-modal';
import { notFound } from 'next/navigation';

export default async function InterceptedEditTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { task, subTasks } = await getTaskWithSubtasks(id);
  if (!task) notFound();
  return (
    <EditTaskModal id={id} initialTask={task} initialSubTasks={subTasks} />
  );
}
