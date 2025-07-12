import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { JobContent } from '~/app/(app)/job/[jobId]/job-content';
import { JobSkeleton } from '~/app/(app)/job/[jobId]/job-skeleton';
import { getSession } from '~/auth/server';

interface JobPageProps {
  params: Promise<{ jobId: string }>;
}

export default async function JobPage({ params }: JobPageProps) {
  const { jobId } = await params;
  const session = await getSession();

  if (!session?.user) {
    notFound();
  }

  return (
    <main className="h-full">
      <Suspense fallback={<JobSkeleton />}>
        <JobContent jobId={jobId} />
      </Suspense>
    </main>
  );
}
