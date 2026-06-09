import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AppStore {
  sessionId: string;
  setSessionId: (id: string) => void;
  points: number;
  addPoints: (amount: number) => void;
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  hasOnboarded: boolean;
  setHasOnboarded: (val: boolean) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
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
      user: null,
      setUser: (user) => set({ user }),
      hasOnboarded: false,
      setHasOnboarded: (val) => set({ hasOnboarded: val }),
    }),
    {
      name: 'kamikatsu-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
