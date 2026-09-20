import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState } from '../types';
import { EMPTY_CLAIM_MAP, normalizeClaimMap } from '../lib/claim-map';

const persistableClaimMap = (claimMap: AppState['claimMap']): AppState['claimMap'] => ({
  ...claimMap,
  referencePatents: claimMap.referencePatents.map((patent) => ({
    ...patent,
    document: { ...patent.document, extractedText: '' },
  })),
});

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentStep: 'define',
      apiKey: typeof window !== 'undefined' ? sessionStorage.getItem('gpt-api-key') || '' : '',
      inventionInfo: null,
      keywords: null,
      searchQueries: [],
      priorArtItems: [],
      selectedItems: [],
      claimMap: EMPTY_CLAIM_MAP,

      setCurrentStep: (step) => set({ currentStep: step }),
      
      setApiKey: (key) => {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('gpt-api-key', key);
        }
        set({ apiKey: key });
      },
      
      setInventionInfo: (info) => set({ inventionInfo: info }),
      
      setKeywords: (keywords) => set({ keywords }),
      
      addSearchQuery: (query) =>
        set((state) => ({
          searchQueries: [...state.searchQueries, query],
        })),
      
      setSearchQueries: (queries) => set({ searchQueries: queries }),
      
      addPriorArtItem: (item) =>
        set((state) => ({
          priorArtItems: [...state.priorArtItems, item],
        })),
      
      updatePriorArtItem: (id, updates) =>
        set((state) => ({
          priorArtItems: state.priorArtItems.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        })),
      
      deletePriorArtItem: (id) =>
        set((state) => ({
          priorArtItems: state.priorArtItems.filter((item) => item.id !== id),
          selectedItems: state.selectedItems.filter((itemId) => itemId !== id),
        })),
      
      toggleSelectedItem: (id) =>
        set((state) => ({
          selectedItems: state.selectedItems.includes(id)
            ? state.selectedItems.filter((itemId) => itemId !== id)
            : [...state.selectedItems, id],
        })),
      
      setPriorArtItems: (items) => set({ priorArtItems: items }),

      setClaimMap: (claimMap) => set({ claimMap }),

      updateClaimMap: (updates) =>
        set((state) => ({ claimMap: { ...state.claimMap, ...updates } })),

      resetClaimMap: () => set({ claimMap: EMPTY_CLAIM_MAP }),
    }),
    {
      name: 'patent-search-storage',
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as Partial<AppState> & { currentStep?: number | AppState['currentStep'] };
        const oldStep = state.currentStep;
        const currentStep = typeof oldStep === 'number'
          ? oldStep === 1 ? 'define' : oldStep === 2 ? 'claim-map' : 'report'
          : oldStep || 'define';
        return {
          ...state,
          currentStep,
          claimMap: normalizeClaimMap(state.claimMap),
        } as AppState;
      },
      partialize: (state) => ({
        inventionInfo: state.inventionInfo,
        keywords: state.keywords,
        searchQueries: state.searchQueries,
        priorArtItems: state.priorArtItems,
        selectedItems: state.selectedItems,
        claimMap: persistableClaimMap(state.claimMap),
        currentStep: state.currentStep,
      }),
    }
  )
);
