// Deprecated: Local fuzzy search is now replaced by Supabase full-text search.
// This file is kept for reference only. Remove Fuse.js from dependencies if not used elsewhere.

// import Fuse from 'fuse.js';
// import { Rant } from '@/lib/types/rant';

// export const createFuzzySearcher = (rants: Rant[]) => {
//     return new Fuse(rants, {
//         keys: ['content', 'userAlias'],
//         includeScore: true,
//         threshold: 0.4,
//         ignoreLocation: true,
//         useExtendedSearch: true,
//     });
// };

// export const performFuzzySearch = (searcher: Fuse<Rant>, query: string) => {
//     if (!query.trim()) return [];
//     return searcher.search(query);
// };
