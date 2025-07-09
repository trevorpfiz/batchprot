import { authCheckAuth } from '@repo/api/client';
import { createClient } from '@repo/api/client/client';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Resource } from 'sst';

import { JobContent } from '~/app/(app)/job/[jobId]/job-content';
import { JobSkeleton } from '~/app/(app)/job/[jobId]/job-skeleton';
import { getSession } from '~/auth/server';
import { env } from '~/env';

interface JobPageProps {
  params: Promise<{ jobId: string }>;
}
interface FastApiError {
  detail?: string;
}

export default async function JobPage({ params }: JobPageProps) {
  const { jobId } = await params;
  const session = await getSession();

  if (!(session?.user && session.session)) {
    notFound();
  }
  const sessionToken = session.session.token;

  let authMessage = 'Checking FastAPI authentication...';

  if (sessionToken) {
    try {
      const tokenResponse = await fetch(
        new URL('/api/auth/token', env.NEXT_PUBLIC_APP_URL),
        {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        }
      );

      if (tokenResponse.ok) {
        const { token: jwt } = (await tokenResponse.json()) as {
          token: string;
        };

        const apiClient = createClient({
          baseUrl: Resource.BatchProtAPI.url,
          headers: {
            Authorization: `Bearer ${jwt}`,
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
        const errorText = await tokenResponse.text();
        authMessage = `Error fetching JWT: ${errorText}`;
      }
    } catch (e) {
      authMessage = `An unexpected error occurred: ${(e as Error).message}`;
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
