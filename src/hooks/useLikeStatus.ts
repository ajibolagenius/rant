import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getAuthorId } from '@/utils/authorId';

export function useLikeStatus(rantId: string) {
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function checkLikeStatus() {
            setIsLoading(true);
            const authorId = getAuthorId();

            // Check if the current user has liked this rant
            const { data: likeData } = await supabase
                .from('likes_log')
                .select('*')
                .eq('rant_id', rantId)
                .eq('author_id', authorId)
                .single();

            // Get the total like count
            // Changed 'likes' to 'likes_log'
            const { count } = await supabase
                .from('likes_log')
                .select('*', { count: 'exact', head: true })
                .eq('rant_id', rantId);

            setIsLiked(!!likeData);
            setLikeCount(count || 0);
            setIsLoading(false);
        }

        checkLikeStatus();
    }, [rantId]);

    return { isLiked, likeCount, isLoading };
}
