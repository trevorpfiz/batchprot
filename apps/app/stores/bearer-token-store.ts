import { logger } from '@repo/logger';
import { persist } from 'zustand/middleware';
import { createStore } from 'zustand/vanilla';

export interface BearerTokenState {
  bearerToken: string | null;
  isLoading: boolean;
}

export interface BearerTokenActions {
  fetchAndSetBearerToken: (sessionToken: string) => Promise<void>;
  clearBearerToken: () => void;
}

export type BearerTokenStore = BearerTokenState & BearerTokenActions;

export const defaultBearerTokenState: BearerTokenState = {
  bearerToken: null,
  isLoading: true,
};

async function fetchToken(sessionToken: string): Promise<string> {
  logger.info('Fetching bearer token...');
  const response = await fetch('/api/auth/token', {
    headers: {
      Authorization: `Bearer ${sessionToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch bearer token from /api/auth/token');
  }

  const data = (await response.json()) as { token: string };
  const newBearerToken = data.token;

  if (!newBearerToken) {
    throw new Error('Token not present in response from /api/auth/token');
  }

  logger.info('Bearer token fetched successfully.');
  return newBearerToken;
}

export const createBearerTokenStore = (
  initState: BearerTokenState = defaultBearerTokenState
) => {
  return createStore<BearerTokenStore>()(
    persist(
      (set, get) => ({
        ...initState,
        fetchAndSetBearerToken: async (sessionToken) => {
          if (get().bearerToken) {
            set({ isLoading: false });
            return;
          }
          set({ isLoading: true });
          try {
            const token = await fetchToken(sessionToken);
            set({ bearerToken: token, isLoading: false });
          } catch (error) {
            logger.error('Error fetching bearer token:', error);
            set({ bearerToken: null, isLoading: false });
          }
        },
        clearBearerToken: () => {
          set({ bearerToken: null });
        },
      }),
      {
        name: 'bearer-token-store',
        partialize: (state) => ({ bearerToken: state.bearerToken }),
      }
    )
  );
};
