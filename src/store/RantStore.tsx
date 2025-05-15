import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Rant } from '@/lib/types/rant';
import { MoodType } from '@/lib/utils/mood';

// Define the shape of the store
interface RantStoreState {
  rants: Rant[];
  setRants: (rants: Rant[]) => void;
  sortOption: string;
  setSortOption: (option: string) => void;
  selectedMoods: string[];
  setSelectedMoods: (moods: string[]) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchMood: MoodType | null;
  setSearchMood: (mood: MoodType | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

const RantStoreContext = createContext<RantStoreState | undefined>(undefined);

export const RantStoreProvider = ({ children }: { children: ReactNode }) => {
  const [rants, setRants] = useState<Rant[]>([]);
  const [sortOption, setSortOption] = useState<string>('latest');
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchMood, setSearchMood] = useState<MoodType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const value: RantStoreState = {
    rants,
    setRants,
    sortOption,
    setSortOption,
    selectedMoods,
    setSelectedMoods,
    searchQuery,
    setSearchQuery,
    searchMood,
    setSearchMood,
    loading,
    setLoading,
    error,
    setError,
  };

  return (
    <RantStoreContext.Provider value={value}>
      {children}
    </RantStoreContext.Provider>
  );
};

export function useRantStore() {
  const context = useContext(RantStoreContext);
  if (!context) {
    throw new Error('useRantStore must be used within a RantStoreProvider');
  }
  return context;
}
