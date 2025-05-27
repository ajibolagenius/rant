import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Rant } from '@/lib/types/rant';

// Custom hook for managing bookmarks
export const useLocalBookmark = (rantId: string) => {
    const [isBookmarked, setIsBookmarked] = useState(false);

    useEffect(() => {
        const bookmarks = JSON.parse(localStorage.getItem('rant_bookmarks') || '[]');
        setIsBookmarked(bookmarks.includes(rantId));
    }, [rantId]);

    const toggleBookmark = () => {
        const bookmarks = JSON.parse(localStorage.getItem('rant_bookmarks') || '[]');
        if (isBookmarked) {
            const updatedBookmarks = bookmarks.filter((id: string) => id !== rantId);
            localStorage.setItem('rant_bookmarks', JSON.stringify(updatedBookmarks));
            setIsBookmarked(false);
        } else {
            const updatedBookmarks = [...bookmarks, rantId];
            localStorage.setItem('rant_bookmarks', JSON.stringify(updatedBookmarks));
            setIsBookmarked(true);
        }
    };

    return { isBookmarked, toggleBookmark };
};

// Custom hook for fetching related rants
export const useLocalRelatedRants = (rant: Rant, isModalOpen: boolean) => {
    const [relatedRants, setRelatedRants] = useState<Rant[]>([]);

    useEffect(() => {
        if (!isModalOpen) return;

        const fetchRelatedRants = async () => {
            const { data, error } = await supabase
                .from('rants')
                .select('*')
                .eq('mood', rant.mood)
                .neq('id', rant.id)
                .limit(5);

            if (!error && data) {
                setRelatedRants(data);
            }
        };

        fetchRelatedRants();
    }, [rant, isModalOpen]);

    return relatedRants;
};
