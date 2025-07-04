import { Spinner } from '@repo/design-system/components/spinner';
import {
  SidebarInset,
  SidebarProvider,
} from '@repo/design-system/components/ui/sidebar';

import { AppHeader } from '~/components/app-header';
import { AppSidebar } from '~/components/sidebar/app-sidebar';

export default function Loading() {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset className="h-dvh">
        <AppHeader />
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-1 items-center justify-center overflow-hidden">
            <Spinner />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
