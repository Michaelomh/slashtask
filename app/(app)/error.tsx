'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16">
      <p className="text-sm text-muted-foreground">
        {error.message || 'Something went wrong.'}
      </p>
      <button
        onClick={reset}
        className="text-sm text-primary underline-offset-4 hover:underline"
      >
        Try again
      </button>
    </div>
  );
}
