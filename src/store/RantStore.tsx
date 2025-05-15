import React, { createContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';
import { Rant } from '@/lib/types/rant';
import { MoodType } from '@/lib/utils/mood';

// Use the same SortOption type as the app
export type SortOption = 'latest' | 'popular' | 'filter' | 'search';

// Define the shape of the store
interface RantStoreState {
    rants: Rant[];
    setRants: Dispatch<SetStateAction<Rant[]>>;
    sortOption: SortOption;
    setSortOption: Dispatch<SetStateAction<SortOption>>;
    selectedMoods: string[];
    setSelectedMoods: Dispatch<SetStateAction<string[]>>;
    searchQuery: string;
    setSearchQuery: Dispatch<SetStateAction<string>>;
    searchMood: MoodType | null;
    setSearchMood: Dispatch<SetStateAction<MoodType | null>>;
    loading: boolean;
    setLoading: Dispatch<SetStateAction<boolean>>;
    error: string | null;
    setError: Dispatch<SetStateAction<string | null>>;
}

const RantStoreContext = createContext<RantStoreState | undefined>(undefined);

export const RantStoreProvider = ({ children }: { children: ReactNode }) => {
    const [rants, setRants] = useState<Rant[]>([]);
    const [sortOption, setSortOption] = useState<SortOption>('latest');
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

export { RantStoreContext };
