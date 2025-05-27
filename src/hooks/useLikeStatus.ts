import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getSecureAuthorId } from '@/utils/security';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useLikeStatus(rantId: string) {
    const queryClient = useQueryClient();

    const { data: isLiked = false, isLoading } = useQuery({
        queryKey: ['likeStatus', rantId],
        queryFn: async () => {
            const authorId = getSecureAuthorId();
            const { data, error } = await supabase
                .from('likes')
                .select('*')
                .eq('rant_id', rantId)
                .eq('anonymous_user_id', authorId)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return !!data;
        },
    });

    const mutation = useMutation({
        mutationFn: async ({ liked }: { liked: boolean }) => {
            const authorId = getSecureAuthorId();
            if (liked) {
                await supabase.from('likes').insert({ rant_id: rantId, anonymous_user_id: authorId });
            } else {
                await supabase.from('likes').delete().eq('rant_id', rantId).eq('anonymous_user_id', authorId);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['likeStatus', rantId] });
        },
    });

    const toggleLike = () => {
        mutation.mutate({ liked: !isLiked });
    };

    return { isLiked, isLoading, toggleLike };
}
