'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useRef } from 'react';
import { useStore } from 'zustand';

import type {
  ProteinAnalysisState,
  ProteinAnalysisStore,
} from '~/stores/protein-analysis-store';
import { createProteinAnalysisStore } from '~/stores/protein-analysis-store';

export type ProteinAnalysisStoreApi = ReturnType<
  typeof createProteinAnalysisStore
>;

export const ProteinAnalysisStoreContext = createContext<
  ProteinAnalysisStoreApi | undefined
>(undefined);

export interface ProteinAnalysisStoreProviderProps {
  children: ReactNode;
  initialState?: ProteinAnalysisState;
}

export const ProteinAnalysisStoreProvider = ({
  children,
  initialState,
}: ProteinAnalysisStoreProviderProps) => {
  const storeRef = useRef<ProteinAnalysisStoreApi>(null);

  if (!storeRef.current) {
    storeRef.current = createProteinAnalysisStore(initialState);
  }

  return (
    <ProteinAnalysisStoreContext.Provider value={storeRef.current}>
      {children}
    </ProteinAnalysisStoreContext.Provider>
  );
};

export function useProteinAnalysisStore<T>(
  selector: (store: ProteinAnalysisStore) => T
): T {
  const store = useContext(ProteinAnalysisStoreContext);

  if (!store) {
    throw new Error(
      'useProteinAnalysisStore must be used within a ProteinAnalysisStoreProvider'
    );
  }

  return useStore(store, selector);
}
