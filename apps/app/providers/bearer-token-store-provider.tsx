'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useRef } from 'react';
import { useStore } from 'zustand';

import type {
  BearerTokenState,
  BearerTokenStore,
} from '~/stores/bearer-token-store';
import { createBearerTokenStore } from '~/stores/bearer-token-store';

export type BearerTokenStoreApi = ReturnType<typeof createBearerTokenStore>;

export const BearerTokenStoreContext = createContext<
  BearerTokenStoreApi | undefined
>(undefined);

export interface BearerTokenStoreProviderProps {
  children: ReactNode;
  initialState?: BearerTokenState;
}

export function BearerTokenStoreProvider({
  children,
  initialState,
}: BearerTokenStoreProviderProps) {
  const storeRef = useRef<BearerTokenStoreApi>(null);

  if (!storeRef.current) {
    storeRef.current = createBearerTokenStore(initialState);
  }

  return (
    <BearerTokenStoreContext.Provider value={storeRef.current}>
      {children}
    </BearerTokenStoreContext.Provider>
  );
}

export function useBearerTokenStore<T>(
  selector: (store: BearerTokenStore) => T
): T {
  const store = useContext(BearerTokenStoreContext);

  if (!store) {
    throw new Error(
      'useBearerTokenStore must be used within a BearerTokenStoreProvider'
    );
  }

  return useStore(store, selector);
}
