import type { ProteinAnalysis } from '@repo/database/src/protein-schema';
import { createStore } from 'zustand/vanilla';

export interface ProteinAnalysisState {
  sequences: Record<string, string[]>; // jobId -> sequences mapping
  detailsDialog: {
    isOpen: boolean;
    selectedProtein: ProteinAnalysis | null;
  };
}

export interface ProteinAnalysisActions {
  setSequences: (jobId: string, sequences: string[]) => void;
  getSequences: (jobId: string) => string[];
  clearSequences: (jobId: string) => void;
  clearAllSequences: () => void;
  openProteinDetails: (protein: ProteinAnalysis) => void;
  closeProteinDetails: () => void;
}

export type ProteinAnalysisStore = ProteinAnalysisState &
  ProteinAnalysisActions;

export const defaultProteinAnalysisState: ProteinAnalysisState = {
  sequences: {},
  detailsDialog: {
    isOpen: false,
    selectedProtein: null,
  },
};

export const createProteinAnalysisStore = (
  initState: ProteinAnalysisState = defaultProteinAnalysisState
) => {
  return createStore<ProteinAnalysisStore>((set, get) => ({
    ...initState,
    setSequences: (jobId: string, sequences: string[]) =>
      set((state) => ({
        sequences: {
          ...state.sequences,
          [jobId]: sequences,
        },
      })),
    getSequences: (jobId: string) => {
      const state = get();
      return state.sequences[jobId] || [];
    },
    clearSequences: (jobId: string) =>
      set((state) => {
        const newSequences = { ...state.sequences };
        delete newSequences[jobId];
        return { sequences: newSequences };
      }),
    clearAllSequences: () => set(() => ({ sequences: {} })),
    openProteinDetails: (protein: ProteinAnalysis) =>
      set(() => ({
        detailsDialog: {
          isOpen: true,
          selectedProtein: protein,
        },
      })),
    closeProteinDetails: () =>
      set(() => ({
        detailsDialog: {
          isOpen: false,
          selectedProtein: null,
        },
      })),
  }));
};
