import { Suspense } from 'react';
import { getSession } from '~/auth/server';
import { UserButton } from './user-button';

export async function UserButtonWrapper() {
  const session = await getSession();
  const user = session?.user;

  if (!user) {
    return null;
  }

  return (
    <Suspense
      fallback={
        <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
      }
    >
      <UserButton user={user} />
    </Suspense>
  );
}
