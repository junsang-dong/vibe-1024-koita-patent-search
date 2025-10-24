import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState } from '../types';

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentStep: 1,
      apiKey: typeof window !== 'undefined' ? sessionStorage.getItem('gpt-api-key') || '' : '',
      inventionInfo: null,
      keywords: null,
      searchQueries: [],
      priorArtItems: [],
      selectedItems: [],

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
    }),
    {
      name: 'patent-search-storage',
      partialize: (state) => ({
        inventionInfo: state.inventionInfo,
        keywords: state.keywords,
        searchQueries: state.searchQueries,
        priorArtItems: state.priorArtItems,
        selectedItems: state.selectedItems,
        currentStep: state.currentStep,
      }),
    }
  )
);

