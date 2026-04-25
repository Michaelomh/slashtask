import { Spinner } from '../ui/spinner';

export default function GlobalSpinner() {
  return (
    <div className="bg-card border-border pointer-events-none fixed top-6 right-6 z-50 flex size-10 items-center justify-center rounded-full border p-2">
      <Spinner size="default" className="text-primary" />
    </div>
  );
}
