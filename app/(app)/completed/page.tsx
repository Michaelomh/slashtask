import { TaskItem } from '@/components/task-item';
import { mockProjects, mockTasks } from '@/lib/mock-data';

export default function CompletedPage() {
  const completedTasks = mockTasks
    .filter((t) => t.is_completed && t.completed_at !== null)
    .sort(
      (a, b) =>
        new Date(b.completed_at!).getTime() -
        new Date(a.completed_at!).getTime()
    );

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-xl font-semibold">Completed</h1>

      {completedTasks.length === 0 ? (
        <p className="text-sm text-muted-foreground">No completed tasks yet.</p>
      ) : (
        <div className="flex flex-col">
          {completedTasks.map((task) => {
            const project =
              mockProjects.find((p) => p.id === task.project_id) ?? null;
            return (
              <TaskItem key={task.id} task={task} project={project} />
            );
          })}
        </div>
      )}
    </div>
  );
}
