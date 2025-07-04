import 'server-only';

import { and, desc, eq } from 'drizzle-orm';

import { db } from '../client';
import {
  Job,
  type JobId,
  type NewJobParams,
  type UpdateJobParams,
  type UserId,
} from '../schema';

// read
export async function getJobsByUserId({ id }: { id: UserId }) {
  const jobs = await db.query.Job.findMany({
    where: eq(Job.userId, id),
    orderBy: desc(Job.createdAt),
  });

  return { jobs };
}

export async function getJobById({
  jobId,
  userId,
}: {
  jobId: JobId;
  userId: UserId;
}) {
  const job = await db.query.Job.findFirst({
    where: and(eq(Job.id, jobId), eq(Job.userId, userId)),
  });

  return { job };
}

// create
export async function createJob({
  newJob,
  userId,
}: {
  newJob: NewJobParams;
  userId: UserId;
}) {
  const { title } = newJob;
  const [job] = await db
    .insert(Job)
    .values({
      title,
      userId,
    })
    .returning();

  return { job };
}

// update
export async function updateJobById({
  jobId,
  updates,
  userId,
}: {
  jobId: JobId;
  updates: UpdateJobParams;
  userId: UserId;
}) {
  const { title } = updates;
  const [job] = await db
    .update(Job)
    .set({ title })
    .where(and(eq(Job.id, jobId), eq(Job.userId, userId)))
    .returning();

  return { job };
}

// delete
export async function deleteJobById({
  jobId,
  userId,
}: {
  jobId: JobId;
  userId: UserId;
}) {
  const [job] = await db
    .delete(Job)
    .where(and(eq(Job.id, jobId), eq(Job.userId, userId)))
    .returning();

  return { job };
}
