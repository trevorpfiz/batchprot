'use client';

import { Separator } from '@repo/design-system/components/ui/separator';
import { SidebarTrigger } from '@repo/design-system/components/ui/sidebar';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import React from 'react';

import { useTRPC } from '~/trpc/react';

function JobTitle({ jobId }: { jobId: string }) {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.job.byId.queryOptions({ id: jobId }));
  const jobTitle = data.job?.title ?? 'Untitled Job';

  return <p>{jobTitle}</p>;
}

interface AppHeaderProps {
  isJobRoute?: boolean;
  userButton: React.ReactNode;
}

export function AppHeader(props: AppHeaderProps) {
  const { isJobRoute, userButton } = props;

  const params = useParams();
  const jobId = params.jobId as string | undefined;

  return (
    <header className="sticky top-0 flex h-[57px] w-full shrink-0 items-center gap-2 border-b bg-background px-4 py-3">
      <div className="flex flex-1 items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        {isJobRoute && jobId && (
          <>
            <Separator className="mr-2 h-4" orientation="vertical" />
            <React.Suspense fallback={null}>
              <JobTitle jobId={jobId} />
            </React.Suspense>
          </>
        )}
      </div>

      <div className="flex items-center">{userButton}</div>
    </header>
  );
}
