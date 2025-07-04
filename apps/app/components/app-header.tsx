import { Separator } from '@repo/design-system/components/ui/separator';
import { SidebarTrigger } from '@repo/design-system/components/ui/sidebar';

import { UserButtonWrapper } from '~/components/auth/user-button-wrapper';
import { NavActions } from '~/components/sidebar/nav-actions';

interface AppHeaderProps {
  isJobRoute?: boolean;
  jobTitle?: string;
}

export function AppHeader(props: AppHeaderProps) {
  const { isJobRoute, jobTitle } = props;

  return (
    <header className="sticky top-0 flex h-[57px] w-full shrink-0 items-center gap-2 border-b bg-background px-4 py-3">
      <div className="flex flex-1 items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        {isJobRoute && (
          <>
            <Separator className="mr-2 h-4" orientation="vertical" />
            <p>{jobTitle}</p>
          </>
        )}
      </div>

      {isJobRoute && (
        <div className="flex items-center">
          <NavActions />
        </div>
      )}

      <div className="flex items-center">
        <UserButtonWrapper />
      </div>
    </header>
  );
}
