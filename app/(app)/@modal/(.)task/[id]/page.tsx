import { TaskDetailModal } from '@/components/task-detail-modal';
import { mockTasks } from '@/lib/mock-data';
import { notFound } from 'next/navigation';

export default async function InterceptedTaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const task = mockTasks.find((t) => t.id === id);
  if (!task) notFound();

  return <TaskDetailModal task={task} allTasks={mockTasks} />;
}
