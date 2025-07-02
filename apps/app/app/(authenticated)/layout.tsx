import { SidebarProvider } from '@repo/design-system/components/ui/sidebar';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { getSession } from '~/auth/server';
import { GlobalSidebar } from './components/sidebar';

type AppLayoutProperties = {
  readonly children: ReactNode;
};

const AppLayout = async ({ children }: AppLayoutProperties) => {
  const session = await getSession();
  if (!session?.user) {
    return redirect('/sign-in');
  }

  return (
    <SidebarProvider>
      <GlobalSidebar>{children}</GlobalSidebar>
    </SidebarProvider>
  );
};

export default AppLayout;
