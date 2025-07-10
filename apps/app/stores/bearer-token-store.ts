import { logger } from '@repo/logger';
import { persist } from 'zustand/middleware';
import { createStore } from 'zustand/vanilla';

export interface BearerTokenState {
  bearerToken: string | null;
  sessionToken: string | null;
  isLoading: boolean;
}

export interface BearerTokenActions {
  fetchAndSetBearerToken: (sessionToken: string) => Promise<void>;
  refreshBearerToken: () => Promise<void>;
  clearBearerToken: () => void;
  setSessionToken: (sessionToken: string) => void;
}

export type BearerTokenStore = BearerTokenState & BearerTokenActions;

export const defaultBearerTokenState: BearerTokenState = {
  bearerToken: null,
  sessionToken: null,
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

const createBearerTokenStore = (
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
            set({ bearerToken: token, isLoading: false, sessionToken });
          } catch (error) {
            logger.error('Error fetching bearer token:', error);
            set({ bearerToken: null, isLoading: false });
          }
        },
        refreshBearerToken: async () => {
          const sessionToken = get().sessionToken;
          if (!sessionToken) {
            logger.error('No session token available to refresh bearer token.');
            set({ isLoading: false });
            return;
          }
          set({ isLoading: true });
          try {
            const token = await fetchToken(sessionToken);
            set({ bearerToken: token, isLoading: false });
          } catch (error) {
            logger.error('Error refreshing bearer token:', error);
            // Clear the potentially expired token
            set({ bearerToken: null, isLoading: false });
          }
        },
        clearBearerToken: () => {
          set({ bearerToken: null, sessionToken: null });
        },
        setSessionToken: (sessionToken: string) => {
          set({ sessionToken });
        },
      }),
      {
        name: 'bearer-token-store',
        partialize: (state) => ({
          bearerToken: state.bearerToken,
        }),
      }
    )
  );
};

export const bearerTokenStore = createBearerTokenStore();
