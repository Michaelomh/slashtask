'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-full flex-col">
        <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16">
          <p className="text-sm">Something went wrong.</p>
          <button
            onClick={reset}
            className="text-sm underline underline-offset-4"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
