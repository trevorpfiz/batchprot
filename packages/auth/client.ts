import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient();

// Export individual functions for convenience
export const { signIn, signOut, signUp, useSession, getSession } = authClient;
