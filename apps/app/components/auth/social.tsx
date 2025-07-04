import { Button } from '@repo/design-system/components/ui/button';
import { Github } from 'lucide-react';

import { signInWithGithub } from '~/lib/actions/auth';

export const Social = () => {
  return (
    <form className="flex w-full flex-col items-center gap-2">
      <Button
        className="flex h-9 w-full flex-row items-center justify-center gap-2"
        formAction={signInWithGithub}
        size="lg"
        variant="outline"
      >
        <Github className="h-5 w-5" />
        <span className="font-medium text-muted-foreground">
          Continue with Github
        </span>
      </Button>
    </form>
  );
};
