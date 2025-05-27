import { useState, useEffect } from 'react';

export const useBookmark = (rantId: string) => {
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
