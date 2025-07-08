import { authCheckAuth } from '@repo/api/client';
import { createClient } from '@repo/api/client/client';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Resource } from 'sst';
import { JobContent } from '~/app/(app)/job/[jobId]/job-content';
import { JobSkeleton } from '~/app/(app)/job/[jobId]/job-skeleton';
import { getSession } from '~/auth/server';

interface JobPageProps {
  params: Promise<{ jobId: string }>;
}
interface FastApiError {
  detail?: string;
}

export default async function JobPage({ params }: JobPageProps) {
  const { jobId } = await params;
  const session = await getSession();

  if (!session?.user) {
    notFound();
  }
  const token = session.session?.token;

  let authMessage = 'Checking FastAPI authentication...';

  if (token) {
    const apiClient = createClient({
      baseUrl: Resource.BatchProtAPI.url,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const { data, error } = await authCheckAuth({
      client: apiClient,
    });

    if (error) {
      authMessage = `Error: ${
        (error as FastApiError).detail ??
        'Failed to authenticate with FastAPI service'
      }`;
    } else if (data) {
      authMessage = `FastAPI says: ${data.message} for user ${data.user_id}`;
    } else {
      authMessage = 'No data returned from FastAPI service';
    }
  } else {
    authMessage = 'Could not find auth token in session.';
  }

  return (
    <main className="h-full">
      <Suspense fallback={<JobSkeleton />}>
        <JobContent authMessage={authMessage} jobId={jobId} />
      </Suspense>
    </main>
  );
}
