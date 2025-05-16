import { useState, useEffect } from 'react';
import { Rant } from '../lib/types/rant'; // Use canonical type

export function useSearchSuggestions(rants: Rant[] = [], maxSuggestions = 5) {
    const [suggestions, setSuggestions] = useState<string[]>([]);

    useEffect(() => {
        if (!rants.length) return;

        // Generate suggestions based on popular rants
        const popularRants = [...rants]
            .sort((a, b) => (b.likes || 0) - (a.likes || 0))
            .slice(0, maxSuggestions * 2);

        // Extract meaningful keywords
        const keywords = popularRants
            .flatMap(rant => rant.content.split(' ')
                .filter(word => word.length > 4)
                .map(word => word.toLowerCase().replace(/[^a-z0-9]/g, '')))
            .filter(Boolean);

        // Count occurrences and get top keywords
        const counts = keywords.reduce((acc, word) => {
            acc[word] = (acc[word] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const topKeywords = Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, maxSuggestions)
            .map(([word]) => word);

        setSuggestions(topKeywords);
    }, [rants, maxSuggestions]);

    return suggestions;
}
