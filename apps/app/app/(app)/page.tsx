import { AppHeader } from '~/components/app-header';
import { UserButtonWrapper } from '~/components/auth/user-button-wrapper';
import { ProteinForm } from '~/components/protein-form';

export default function Page() {
  return (
    <>
      <AppHeader userButton={<UserButtonWrapper />} />
      <div className="flex-1 overflow-auto">
        <main className="h-full">
          <div className="container mx-auto max-w-2xl p-6">
            <div className="mb-8 text-center">
              <h1 className="font-semibold text-4xl">Create New Job</h1>
              <p className="mt-2 text-lg text-muted-foreground">
                Analyze protein sequences using computational tools
              </p>
            </div>

            <ProteinForm />
          </div>
        </main>
      </div>
    </>
  );
}
