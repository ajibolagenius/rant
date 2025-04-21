import { createContext, ReactNode, useState } from 'react';
import { useRantsLogic } from '@/hooks/useRantsLogic';
import { Rant } from '@/lib/types/rant';
import { MoodType } from '@/lib/utils/mood';
import { supabase } from '@/lib/supabase';
import { getSecureAuthorId } from '@/utils/security';

interface RantContextType {
    rants: Rant[];
    loading: boolean;
    error: string | null;
    likeRant: (id: string) => Promise<void>;
    loadMoreRants: () => Promise<void>;
    hasMore: boolean;
}

const RantContext = createContext<RantContextType | undefined>(undefined);

interface RantProviderProps {
    children: ReactNode;
    initialSortBy?: 'latest' | 'popular';
    initialMoods?: string[];
    initialSearchQuery?: string;
    initialSearchMood?: MoodType | null;
}

export const RantProvider = ({
    children,
    initialSortBy = 'latest',
    initialMoods = [],
    initialSearchQuery = '',
    initialSearchMood = null
}: RantProviderProps) => {
    const { rants: fetchedRants, loading, error, hasMore, fetchRants, setPage } = useRantsLogic({
        initialSortBy,
        initialMoods,
        initialSearchQuery,
        initialSearchMood
    });

    // Ensure `setRants` is defined within the `RantProvider` component
    const [rants, setRants] = useState<Rant[]>(fetchedRants);

    // Convert `error` to a string for compatibility
    const errorString = error ? error.message : null;

    // Correctly implement the `likeRant` function
    const likeRant = async (id: string) => {
        try {
            await supabase
                .from('likes_log')
                .insert({ rant_id: id, author_id: getSecureAuthorId() });

            setRants((prev) =>
                prev.map((rant) =>
                    rant.id === id ? { ...rant, likes: rant.likes + 1 } : rant
                )
            );
        } catch (error) {
            console.error('Error liking rant:', error);
        }
    };

    return (
        <RantContext.Provider
            value={{
                rants,
                loading,
                error: errorString,
                likeRant,
                loadMoreRants: async () => {
                    await fetchRants();
                },
                hasMore
            }}
        >
            {children}
        </RantContext.Provider>
    );
};
