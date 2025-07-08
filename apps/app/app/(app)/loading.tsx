import { Spinner } from '@repo/design-system/components/spinner';
import {
  SidebarInset,
  SidebarProvider,
} from '@repo/design-system/components/ui/sidebar';

import { AppHeader } from '~/components/app-header';
import { UserButtonWrapper } from '~/components/auth/user-button-wrapper';
import { AppSidebar } from '~/components/sidebar/app-sidebar';

export default function Loading() {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset className="h-dvh">
        <AppHeader userButton={<UserButtonWrapper />} />
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-1 items-center justify-center overflow-hidden">
            <Spinner />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
