import { auth, currentUser } from '@repo/auth/server';
import { SidebarProvider } from '@repo/design-system/components/ui/sidebar';
import type { ReactNode } from 'react';
import { GlobalSidebar } from './components/sidebar';

type AppLayoutProperties = {
  readonly children: ReactNode;
};

const AppLayout = async ({ children }: AppLayoutProperties) => {
  const user = await currentUser();
  const { redirectToSignIn } = await auth();

  if (!user) {
    return redirectToSignIn();
  }

  return (
    <SidebarProvider>
      <GlobalSidebar>{children}</GlobalSidebar>
    </SidebarProvider>
  );
};

export default AppLayout;
