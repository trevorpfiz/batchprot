'use client';

import { Badge } from '@repo/design-system/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import { Separator } from '@repo/design-system/components/ui/separator';
import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
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
  } = useQuery(trpc.proteinAnalysis.byJobId.queryOptions({ jobId }));

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
          <div className="space-y-6">
            {analysisData.analyses.map((analysis, index) => (
              <div className="space-y-4" key={analysis.id}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">
                    Protein #{index + 1}
                  </h3>
                  <Badge variant="secondary">
                    Length: {analysis.length} AA
                  </Badge>
                </div>

                {/* Sequence Display */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Sequence:</h4>
                  <div className="rounded bg-muted p-3">
                    <code className="break-all font-mono text-sm">
                      {analysis.sequence.length > 200
                        ? `${analysis.sequence.substring(0, 200)}...`
                        : analysis.sequence}
                    </code>
                  </div>
                </div>

                {/* Analysis Results Grid */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-1">
                    <p className="font-medium text-sm">Molecular Weight</p>
                    <p className="font-bold text-2xl">
                      {Number(analysis.molecularWeight).toFixed(2)}
                    </p>
                    <p className="text-muted-foreground text-xs">Da</p>
                  </div>

                  <div className="space-y-1">
                    <p className="font-medium text-sm">Isoelectric Point</p>
                    <p className="font-bold text-2xl">
                      {Number(analysis.isoelectricPoint).toFixed(2)}
                    </p>
                    <p className="text-muted-foreground text-xs">pI</p>
                  </div>

                  <div className="space-y-1">
                    <p className="font-medium text-sm">Instability Index</p>
                    <p className="font-bold text-2xl">
                      {Number(analysis.instabilityIndex).toFixed(2)}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {Number(analysis.instabilityIndex) > 40
                        ? 'Unstable'
                        : 'Stable'}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="font-medium text-sm">Aromaticity</p>
                    <p className="font-bold text-2xl">
                      {Number(analysis.aromaticity).toFixed(3)}
                    </p>
                    <p className="text-muted-foreground text-xs">Fraction</p>
                  </div>

                  <div className="space-y-1">
                    <p className="font-medium text-sm">GRAVY</p>
                    <p className="font-bold text-2xl">
                      {Number(analysis.gravy).toFixed(2)}
                    </p>
                    <p className="text-muted-foreground text-xs">Hydropathy</p>
                  </div>

                  <div className="space-y-1">
                    <p className="font-medium text-sm">Charge at pH 7</p>
                    <p className="font-bold text-2xl">
                      {Number(analysis.chargeAtPh7).toFixed(2)}
                    </p>
                    <p className="text-muted-foreground text-xs">Net charge</p>
                  </div>
                </div>

                {/* Secondary Structure */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">
                    Secondary Structure Fractions
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="rounded bg-blue-50 p-3">
                      <p className="font-medium text-blue-800">Helix</p>
                      <p className="font-bold text-blue-900 text-xl">
                        {(Number(analysis.helixFraction) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="rounded bg-green-50 p-3">
                      <p className="font-medium text-green-800">Turn</p>
                      <p className="font-bold text-green-900 text-xl">
                        {(Number(analysis.turnFraction) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="rounded bg-purple-50 p-3">
                      <p className="font-medium text-purple-800">Sheet</p>
                      <p className="font-bold text-purple-900 text-xl">
                        {(Number(analysis.sheetFraction) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Extinction Coefficients */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">
                    Extinction Coefficients
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded bg-gray-50 p-3">
                      <p className="font-medium text-gray-800">Reduced</p>
                      <p className="font-bold text-gray-900 text-xl">
                        {analysis.extinctionCoeffReduced.toLocaleString()}
                      </p>
                      <p className="text-gray-600 text-xs">M⁻¹cm⁻¹</p>
                    </div>
                    <div className="rounded bg-gray-50 p-3">
                      <p className="font-medium text-gray-800">Oxidized</p>
                      <p className="font-bold text-gray-900 text-xl">
                        {analysis.extinctionCoeffOxidized.toLocaleString()}
                      </p>
                      <p className="text-gray-600 text-xs">M⁻¹cm⁻¹</p>
                    </div>
                  </div>
                </div>

                {index < analysisData.analyses.length - 1 && (
                  <Separator className="my-6" />
                )}
              </div>
            ))}
          </div>
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
