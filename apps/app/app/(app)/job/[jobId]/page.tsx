import { Spinner } from '@repo/design-system/components/spinner';
import { Suspense } from 'react';

export default function JobPage() {
  return (
    <main className="h-full">
      <Suspense fallback={<JobSkeleton />}>
        <div>Job</div>
      </Suspense>
    </main>
  );
}

function JobSkeleton() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <Spinner />
    </div>
  );
}
