'use client';

import type { ProteinAnalysis } from '@repo/database/src/protein-schema';
import { Badge } from '@repo/design-system/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { ProteinTable } from '~/components/protein-table';
import { useBearerTokenStore } from '~/providers/bearer-token-store-provider';
import { useProteinAnalysisStore } from '~/providers/protein-analysis-store-provider';
import { useTRPC } from '~/trpc/react';

interface JobContentProps {
  jobId: string;
}

// Component to display protein analysis results
function ProteinAnalysisResults({ jobId }: { jobId: string }) {
  const trpc = useTRPC();
  const {
    data: analysisData,
    isLoading,
    error,
    refetch,
  } = useQuery(trpc.proteinAnalysis.byJobId.queryOptions({ jobId }));

  // Define mutations at the top level
  const deleteMutation = useMutation(
    trpc.proteinAnalysis.delete.mutationOptions({
      onSuccess: () => {
        refetch();
      },
    })
  );

  const deleteManyMutation = useMutation(
    trpc.proteinAnalysis.deleteMany.mutationOptions({
      onSuccess: () => {
        refetch();
      },
    })
  );

  const handleDeleteProteins = (proteins: ProteinAnalysis[]) => {
    // Extract IDs from the proteins to delete
    const proteinIds = proteins.map((p) => p.id);

    // Use deleteMany if multiple proteins, delete if single protein
    if (proteinIds.length > 1) {
      deleteManyMutation.mutate({ ids: proteinIds });
    } else {
      deleteMutation.mutate({ id: proteinIds[0] });
    }
  };

  if (isLoading) {
    return <p>Loading protein analysis results...</p>;
  }

  if (error) {
    return (
      <p className="text-red-500">
        Error loading analysis results: {error.message}
      </p>
    );
  }

  if (!analysisData?.analyses || analysisData.analyses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Protein Analysis Results</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No analysis results found for this job.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>
            Protein Analysis Results ({analysisData.analyses.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProteinTable
            data={analysisData.analyses}
            onDeleteProteins={handleDeleteProteins}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export function JobContent({ jobId }: JobContentProps) {
  const trpc = useTRPC();
  const { data: jobData, refetch: refetchJob } = useSuspenseQuery(
    trpc.job.byId.queryOptions({ id: jobId })
  );

  const { data: analysisData, refetch: refetchAnalysis } = useQuery(
    trpc.proteinAnalysis.byJobId.queryOptions({ jobId })
  );

  // Use protein analysis store
  const { getSequences, clearSequences } = useProteinAnalysisStore(
    useShallow((state) => ({
      getSequences: state.getSequences,
      clearSequences: state.clearSequences,
    }))
  );

  // Get bearer token from store
  const bearerToken = useBearerTokenStore((state) => state.bearerToken);

  const triggerAnalysisMutation = useMutation(
    trpc.proteinAnalysis.triggerAnalysis.mutationOptions({
      onSuccess: () => {
        // Refetch both job and analysis data after successful analysis
        refetchJob();
        refetchAnalysis();
      },
    })
  );

  // Trigger analysis if job is queued and has no results yet
  useEffect(() => {
    // Skip if we don't have the required data or if already running
    if (!jobData?.job || triggerAnalysisMutation.isPending) {
      return;
    }

    const job = jobData.job;
    const hasResults =
      analysisData?.analyses && analysisData.analyses.length > 0;

    // Only trigger for queued jobs without results
    if (job.status === 'queued' && !hasResults) {
      const sequences = getSequences(jobId);

      if (sequences.length > 0) {
        triggerAnalysisMutation.mutate({
          jobId,
          sequences,
          bearerToken: bearerToken || undefined,
        });

        clearSequences(jobId);
      }
    }
  }, [
    jobData,
    analysisData,
    triggerAnalysisMutation,
    jobId,
    bearerToken,
    getSequences,
    clearSequences,
  ]);

  if (!jobData?.job) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p>Job not found</p>
      </div>
    );
  }

  const statusColors = {
    queued: 'bg-yellow-100 text-yellow-800',
    running: 'bg-blue-100 text-blue-800',
    succeeded: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-2xl">{jobData.job.title}</h1>
        <Badge className={statusColors[jobData.job.status]}>
          {jobData.job.status.toUpperCase()}
        </Badge>
      </div>

      {/* Job Details */}
      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <span className="font-semibold">Algorithm:</span>{' '}
              {jobData.job.algorithm || 'Not specified'}
            </div>
            <div>
              <span className="font-semibold">Created:</span>{' '}
              {new Date(jobData.job.createdAt).toLocaleDateString()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Protein Analysis Results */}
      {jobData.job.status === 'succeeded' && (
        <ProteinAnalysisResults jobId={jobId} />
      )}

      {jobData.job.status === 'failed' && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">
              The protein analysis job failed to complete. Please try creating a
              new job.
            </p>
            {triggerAnalysisMutation.error && (
              <p className="mt-2 text-red-500 text-sm">
                Error: {triggerAnalysisMutation.error.message}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {(jobData.job.status === 'queued' ||
        jobData.job.status === 'running') && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis in Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-600">
              Your protein analysis is {jobData.job.status}. Results will appear
              here when complete.
            </p>
            {triggerAnalysisMutation.isPending && (
              <p className="mt-2 text-blue-500 text-sm">
                Starting analysis with FastAPI...
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
