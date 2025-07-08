import { AppHeader } from '~/components/app-header';
import { UserButtonWrapper } from '~/components/auth/user-button-wrapper';

export default function Page() {
  return (
    <>
      <AppHeader userButton={<UserButtonWrapper />} />
      <div className="flex-1 overflow-auto">
        <main className="h-full">
          <div className="flex h-full flex-col items-center justify-center">
            <h1 className="font-semibold text-4xl">Welcome!</h1>
            <h2 className="text-lg text-muted-foreground">
              Create a new job to get started.
            </h2>
          </div>
        </main>
      </div>
    </>
  );
}
