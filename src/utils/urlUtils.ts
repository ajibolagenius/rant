import { MoodType } from '@/lib/utils/mood';

/**
 * Utility functions for URL parameter management and hash-based routing
 */

// Check if the app is using hash-based routing
export const isHashBasedRouting = (): boolean => {
    return window.location.hash.startsWith('#/');
};

// Get URL parameters from either hash or search params
export const getUrlParams = (): URLSearchParams => {
    if (isHashBasedRouting()) {
        const hashParts = window.location.hash.split('?');
        return new URLSearchParams(hashParts[1] || '');
    } else {
        return new URLSearchParams(window.location.search);
    }
};

// Update URL parameters without reloading the page
export const updateUrlParams = (
    params: Record<string, string | null>,
    setSearchParams?: (params: URLSearchParams, options?: { replace?: boolean }) => void
): void => {
    try {
        if (isHashBasedRouting()) {
            // For hash-based routing, manually update the hash
            const hashParts = window.location.hash.split('?');
            const basePath = hashParts[0] || '#/';
            const currentParams = new URLSearchParams(hashParts[1] || '');

            // Update parameters
            Object.entries(params).forEach(([key, value]) => {
                if (value === null || value === '') {
                    currentParams.delete(key);
                } else {
                    currentParams.set(key, value);
                }
            });

            // Create new hash URL
            const paramString = currentParams.toString();
            const newHash = `${basePath}${paramString ? '?' + paramString : ''}`;

            // Update URL without reloading
            window.history.replaceState(null, '', newHash);
        } else if (setSearchParams) {
            // For regular routing, use the provided setSearchParams function
            const currentParams = new URLSearchParams(window.location.search);

            // Update parameters
            Object.entries(params).forEach(([key, value]) => {
                if (value === null || value === '') {
                    currentParams.delete(key);
                } else {
                    currentParams.set(key, value);
                }
            });

            // Update URL using React Router's setSearchParams
            setSearchParams(currentParams, { replace: true });
        } else {
            // Fallback for when setSearchParams is not available
            const url = new URL(window.location.href);

            // Update parameters
            Object.entries(params).forEach(([key, value]) => {
                if (value === null || value === '') {
                    url.searchParams.delete(key);
                } else {
                    url.searchParams.set(key, value);
                }
            });

            // Update URL without reloading
            window.history.replaceState(null, '', url.toString());
        }
    } catch (err) {
        console.error("Error updating URL parameters:", err);
    }
};

// Parse mood filters from URL parameters
export const parseMoodFilters = (params: URLSearchParams): string[] => {
    const moodsParam = params.get('moods');

    // Handle the edge case where moods= exists but has no value
    if (moodsParam === '') {
        return [];
    }

    return moodsParam ? moodsParam.split(',').filter(Boolean) : [];
};

// Parse search parameters from URL
export const parseSearchParams = (params: URLSearchParams): {
    query: string;
    mood: MoodType | null;
} => {
    return {
        query: params.get('q') || '',
        mood: params.get('mood') as MoodType | null
    };
};

// Get sort option from URL parameters
export const getSortOption = (params: URLSearchParams): string => {
    return params.get('sort') || 'latest';
};

// Create a shareable URL for the current view
export const createShareableUrl = (): string => {
    // Get the base URL without hash
    const baseUrl = window.location.href.split('#')[0];

    if (isHashBasedRouting()) {
        // For hash-based routing, include the hash in the shareable URL
        return window.location.href;
    } else {
        // For regular routing, use the current URL
        return window.location.href;
    }
};

// Switch to hash-based routing
export const switchToHashRouter = (): void => {
    localStorage.setItem('useHashRouter', 'true');

    // Preserve current URL parameters when switching
    const currentParams = new URLSearchParams(window.location.search);
    const paramString = currentParams.toString();

    // Redirect to hash-based URL
    window.location.href = `${window.location.origin}${window.location.pathname}#/${paramString ? '?' + paramString : ''}`;
};

// Switch to regular routing
export const switchToRegularRouter = (): void => {
    localStorage.removeItem('useHashRouter');

    // Preserve current URL parameters when switching
    const hashParts = window.location.hash.split('?');
    const paramString = hashParts[1] || '';

    // Redirect to regular URL
    window.location.href = `${window.location.origin}${window.location.pathname}${paramString ? '?' + paramString : ''}`;
};
