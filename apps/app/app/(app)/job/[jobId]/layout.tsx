import { getJobById } from '@repo/database/queries';
import { notFound } from 'next/navigation';
import { cache, type ReactNode } from 'react';
import { getSession } from '~/auth/server';

import { AppHeader } from '~/components/app-header';

export default async function JobLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;

  const session = await getSession();
  const user = session?.user;

  if (!user) {
    return notFound();
  }

  const jobData = cache(getJobById)({ jobId, userId: user.id });

  const [job] = await Promise.all([jobData]);

  if (!job.job) {
    return notFound();
  }

  return (
    <>
      <AppHeader isJobRoute={true} jobTitle={job.job.title} />
      <div className="flex-1 overflow-auto">{children}</div>
    </>
  );
}
