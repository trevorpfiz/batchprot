import {
  SidebarInset,
  SidebarProvider,
} from '@repo/design-system/components/ui/sidebar';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import { getSession } from '~/auth/server';
import { TokenInitializer } from '~/components/auth/token-initializer';
import { SettingsDialog } from '~/components/settings/settings-dialog';
import { AppSidebar } from '~/components/sidebar/app-sidebar';
import { BearerTokenStoreProvider } from '~/providers/bearer-token-store-provider';
import { ProteinAnalysisStoreProvider } from '~/providers/protein-analysis-store-provider';
import { SettingsDialogStoreProvider } from '~/providers/settings-dialog-store-provider';
import { HydrateClient, prefetch, trpc } from '~/trpc/server';

export default async function AppLayout({ children }: { children: ReactNode }) {
  prefetch(trpc.job.byUser.queryOptions());

  const session = await getSession();
  const user = session?.user;

  if (!user) {
    return notFound();
  }

  const sessionToken = session.session.token;

  return (
    <HydrateClient>
      <BearerTokenStoreProvider>
        <TokenInitializer sessionToken={sessionToken} />
        <SidebarProvider>
          <SettingsDialogStoreProvider>
            <ProteinAnalysisStoreProvider>
              <AppSidebar />
              <SidebarInset className="h-dvh">
                {children}
                <SettingsDialog />
              </SidebarInset>
            </ProteinAnalysisStoreProvider>
          </SettingsDialogStoreProvider>
        </SidebarProvider>
      </BearerTokenStoreProvider>
    </HydrateClient>
  );
}
