import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Rant } from '@/lib/types/rant';
import { MoodType } from '@/lib/utils/mood';
import { getAuthorId } from '@/utils/authorId';

interface UseRantsOptions {
    limit?: number;
    sortBy?: 'latest' | 'popular';
    moods?: string[];
    searchQuery?: string;
    searchMood?: MoodType | null;
}

export function useRants(options: UseRantsOptions = {}) {
    const [rants, setRants] = useState<Rant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);

    const {
        limit = 20,
        sortBy = 'latest',
        moods = [],
        searchQuery = '',
        searchMood = null
    } = options;

    const fetchRants = useCallback(async (reset = false) => {
        if (loading && !reset) return;

        try {
            setLoading(true);
            const offset = reset ? 0 : page * limit;

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

            const { data, error: fetchError } = await query;

            if (fetchError) throw fetchError;

            // Transform data to match Rant type
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
            setHasMore(data.length === limit);

            if (reset) {
                setPage(0);
            } else {
                setPage(prev => prev + 1);
            }
        } catch (err) {
            console.error('Error fetching rants:', err);
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setLoading(false);
        }
    }, [limit, page, sortBy, moods, searchQuery, searchMood, loading]);

    // Initial fetch
    useEffect(() => {
        fetchRants(true);
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
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [moods, searchQuery, searchMood]);

    const loadMoreRants = useCallback(() => {
        if (!loading && hasMore) {
            fetchRants();
        }
    }, [fetchRants, loading, hasMore]);

    const likeRant = useCallback(async (id: string) => {
        try {
            const authorId = getAuthorId();

            // Optimistically update UI
            setRants(prev =>
                prev.map(rant =>
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
            setRants(prev => [...prev]);
            throw err;
        }
    }, []);

    return {
        rants,
        loading,
        error,
        hasMore,
        loadMoreRants,
        likeRant
    };
}
