import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useRantCount(timeLimit?: boolean) {
    const [count, setCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    // const { count: recentCount, loading: recentLoading } = useRantCount(true); // Fetch count for the last 24 hours
    // To get count of all rants
    // const { count: totalCount, loading: totalLoading } = useRantCount(); // Fetch count for all rants

    useEffect(() => {
        async function fetchRantCount() {
            try {
                let query = supabase
                    .from('rants')
                    .select('*', { count: 'exact', head: true });

                // Only apply time filter if timeLimit is true
                if (timeLimit) {
                    query = query.gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
                }

                const { count: rantCount, error } = await query;

                if (error) {
                    console.error('Error fetching rant count:', error);
                    return;
                }

                setCount(rantCount || 0);
            } catch (error) {
                console.error('Error in rant count fetch:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchRantCount();

        // Set up real-time subscription for count updates
        const subscription = supabase
            .channel('rants_count_changes')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'rants'
            }, () => {
                fetchRantCount();
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [timeLimit]);

    return { count, loading };
}
