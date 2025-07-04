import { Spinner } from '@repo/design-system/components/spinner';

import { AppHeader } from '~/components/app-header';

export default function Loading() {
  return (
    <>
      <AppHeader isJobRoute={true} jobTitle="" />
      <div className="flex flex-1 items-center justify-center">
        <Spinner />
      </div>
    </>
  );
}
