import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, fetchRants, likeRant as likeRantInSupabase } from '@/lib/supabase';
import { Rant } from '@/lib/types/rant';
import { MoodType } from '@/lib/utils/mood';
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

export const RantProvider: React.FC<RantProviderProps> = ({
    children,
    initialSortBy = 'latest',
    initialMoods = [],
    initialSearchQuery = '',
    initialSearchMood = null
}) => {
    const [rants, setRants] = useState<Rant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [sortBy, setSortBy] = useState(initialSortBy);
    const [moods, setMoods] = useState(initialMoods);
    const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
    const [searchMood, setSearchMood] = useState(initialSearchMood);

    const LIMIT = 20;

    // Function to load rants
    const loadRants = async (reset = false) => {
        if (loading && !reset) return;

        try {
            setLoading(true);
            const offset = reset ? 0 : page * LIMIT;

            const data = await fetchRants({
                limit: LIMIT,
                offset,
                sortBy,
                moods,
                searchQuery,
                searchMood
            });

            // Transform data to match Rant type if needed
            const transformedData: Rant[] = data.map(item => ({
                id: item.id,
                content: item.content,
                mood: item.mood as MoodType,
                createdAt: item.created_at,
                likes: item.likes || 0,
                comments: item.comments || 0,
                userAlias: 'Anonymous',
            }));

            setRants(prev => reset ? transformedData : [...prev, ...transformedData]);
            setHasMore(data.length === LIMIT);

            if (reset) {
                setPage(0);
            } else {
                setPage(prev => prev + 1);
            }
        } catch (err) {
            console.error('Error fetching rants:', err);
            setError('Failed to load rants. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        loadRants(true);
    }, [sortBy, moods.join(','), searchQuery, searchMood]);

    // Set up real-time subscription
    useEffect(() => {
        const subscription = supabase
            .channel('public:rants')
            .on('INSERT', payload => {
                const newRant = payload.new;

                // Transform to match Rant type
                const transformedRant: Rant = {
                    id: newRant.id,
                    content: newRant.content,
                    mood: newRant.mood as MoodType,
                    createdAt: newRant.created_at,
                    likes: newRant.likes || 0,
                    comments: newRant.comments || 0,
                    userAlias: 'Anonymous',
                };

                // Check if the rant matches current filters
                let shouldAdd = true;

                if (moods.length > 0) {
                    shouldAdd = moods.includes(newRant.mood);
                }

                if (shouldAdd && searchMood) {
                    shouldAdd = newRant.mood === searchMood;
                }

                if (shouldAdd && searchQuery) {
                    shouldAdd = newRant.content.toLowerCase().includes(searchQuery.toLowerCase());
                }

                if (shouldAdd) {
                    setRants(prev => [transformedRant, ...prev]);
                }
            })
            .on('UPDATE', payload => {
                const updatedRant = payload.new;

                // Update the rant in the list
                setRants(prev =>
                    prev.map(rant =>
                        rant.id === updatedRant.id
                            ? {
                                ...rant,
                                content: updatedRant.content,
                                mood: updatedRant.mood as MoodType,
                                likes: updatedRant.likes || 0,
                                comments: updatedRant.comments || 0
                            }
                            : rant
                    )
                );
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [moods, searchQuery, searchMood]);

    // Function to load more rants
    const loadMoreRants = async () => {
        if (!loading && hasMore) {
            await loadRants();
        }
    };

    // Function to like a rant
    const likeRant = async (id: string) => {
        try {
            // Using secure author ID instead of regular getAuthorId
            const authorId = getSecureAuthorId();

            // Optimistically update UI
            setRants(prev =>
                prev.map(rant =>
                    rant.id === id ? { ...rant, likes: rant.likes + 1 } : rant
                )
            );

            // Update in database
            await likeRantInSupabase(id, authorId);
        } catch (err) {
            console.error('Error liking rant:', err);

            // Revert optimistic update if there was an error
            setRants(prev => [...prev]);
            throw err;
        }
    };

    // Update filters
    useEffect(() => {
        setSortBy(initialSortBy);
        setMoods(initialMoods);
        setSearchQuery(initialSearchQuery);
        setSearchMood(initialSearchMood);
    }, [initialSortBy, initialMoods.join(','), initialSearchQuery, initialSearchMood]);

    return (
        <RantContext.Provider
            value={{
                rants,
                loading,
                error,
                likeRant,
                loadMoreRants,
                hasMore
            }}
        >
            {children}
        </RantContext.Provider>
    );
};

export const useRants = () => {
    const context = useContext(RantContext);
    if (context === undefined) {
        throw new Error('useRants must be used within a RantProvider');
    }
    return context;
};
