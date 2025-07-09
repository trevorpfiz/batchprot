'use client';

import type { AuthCheckResponse } from '@repo/api/client';
import { createClient } from '@repo/api/client/client';
import { authCheckAuthOptions } from '@repo/api/client/react-query';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useBearerTokenStore } from '~/providers/bearer-token-store-provider';

import { useTRPC } from '~/trpc/react';

interface JobContentProps {
  jobId: string;
  apiUrl: string;
}

function AuthenticatedContent({
  apiClient,
}: {
  apiClient: ReturnType<typeof createClient>;
}) {
  const {
    data: authData,
    error: authError,
    isLoading: isAuthLoading,
  } = useQuery({
    ...authCheckAuthOptions({
      client: apiClient,
    }),
  });

  if (isAuthLoading) {
    return <p>Authenticating with analysis service...</p>;
  }

  if (authError) {
    return <p className="text-red-500">Error: {authError.message}</p>;
  }

  const typedAuthData = authData as AuthCheckResponse;

  return (
    <div className="mb-6 rounded-lg border bg-green-50 p-4">
      <h2 className="mb-2 font-semibold text-green-800">
        Authentication Status
      </h2>
      <p className="text-green-700">
        FastAPI says: {typedAuthData?.message} for user {typedAuthData?.user_id}
      </p>
    </div>
  );
}

// Separate component for the authenticated content
function FastApiContent({ apiUrl }: { apiUrl: string }) {
  const { bearerToken, isLoading } = useBearerTokenStore(
    useShallow((state) => ({
      bearerToken: state.bearerToken,
      isLoading: state.isLoading,
    }))
  );

  const apiClient = useMemo(() => {
    if (!bearerToken) {
      return null;
    }
    return createClient({
      baseUrl: apiUrl,
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    });
  }, [apiUrl, bearerToken]);

  if (isLoading) {
    return <p>Preparing analysis service...</p>;
  }

  if (!apiClient) {
    return (
      <p className="text-red-500">
        Could not authenticate with analysis service. Please try refreshing the
        page.
      </p>
    );
  }

  return <AuthenticatedContent apiClient={apiClient} />;
}

export function JobContent({ jobId, apiUrl }: JobContentProps) {
  const trpc = useTRPC();
  const { data: jobData } = useSuspenseQuery(
    trpc.job.byId.queryOptions({ id: jobId })
  );

  if (!jobData?.job) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p>Job not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-4 font-bold text-2xl">{jobData.job.title}</h1>

      {/* FastAPI Authentication Status */}
      <FastApiContent apiUrl={apiUrl} />

      <div className="space-y-4">
        <div>
          <span className="font-semibold">Status:</span> {jobData.job.status}
        </div>
        <div>
          <span className="font-semibold">Algorithm:</span>{' '}
          {jobData.job.algorithm || 'Not specified'}
        </div>
        <div>
          <span className="font-semibold">Created:</span>{' '}
          {new Date(jobData.job.createdAt).toLocaleDateString()}
        </div>
        {jobData.job.updatedAt && (
          <div>
            <span className="font-semibold">Updated:</span>{' '}
            {new Date(jobData.job.updatedAt).toLocaleDateString()}
          </div>
        )}
        {jobData.job.proteinAnalyses &&
          jobData.job.proteinAnalyses.length > 0 && (
            <div>
              <h2 className="mb-2 font-semibold text-lg">
                Protein Analyses ({jobData.job.proteinAnalyses.length})
              </h2>
              <div className="space-y-2">
                {jobData.job.proteinAnalyses.map((analysis) => (
                  <div className="rounded border p-3" key={analysis.id}>
                    <div className="font-medium">
                      Sequence (Length: {analysis.length})
                    </div>
                    <div className="truncate font-mono text-gray-600 text-sm">
                      {analysis.sequence.substring(0, 100)}
                      {analysis.sequence.length > 100 && '...'}
                    </div>
                    <div className="mt-1 text-gray-500 text-sm">
                      Molecular Weight: {analysis.molecularWeight} Da
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
