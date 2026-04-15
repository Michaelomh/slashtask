import { TaskDetailModal } from '@/components/task-detail-modal';

export default async function InterceptedTaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TaskDetailModal id={id} />;
}
