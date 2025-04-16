import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Rant } from '@/lib/types/rant';
import { MoodType } from '@/lib/utils/mood';
import { getAuthorId } from '@/utils/authorId';

interface RantContextType {
    rants: Rant[];
    loading: boolean;
    error: string | null;
    addRant: (content: string, mood: MoodType) => Promise<void>;
    likeRant: (id: string) => Promise<void>;
    loadMoreRants: () => Promise<void>;
}

const RantContext = createContext<RantContextType | undefined>(undefined);

interface RantProviderProps {
    children: ReactNode;
}

export const RantProvider: React.FC<RantProviderProps> = ({ children }) => {
    const [rants, setRants] = useState<Rant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const LIMIT = 50;

    // Initial fetch of rants
    useEffect(() => {
        fetchRants();

        // Set up real-time subscription
        const subscription = supabase
            .channel('public:rants')
            .on('INSERT', payload => {
                const newRant = payload.new as Rant;
                console.log("New rant added:", newRant); // Debugging log
                setRants(prevRants => {
                    // Avoid duplicates
                    const newRantsList = prevRants.filter(rant => rant.id !== newRant.id);
                    return [...newRantsList, newRant]; // Add new rant to the end
                });
            })
            .on('UPDATE', payload => {
                const updatedRant = payload.new as Rant;
                console.log("Rant updated:", updatedRant); // Debugging log
                setRants(prevRants =>
                    prevRants.map(rant =>
                        rant.id === updatedRant.id ? updatedRant : rant
                    )
                );
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const fetchRants = async () => {
        try {
            setLoading(true);
            setError(null);

            const options = {
                limit: LIMIT,
                offset: 0,
                sortBy: 'latest',
                moods: [],
                searchQuery: '',
                searchMood: null
            };

            const data = await fetchRantsFromSupabase(options);
            setRants(data || []);
            setPage(1);
            setHasMore(data.length === LIMIT);
        } catch (err) {
            console.error('Error fetching rants:', err);
            setError('Failed to fetch rants');
        } finally {
            setLoading(false);
        }
    };

    const fetchRantsFromSupabase = async (options: any) => {
        const { limit, offset, sortBy, moods, searchQuery, searchMood } = options;

        let query = supabase
            .from('rants')
            .select('*');

        // Apply sorting
        if (sortBy === 'popular') {
            query = query.order('likes', { ascending: false });
        } else {
            query = query.order('created_at', { ascending: false });
        }

        // Apply mood filtering
        if (moods && moods.length > 0) {
            query = query.in('mood', moods);
        }

        // Apply search query
        if (searchQuery) {
            query = query.ilike('content', `%${searchQuery}%`);
        }

        // Apply mood search
        if (searchMood) {
            query = query.eq('mood', searchMood);
        }

        // Apply pagination
        query = query.range(offset, offset + limit - 1);

        const { data, error } = await query;

        if (error) throw error;

        return data;
    };

    const loadMoreRants = async () => {
        if (!hasMore || loading) return;

        try {
            setLoading(true);

            const options = {
                limit: LIMIT,
                offset: page * LIMIT,
                sortBy: 'latest',
                moods: [],
                searchQuery: '',
                searchMood: null
            };

            const data = await fetchRantsFromSupabase(options);

            if (data && data.length > 0) {
                setRants(prevRants => [...prevRants, ...data]);
                setPage(prevPage => prevPage + 1);
                setHasMore(data.length === LIMIT);
            } else {
                setHasMore(false);
            }
        } catch (err) {
            console.error('Error loading more rants:', err);
            setError('Failed to load more rants');
        } finally {
            setLoading(false);
        }
    };

    const addRant = async (content: string, mood: MoodType) => {
        try {
            const authorId = getAuthorId();

            const newRant = {
                id: crypto.randomUUID(),
                content,
                mood,
                author_id: authorId,
                likes: 0,
                created_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('rants')
                .insert([newRant]);

            if (error) throw error;

            // We don't need to update the state here as the real-time subscription will handle it
        } catch (err) {
            console.error('Error adding rant:', err);
            throw err;
        }
    };

    const likeRant = async (id: string) => {
        try {
            const authorId = getAuthorId();

            // Optimistically update UI
            setRants(prevRants =>
                prevRants.map(rant =>
                    rant.id === id ? { ...rant, likes: rant.likes + 1 } : rant
                )
            );

            // Update in database
            const { error } = await supabase
                .from('rant_likes')
                .insert([{ rant_id: id, author_id: authorId }]);

            if (error) throw error;
        } catch (err) {
            console.error('Error liking rant:', err);
            // Revert optimistic update
            setRants(prevRants => [...prevRants]);
            throw err;
        }
    };

    return (
        <RantContext.Provider
            value={{
                rants,
                loading,
                error,
                addRant,
                likeRant,
                loadMoreRants
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
