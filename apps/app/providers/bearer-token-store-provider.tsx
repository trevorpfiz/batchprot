'use client';

import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';
import { useStore } from 'zustand';

import type { BearerTokenStore } from '~/stores/bearer-token-store';
import { bearerTokenStore } from '~/stores/bearer-token-store';

export type BearerTokenStoreApi = typeof bearerTokenStore;

export const BearerTokenStoreContext = createContext<
  BearerTokenStoreApi | undefined
>(undefined);

export interface BearerTokenStoreProviderProps {
  children: ReactNode;
}

export function BearerTokenStoreProvider({
  children,
}: BearerTokenStoreProviderProps) {
  return (
    <BearerTokenStoreContext.Provider value={bearerTokenStore}>
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
