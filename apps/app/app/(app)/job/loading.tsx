import { Spinner } from '@repo/design-system/components/spinner';

import { AppHeader } from '~/components/app-header';
import { UserButtonWrapper } from '~/components/auth/user-button-wrapper';

export default function Loading() {
  return (
    <>
      <AppHeader isJobRoute={true} userButton={<UserButtonWrapper />} />
      <div className="flex flex-1 items-center justify-center">
        <Spinner />
      </div>
    </>
  );
}
