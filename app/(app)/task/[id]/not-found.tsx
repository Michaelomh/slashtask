import Link from 'next/link';

export default function TaskNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16">
      <p className="text-muted-foreground text-sm">Task not found.</p>
      <Link href="/" className="text-sm underline underline-offset-4">
        Go home
      </Link>
    </div>
  );
}
