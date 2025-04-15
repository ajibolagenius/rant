import Fuse from 'fuse.js';
import { Rant } from '@/lib/types/rant';

// Create a fuzzy searcher for rants
export const createFuzzySearcher = (rants: Rant[]) => {
    return new Fuse(rants, {
        keys: ['content', 'userAlias'],
        includeScore: true,
        threshold: 0.4, // Lower threshold means more strict matching
        ignoreLocation: true,
        useExtendedSearch: true,
    });
};

// Perform a fuzzy search with the searcher
export const performFuzzySearch = (searcher: Fuse<Rant>, query: string) => {
    if (!query.trim()) return [];

    return searcher.search(query);
};
