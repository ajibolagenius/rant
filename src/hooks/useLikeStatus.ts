import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getSecureAuthorId } from '@/utils/security';
import { secureStorage } from '@/utils/security';

export function useLikeStatus(rantId: string) {
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // Function to update like status
    const setLikeStatus = async (liked: boolean): Promise<void> => {
        const authorId = getSecureAuthorId();

        if (liked) {
            // Add like to database
            await supabase
                .from('likes_log')
                .insert({
                    rant_id: rantId,
                    author_id: authorId
                });

            // Update local state
            setIsLiked(true);
            setLikeCount(prev => prev + 1);

            // Store in secure storage
            const likedRants = secureStorage.getItem('liked_rants');
            const likedRantsArray = likedRants ? JSON.parse(likedRants) : [];

            if (!likedRantsArray.includes(rantId)) {
                likedRantsArray.push(rantId);
                secureStorage.setItem('liked_rants', JSON.stringify(likedRantsArray));
            }
        } else {
            // Remove like from database
            await supabase
                .from('likes_log')
                .delete()
                .eq('rant_id', rantId)
                .eq('author_id', authorId);

            // Update local state
            setIsLiked(false);
            setLikeCount(prev => Math.max(0, prev - 1));

            // Update secure storage
            const likedRants = secureStorage.getItem('liked_rants');
            if (likedRants) {
                const likedRantsArray = JSON.parse(likedRants);
                const updatedLikes = likedRantsArray.filter((id: string) => id !== rantId);
                secureStorage.setItem('liked_rants', JSON.stringify(updatedLikes));
            }
        }
    };

    useEffect(() => {
        async function checkLikeStatus() {
            setIsLoading(true);
            const authorId = getSecureAuthorId();

            // Try to get from secure storage first for faster response
            const likedRants = secureStorage.getItem('liked_rants');
            let cachedIsLiked = false;

            if (likedRants) {
                try {
                    const likedRantsArray = JSON.parse(likedRants);
                    cachedIsLiked = likedRantsArray.includes(rantId);
                } catch (error) {
                    console.error('Error parsing liked rants from storage:', error);
                }
            }

            // Set initial state from cache
            setIsLiked(cachedIsLiked);

            // Check if the current user has liked this rant from database
            const { data: likeData } = await supabase
                .from('likes_log')
                .select('*')
                .eq('rant_id', rantId)
                .eq('author_id', authorId)
                .single();

            // Get the total like count
            const { count } = await supabase
                .from('likes_log')
                .select('*', { count: 'exact', head: true })
                .eq('rant_id', rantId);

            // Update state with database values
            const serverIsLiked = !!likeData;
            setIsLiked(serverIsLiked);
            setLikeCount(count || 0);
            setIsLoading(false);

            // Update secure storage if different from server
            if (cachedIsLiked !== serverIsLiked) {
                const likedRants = secureStorage.getItem('liked_rants');
                const likedRantsArray = likedRants ? JSON.parse(likedRants) : [];

                if (serverIsLiked && !likedRantsArray.includes(rantId)) {
                    likedRantsArray.push(rantId);
                    secureStorage.setItem('liked_rants', JSON.stringify(likedRantsArray));
                } else if (!serverIsLiked && likedRantsArray.includes(rantId)) {
                    const updatedLikes = likedRantsArray.filter((id: string) => id !== rantId);
                    secureStorage.setItem('liked_rants', JSON.stringify(updatedLikes));
                }
            }
        }

        checkLikeStatus();
    }, [rantId]);

    return { isLiked, likeCount, isLoading, setLikeStatus };
}
