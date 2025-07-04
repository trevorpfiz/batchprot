import {
  SidebarInset,
  SidebarProvider,
} from '@repo/design-system/components/ui/sidebar';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import { getSession } from '~/auth/server';
import { SettingsDialog } from '~/components/settings/settings-dialog';
import { AppSidebar } from '~/components/sidebar/app-sidebar';
import { SettingsDialogStoreProvider } from '~/providers/settings-dialog-store-provider';
import { HydrateClient, prefetch, trpc } from '~/trpc/server';

export default async function AppLayout({ children }: { children: ReactNode }) {
  prefetch(trpc.job.all.queryOptions());

  const session = await getSession();
  const user = session?.user;

  if (!user) {
    return notFound();
  }

  return (
    <HydrateClient>
      <SidebarProvider>
        <SettingsDialogStoreProvider>
          <AppSidebar />
          <SidebarInset className="h-dvh">
            {children}
            <SettingsDialog userEmail={user?.email ?? ''} userId={user.id} />
          </SidebarInset>
        </SettingsDialogStoreProvider>
      </SidebarProvider>
    </HydrateClient>
  );
}
