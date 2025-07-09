'use client';

import { signIn } from '@repo/auth/client';
import { Spinner } from '@repo/design-system/components/spinner';
import { Button } from '@repo/design-system/components/ui/button';
import { logger } from '@repo/logger';
import { Github } from 'lucide-react';
import { useState } from 'react';

export const Social = () => {
  const [isExecuting, setIsExecuting] = useState(false);

  const onClick = async (provider: 'github') => {
    setIsExecuting(true);
    try {
      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.log('signing in with social');

      await signIn.social(
        {
          provider,
        },
        {
          onSuccess: (ctx) => {
            const authToken = ctx.response.headers.get('set-auth-token'); // get the token from the response headers
            // Store the token securely (e.g., in localStorage)

            // biome-ignore lint/suspicious/noConsole: <explanation>
            console.log('authToken', authToken);

            if (authToken) {
              // biome-ignore lint/suspicious/noConsole: <explanation>
              console.log('setting bearer token');

              localStorage.setItem('bearer_token', authToken);
            }
          },
        }
      );

      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.log('signed in with social 1');
    } catch (error) {
      logger.error(error);
    } finally {
      setIsExecuting(false);

      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.log('signed in with social 2');
    }
  };
  return (
    <div className="flex w-full flex-col items-center gap-2">
      <Button
        className="flex h-9 w-full flex-row items-center justify-center gap-2"
        disabled={isExecuting}
        onClick={() => onClick('github')}
        size="lg"
        variant="outline"
      >
        {isExecuting ? (
          <Spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Github className="h-5 w-5" />
        )}
        <span className="font-medium text-muted-foreground">
          Continue with Github
        </span>
      </Button>
    </div>
  );
};
