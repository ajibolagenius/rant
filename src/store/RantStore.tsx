import { create } from 'zustand';
import { Rant } from '@/lib/types/rant';
import { MoodType } from '@/lib/utils/mood';

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
