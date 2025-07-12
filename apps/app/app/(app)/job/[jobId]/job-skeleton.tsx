import { Spinner } from '@repo/design-system/components/spinner';

export function JobSkeleton() {
  return (
    <div className="flex h-full items-center justify-center">
      <Spinner />
    </div>
  );
}
