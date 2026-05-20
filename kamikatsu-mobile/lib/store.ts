import { create } from 'zustand';

interface AppStore {
  sessionId: string;
  setSessionId: (id: string) => void;
  points: number;
  addPoints: (amount: number) => void;
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  sessionId: '',
  setSessionId: (id) => set({ sessionId: id }),
  points: 0,
  addPoints: (amount) => set((state) => ({ points: state.points + amount })),
  recentSearches: [],
  addRecentSearch: (query) =>
    set((state) => ({
      recentSearches: [
        query,
        ...state.recentSearches.filter((q) => q !== query),
      ].slice(0, 5),
    })),
}));
