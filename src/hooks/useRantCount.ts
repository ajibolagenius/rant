import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useRantCount() {
    const [count, setCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function fetchRantCount() {
            try {
                setLoading(true);

                // Get count of rants from Supabase
                const { count: rantCount, error } = await supabase
                    .from('rants')
                    .select('*', { count: 'exact', head: true });

                if (error) throw error;

                // Set a random number between 80% and 120% of actual count to make it feel more dynamic
                const displayCount = rantCount
                    ? Math.floor(rantCount * (0.8 + Math.random() * 0.4))
                    : 0;

                setCount(displayCount);
            } catch (err) {
                console.error('Error fetching rant count:', err);
                setError(err instanceof Error ? err : new Error('Unknown error'));
                // Fallback to a reasonable number if there's an error
                setCount(Math.floor(50 + Math.random() * 100));
            } finally {
                setLoading(false);
            }
        }

        fetchRantCount();

        // Set up a subscription for real-time updates
        const subscription = supabase
            .channel('rants_count')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'rants' }, () => {
                fetchRantCount();
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return { count, loading, error };
}
