import { Spinner } from '@repo/design-system/components/spinner';

export function JobSkeleton() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <Spinner />
    </div>
  );
}
