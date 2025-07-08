import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { getSession } from '~/auth/server';

import { AppHeader } from '~/components/app-header';
import { UserButtonWrapper } from '~/components/auth/user-button-wrapper';
import { prefetch, trpc } from '~/trpc/server';

export default async function JobLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;

  prefetch(trpc.job.byId.queryOptions({ id: jobId }));

  const session = await getSession();
  const user = session?.user;

  if (!user) {
    return notFound();
  }

  return (
    <>
      <AppHeader isJobRoute={true} userButton={<UserButtonWrapper />} />
      <div className="flex-1 overflow-auto">{children}</div>
    </>
  );
}
