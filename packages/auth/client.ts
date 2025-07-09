import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  fetchOptions: {
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
  },
});

// Export individual functions for convenience
export const { signIn, signOut, signUp, useSession, getSession } = authClient;
