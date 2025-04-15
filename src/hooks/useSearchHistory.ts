import { useState, useEffect } from 'react';
import { MoodType } from '@/lib/utils/mood';

interface SearchHistoryItem {
    query: string;
    mood: MoodType | null;
    timestamp: number;
}

export const useSearchHistory = () => {
    const [searchHistory, setSearchHistory] = useState<Array<{ query: string; mood: MoodType | null }>>([]);

    // Load search history from localStorage on mount
    useEffect(() => {
        try {
            const savedHistory = localStorage.getItem('rantSearchHistory');
            if (savedHistory) {
                const parsedHistory = JSON.parse(savedHistory) as SearchHistoryItem[];

                // Sort by timestamp (newest first) and take only the query and mood
                const formattedHistory = parsedHistory
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .map(({ query, mood }) => ({ query, mood }));

                setSearchHistory(formattedHistory);
            }
        } catch (error) {
            console.error('Failed to load search history:', error);
        }
    }, []);

    // Add a new search to history
    const addToHistory = (query: string, mood: MoodType | null) => {
        if (!query.trim()) return;

        // Create new history item
        const newItem = { query: query.trim(), mood, timestamp: Date.now() };

        // Update state with the new item at the beginning
        setSearchHistory(prev => {
            // Remove duplicates of the same query
            const filteredHistory = prev.filter(item => item.query !== newItem.query);

            // Add new item at the beginning and limit to 10 items
            const updatedHistory = [{ query: newItem.query, mood: newItem.mood }, ...filteredHistory].slice(0, 10);

            // Save to localStorage
            try {
                const historyWithTimestamps = updatedHistory.map((item, index) => ({
                    ...item,
                    timestamp: Date.now() - index // Ensure proper ordering
                }));
                localStorage.setItem('rantSearchHistory', JSON.stringify(historyWithTimestamps));
            } catch (error) {
                console.error('Failed to save search history:', error);
            }

            return updatedHistory;
        });
    };

    // Clear search history
    const clearHistory = () => {
        setSearchHistory([]);
        try {
            localStorage.removeItem('rantSearchHistory');
        } catch (error) {
            console.error('Failed to clear search history:', error);
        }
    };

    return { searchHistory, addToHistory, clearHistory };
};
