import { createStore } from 'zustand/vanilla';

export interface ProteinAnalysisState {
  sequences: Record<string, string[]>; // jobId -> sequences mapping
}

export interface ProteinAnalysisActions {
  setSequences: (jobId: string, sequences: string[]) => void;
  getSequences: (jobId: string) => string[];
  clearSequences: (jobId: string) => void;
  clearAllSequences: () => void;
}

export type ProteinAnalysisStore = ProteinAnalysisState &
  ProteinAnalysisActions;

export const defaultProteinAnalysisState: ProteinAnalysisState = {
  sequences: {},
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
  }));
};
