import { Spinner } from '@/components/ui/spinner';

export default function Loading() {
  return (
    <div className="mx-auto max-w-200 px-4 py-8">
      <h1 className="mb-6 text-xl font-semibold">Completed</h1>
      <Spinner />
    </div>
  );
}
