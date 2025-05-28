import { create } from 'zustand';
import { Rant } from '@/lib/types/rant';
import { MoodType } from '@/lib/utils/mood';
import React, { createContext, useContext } from 'react';

export type SortOption = 'latest' | 'popular' | 'filter' | 'search';

interface RantStoreState {
    rants: Rant[];
    setRants: (rants: Rant[]) => void;
    sortOption: SortOption;
    setSortOption: (option: SortOption) => void;
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

export const useRantStore = create<RantStoreState>((set) => ({
    rants: [],
    setRants: (rants) => set({ rants }),
    sortOption: 'latest',
    setSortOption: (option) => set({ sortOption: option }),
    selectedMoods: [],
    setSelectedMoods: (moods) => set({ selectedMoods: moods }),
    searchQuery: '',
    setSearchQuery: (query) => set({ searchQuery: query }),
    searchMood: null,
    setSearchMood: (mood) => set({ searchMood: mood }),
    loading: true,
    setLoading: (loading) => set({ loading }),
    error: null,
    setError: (error) => set({ error }),
}));

export const RantStoreContext = createContext<ReturnType<typeof useRantStore> | null>(null);

export const RantStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const rantStore = useRantStore();
    return (
        <RantStoreContext.Provider value={rantStore}>
            {children}
        </RantStoreContext.Provider>
    );
};

export const useRantStoreContext = () => {
    const context = useContext(RantStoreContext);
    if (!context) {
        throw new Error('useRantStoreContext must be used within a RantStoreProvider');
    }
    return context;
};
