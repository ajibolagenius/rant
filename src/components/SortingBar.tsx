import React, { useState, useRef, useEffect } from "react";
import { getMoodEmoji, getMoodLabel, getMoodColor, MoodType, allMoods } from "@/lib/utils/mood";
import {
    ChevronDownIcon,
    ClockIcon,
    StarIcon,
    MixerHorizontalIcon,
    MagnifyingGlassIcon,
    Cross1Icon
} from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import { useSearchSuggestions } from "@/hooks/useSearchSuggestions";
import { parseSearchQuery } from "@/utils/searchParser";
import SearchHelp from "@/components/SearchHelp";
import { useSearchParams, useLocation } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { colors } from "@/utils/colors";

type SortOption = "latest" | "popular" | "filter" | "search";

interface SortingBarProps {
    activeOption: SortOption;
    onOptionChange: (option: SortOption) => void;
    onFilterChange?: (moods: string[]) => void;
    onSearch?: (query: string, mood: MoodType | null) => void;
    selectedFilters?: string[];
    searchQuery?: string;
    searchMood?: MoodType | null;
    rants?: any[]; // For search suggestions
}

const SortingBar: React.FC<SortingBarProps> = ({
    activeOption,
    onOptionChange,
    onFilterChange,
    onSearch,
    selectedFilters = [],
    searchQuery = '',
    searchMood = null,
    rants = []
}) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
    const [localSearchMood, setLocalSearchMood] = useState<MoodType | null>(searchMood);
    const [showHistory, setShowHistory] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isMobileView, setIsMobileView] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchDropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // For URL syncing
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();
    const [isHashBasedRouting, setIsHashBasedRouting] = useState(
        window.location.hash.startsWith('#/')
    );

    // Use our custom hooks for search history and suggestions
    const { searchHistory, addToHistory, clearHistory } = useSearchHistory();
    const suggestions = useSearchSuggestions(rants);

    // Check for mobile view
    useEffect(() => {
        const checkMobileView = () => {
            setIsMobileView(window.innerWidth < 768);
        };

        // Initial check
        checkMobileView();

        // Check on resize
        window.addEventListener('resize', checkMobileView);

        return () => {
            window.removeEventListener('resize', checkMobileView);
        };
    }, []);

    // Define keyboard shortcuts for search functionality
    useKeyboardShortcuts([
        {
            key: "/",
            action: () => {
                // Focus search box
                handleSearchDropdownToggle();
                setTimeout(() => {
                    searchInputRef.current?.focus();
                }, 100);

                // Show toast notification
                toast({
                    title: "Search Activated",
                    description: "Type to search rants",
                    variant: "default",
                });
            },
            description: "Focus search box"
        },
        {
            key: "s",
            action: () => {
                // Activate search mode
                if (activeOption !== "search") {
                    handleSearchDropdownToggle();
                    setTimeout(() => {
                        searchInputRef.current?.focus();
                    }, 100);

                    // Show toast notification
                    toast({
                        title: "Search Mode",
                        description: "Search mode activated",
                        variant: "default",
                    });
                }
            },
            description: "Activate search mode"
        }
    ]);

    // Handle Escape key for clearing search (already implemented in handleKeyDown)
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAdvancedSearch();
        } else if (e.key === 'Escape') {
            clearSearch();
        }
    };

    // Update local state when props change
    useEffect(() => {
        setLocalSearchQuery(searchQuery);
        setLocalSearchMood(searchMood);
    }, [searchQuery, searchMood]);

    // Close all dropdowns when switching to Latest or Popular
    useEffect(() => {
        if (activeOption === "latest" || activeOption === "popular") {
            setIsDropdownOpen(false);
            setIsSearchOpen(false);
        }
    }, [activeOption]);

    // Check for URL parameter changes
    useEffect(() => {
        // Get parameters from either hash or search params
        const params = isHashBasedRouting
            ? new URLSearchParams(window.location.hash.split('?')[1] || '')
            : searchParams;

        // Get sort option from URL
        const sortParam = params.get('sort') as SortOption | null;

        // Get mood filters from URL
        const moodsParam = params.get('moods');
        const urlMoods = moodsParam ? moodsParam.split(',').filter(Boolean) : [];

        // Get search parameters from URL
        const urlQuery = params.get('q') || '';
        const urlMood = params.get('mood') as MoodType | null;

        // Update UI based on URL parameters
        if (sortParam && sortParam !== activeOption) {
            // Only update if different to avoid loops
            onOptionChange(sortParam);
        }

        // Update filter selection if in filter mode and different from current
        if (sortParam === 'filter' &&
            JSON.stringify(urlMoods.sort()) !== JSON.stringify([...selectedFilters].sort())) {
            if (onFilterChange) {
                onFilterChange(urlMoods);
            }
        }

        // Update search if in search mode and different from current
        if (sortParam === 'search' &&
            (urlQuery !== localSearchQuery || urlMood !== localSearchMood)) {
            setLocalSearchQuery(urlQuery);
            setLocalSearchMood(urlMood);
            if (onSearch) {
                onSearch(urlQuery, urlMood);
            }
        }
    }, [location.search, location.hash]);

    // Function to update URL parameters
    const updateUrlParams = (params: Record<string, string | null>) => {
        try {
            if (isHashBasedRouting) {
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
            } else {
                // For regular routing, use the provided setSearchParams function
                const currentParams = new URLSearchParams(searchParams.toString());

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
            }
        } catch (err) {
            console.error("Error updating URL parameters:", err);
        }
    };

    // Handle opening the filter dropdown
    const handleFilterDropdownToggle = () => {
        // Close search dropdown if open
        setIsSearchOpen(false);
        // Toggle filter dropdown
        setIsDropdownOpen(!isDropdownOpen);
        // If opening filter dropdown, switch to filter mode
        if (!isDropdownOpen && selectedFilters.length > 0) {
            onOptionChange("filter");
            updateUrlParams({ sort: "filter" });
        }
    };

    // Handle opening the search dropdown
    const handleSearchDropdownToggle = () => {
        // Close filter dropdown if open
        setIsDropdownOpen(false);
        // Toggle search dropdown
        setIsSearchOpen(!isSearchOpen);
        // If opening search dropdown, switch to search mode if there's a query or mood
        if (!isSearchOpen && (localSearchQuery || localSearchMood)) {
            onOptionChange("search");
            updateUrlParams({
                sort: "search",
                q: localSearchQuery || null,
                mood: localSearchMood || null
            });
        }
        // Focus the search input when opening
        if (!isSearchOpen) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        }
    };

    // Handle clicking Latest button
    const handleLatestClick = () => {
        setIsDropdownOpen(false);
        setIsSearchOpen(false);
        onOptionChange("latest");
        updateUrlParams({
            sort: null, // Use null to remove the sort param for default sort
            q: null,
            mood: null,
            moods: null
        });
    };

    // Handle clicking Popular button
    const handlePopularClick = () => {
        setIsDropdownOpen(false);
        setIsSearchOpen(false);
        onOptionChange("popular");
        updateUrlParams({
            sort: "popular",
            q: null,
            mood: null,
            moods: null
        });
    };

    // Handle mood filter selection with keyboard shortcut support
    const handleFilterSelect = (mood: string, isKeyboardShortcut = false) => {
        if (onFilterChange) {
            // Toggle mood selection
            const newFilters = selectedFilters.includes(mood)
                ? selectedFilters.filter(m => m !== mood)
                : [...selectedFilters, mood];

            onFilterChange(newFilters);

            // Only set to filter mode if we have filters selected
            if (newFilters.length > 0) {
                onOptionChange("filter");
                updateUrlParams({
                    sort: "filter",
                    moods: newFilters.join(',')
                });
            } else if (activeOption === "filter") {
                // If we cleared all filters and were in filter mode, switch to latest
                onOptionChange("latest");
                updateUrlParams({
                    sort: null,
                    moods: null
                });
            }

            // Show toast notification if triggered by keyboard shortcut
            if (isKeyboardShortcut) {
                const isSelected = !selectedFilters.includes(mood);
                toast({
                    title: `Mood Filter: ${getMoodLabel(mood as MoodType)}`,
                    description: isSelected
                        ? `Added ${getMoodLabel(mood as MoodType)} filter`
                        : `Removed ${getMoodLabel(mood as MoodType)} filter`,
                    variant: "default",
                });
            }
        }
    };

    // Clear all filters
    const clearAllFilters = () => {
        if (onFilterChange) {
            onFilterChange([]);
            // If we were in filter mode, switch to latest
            if (activeOption === "filter") {
                onOptionChange("latest");
                updateUrlParams({
                    sort: null,
                    moods: null
                });
            }
        }
        setIsDropdownOpen(false);
    };

    // Handle search mood selection
    const handleSearchMoodSelect = (mood: MoodType) => {
        const newMood = localSearchMood === mood ? null : mood;
        setLocalSearchMood(newMood);
        // Real-time search update
        if (onSearch) {
            onSearch(localSearchQuery, newMood);
            if (localSearchQuery || newMood) {
                onOptionChange("search");
                updateUrlParams({
                    sort: "search",
                    q: localSearchQuery || null,
                    mood: newMood || null
                });
            } else {
                onOptionChange("latest");
                updateUrlParams({
                    sort: null,
                    q: null,
                    mood: null
                });
            }
        }
    };

    // Handle search input change - real-time search
    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setLocalSearchQuery(query);
        // Real-time search update
        if (onSearch) {
            onSearch(query, localSearchMood);
            if (query || localSearchMood) {
                onOptionChange("search");
                updateUrlParams({
                    sort: "search",
                    q: query || null,
                    mood: localSearchMood || null
                });
            } else if (activeOption === "search") {
                onOptionChange("latest");
                updateUrlParams({
                    sort: null,
                    q: null,
                    mood: null
                });
            }
        }
    };

    // Clear search
    const clearSearch = () => {
        setLocalSearchQuery('');
        setLocalSearchMood(null);
        if (onSearch) {
            onSearch('', null);
            if (activeOption === "search") {
                onOptionChange("latest");
                updateUrlParams({
                    sort: null,
                    q: null,
                    mood: null
                });
            }
        }
        // Focus the search input after clearing
        searchInputRef.current?.focus();
    };

    // Handle advanced search submission
    const handleAdvancedSearch = () => {
        if (!localSearchQuery.trim()) return;

        // Parse the search query for advanced operators
        const parsed = parseSearchQuery(localSearchQuery);

        // Update local mood state if a mood was specified in the query
        if (parsed.mood) {
            setLocalSearchMood(parsed.mood);
        }

        // Add to search history
        addToHistory(localSearchQuery, parsed.mood || localSearchMood);

        // Call the parent's search handler
        if (onSearch) {
            onSearch(
                // If there are exact phrases, include them in the search
                parsed.exactPhrases.length
                    ? `${parsed.text} ${parsed.exactPhrases.map(p => `"${p}"`).join(' ')}`
                    : parsed.text,
                parsed.mood || localSearchMood
            );

            // Update URL parameters
            updateUrlParams({
                sort: "search",
                q: parsed.text || null,
                mood: (parsed.mood || localSearchMood) || null
            });
        }

        // Keep the search dropdown open for UX consistency
    };

    // Handle history item click
    const handleHistoryItemClick = (item: { query: string; mood: MoodType | null }) => {
        setLocalSearchQuery(item.query);
        setLocalSearchMood(item.mood);

        if (onSearch) {
            onSearch(item.query, item.mood);
            if (item.query || item.mood) {
                onOptionChange("search");
                updateUrlParams({
                    sort: "search",
                    q: item.query || null,
                    mood: item.mood || null
                });
            }
        }
    };

    // Handle suggestion click
    const handleSuggestionClick = (suggestion: string) => {
        setLocalSearchQuery(suggestion);

        if (onSearch) {
            onSearch(suggestion, localSearchMood);
            onOptionChange("search");
            updateUrlParams({
                sort: "search",
                q: suggestion || null,
                mood: localSearchMood || null
            });
        }
    };

    // Handle input focus to show history or suggestions
    const handleInputFocus = () => {
        // Show history when input is focused and there's history
        if (searchHistory.length > 0) {
            setShowHistory(true);
            setShowSuggestions(false);
        }
        // Show suggestions when input is focused and there are suggestions
        else if (suggestions.length > 0) {
            setShowSuggestions(true);
            setShowHistory(false);
        }
    };

    // Setup keyboard shortcuts for mood selection
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Only process if Shift key is pressed
            if (e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
                let targetMood: MoodType | null = null;

                // Map keys to moods
                switch (e.key.toLowerCase()) {
                    case 'h': targetMood = 'happy'; break;
                    case 's': targetMood = 'sad'; break;
                    case 'a': targetMood = 'angry'; break;
                    case 'c': targetMood = 'confused'; break;
                    case 'l': targetMood = 'loved'; break;
                    case 't': targetMood = 'tired'; break;
                    case 'n': targetMood = 'neutral'; break;
                    case 'm': targetMood = 'smiling'; break;
                }

                // If a valid mood key was pressed
                if (targetMood) {
                    e.preventDefault();
                    handleFilterSelect(targetMood, true);
                }
            }

            // Clear all filters with Escape key
            if (e.key === 'Escape' && !e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
                // Only clear if no dropdown is focused
                if (!isDropdownOpen && !isSearchOpen) {
                    clearAllFilters();
                    toast({
                        title: "Filters Cleared",
                        description: "All mood filters have been reset",
                        variant: "default",
                    });
                }
            }
        };

        // Add event listener
        window.addEventListener('keydown', handleKeyDown);

        // Clean up
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedFilters, isDropdownOpen, isSearchOpen]);

    // Render mobile view
    if (isMobileView) {
        return (
            <div className="flex flex-col mt-8 mb-4 px-2">
                <div id="rant-section" className="mb-4"></div>

                {/* Section Title - Mobile */}
                <h2 className="text-xl font-bold font-heading text-text-strong mb-4">
                    {activeOption === "search"
                        ? "Search Results 🔍"
                        : activeOption === "popular"
                            ? "Trending Rants ✨"
                            : "Hottest Rants 🔥"}
                </h2>

                {/* Mobile Navigation */}
                <div className="flex flex-wrap gap-2 mb-4">
                    <Button
                        onClick={handleSearchDropdownToggle}
                        variant="outline"
                        size="sm"
                        className={`border-border-subtle bg-background-secondary hover:bg-background-secondary/80 text-text-strong rounded-full flex-1 px-3 py-2 flex items-center gap-1 justify-center ${activeOption === "search" ? "ring-2 ring-accent-teal" : ""}`}
                    >
                        <MagnifyingGlassIcon className="h-3 w-3" />
                        <span className="text-xs font-ui">Search</span>
                    </Button>

                    <Button
                        onClick={handleLatestClick}
                        variant="outline"
                        size="sm"
                        className={`border-border-subtle bg-background-secondary hover:bg-background-secondary/80 text-text-strong rounded-full flex-1 px-3 py-2 flex items-center gap-1 justify-center ${activeOption === "latest" ? "ring-2 ring-accent-teal" : ""}`}
                    >
                        <ClockIcon className="h-3 w-3" />
                        <span className="text-xs font-ui">Latest</span>
                    </Button>

                    <Button
                        onClick={handlePopularClick}
                        variant="outline"
                        size="sm"
                        className={`border-border-subtle bg-background-secondary hover:bg-background-secondary/80 text-text-strong rounded-full flex-1 px-3 py-2 flex items-center gap-1 justify-center ${activeOption === "popular" ? "ring-2 ring-accent-teal" : ""}`}
                    >
                        <StarIcon className="h-3 w-3" />
                        <span className="text-xs font-ui">Popular</span>
                    </Button>

                    <Button
                        onClick={handleFilterDropdownToggle}
                        variant="outline"
                        size="sm"
                        className={`border-border-subtle bg-background-secondary hover:bg-background-secondary/80 text-text-strong rounded-full flex-1 px-3 py-2 flex items-center gap-1 justify-center ${activeOption === "filter" && selectedFilters.length > 0 ? "ring-2 ring-accent-teal" : ""}`}
                    >
                        <MixerHorizontalIcon className="h-3 w-3" />
                        <span className="text-xs font-ui">Filter</span>
                        {selectedFilters.length > 0 && (
                            <span className="inline-flex items-center justify-center w-4 h-4 ml-1 text-[10px] font-medium text-background-dark bg-accent-teal rounded-full">
                                {selectedFilters.length}
                            </span>
                        )}
                    </Button>
                </div>

                {/* Search Dropdown - Mobile */}
                <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isSearchOpen ? 'opacity-100' : 'opacity-0 h-0'}`}
                    style={{ height: isSearchOpen ? 'auto' : 0, marginBottom: isSearchOpen ? '1rem' : 0 }}
                >
                    <div
                        ref={searchDropdownRef}
                        className="bg-background-secondary border border-border-subtle rounded-lg p-4 shadow-medium w-full"
                    >
                        <div className="space-y-4">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MagnifyingGlassIcon className="h-4 w-4 text-text-muted" />
                                </div>
                                <Input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Search rants..."
                                    value={localSearchQuery}
                                    onChange={handleSearchInputChange}
                                    onFocus={handleInputFocus}
                                    onKeyDown={handleKeyDown}
                                    className="pl-10 pr-10 bg-background-secondary border-border-subtle text-text-primary font-body"
                                />
                                {localSearchQuery && (
                                    <button
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-strong"
                                        onClick={clearSearch}
                                    >
                                        <Cross1Icon className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            {/* Search history - Mobile */}
                            {showHistory && searchHistory.length > 0 && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-medium font-ui text-text-muted">Recent searches:</h4>
                                        <button
                                            onClick={clearHistory}
                                            className="text-xs text-text-muted hover:text-text-strong font-ui"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {searchHistory.slice(0, 3).map((item, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleHistoryItemClick(item)}
                                                className="inline-flex items-center gap-2 px-2 py-1 text-xs rounded-full
                                                    bg-background-secondary border border-border-subtle hover:bg-background-secondary/80 text-text-muted font-ui"
                                            >
                                                <MagnifyingGlassIcon className="h-3 w-3 text-text-muted" />
                                                {item.query.length > 12 ? item.query.substring(0, 10) + "..." : item.query}
                                                {item.mood && (
                                                    <img
                                                        src={getMoodEmoji(item.mood)}
                                                        alt={getMoodLabel(item.mood)}
                                                        className="w-3 h-3 ml-1"
                                                    />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Mood filter buttons - Mobile */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-medium font-ui text-text-muted">Filter by mood:</h4>
                                <div className="grid grid-cols-3 gap-2">
                                    {allMoods.slice(0, 9).map((mood) => (
                                        <button
                                            key={mood}
                                            type="button"
                                            onClick={() => handleSearchMoodSelect(mood)}
                                            className={`
                                                inline-flex items-center gap-1 px-2 py-1 text-[10px] font-ui
                                                rounded-full transition-all duration-200
                                                ${localSearchMood === mood
                                                    ? 'bg-background-secondary border border-accent-teal text-text-strong font-medium'
                                                    : 'bg-background-secondary border border-border-subtle hover:bg-background-secondary/80 text-text-muted'}
                                            `}
                                        >
                                            <img
                                                src={getMoodEmoji(mood)}
                                                alt={getMoodLabel(mood)}
                                                className="w-3 h-3"
                                            />
                                            <span className="truncate">{getMoodLabel(mood)}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Dropdown - Mobile */}
                <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isDropdownOpen ? 'opacity-100' : 'opacity-0 h-0'}`}
                    style={{ height: isDropdownOpen ? 'auto' : 0, marginBottom: isDropdownOpen ? '1rem' : 0 }}
                >
                    <div
                        ref={dropdownRef}
                        className="bg-background-secondary border border-border-subtle rounded-lg p-4 shadow-medium w-full"
                    >
                        <h3 className="text-sm font-medium font-heading text-text-strong mb-3">Filter by Mood</h3>
                        {/* Mood Options - Mobile */}
                        <div className="mb-4 grid grid-cols-3 gap-2">
                            {allMoods.slice(0, 12).map((mood) => (
                                <button
                                    key={mood}
                                    type="button"
                                    onClick={() => handleFilterSelect(mood)}
                                    className={`
                                        inline-flex items-center gap-1 px-2 py-1 text-[10px] font-ui
                                        rounded-full transition-all duration-200
                                        ${selectedFilters.includes(mood)
                                            ? 'bg-background-secondary border border-accent-teal text-text-strong font-medium'
                                            : 'bg-background-secondary border border-border-subtle hover:bg-background-secondary/80 text-text-muted'}
                                    `}
                                >
                                    <img
                                        src={getMoodEmoji(mood)}
                                        alt={getMoodLabel(mood)}
                                        className="w-3 h-3"
                                    />
                                    <span className="truncate">{getMoodLabel(mood)}</span>
                                </button>
                            ))}
                        </div>

                        {/* Clear Filter - Mobile */}
                        {selectedFilters.length > 0 && (
                            <button
                                onClick={clearAllFilters}
                                className="w-full inline-flex items-center justify-center gap-2 px-2 py-1 text-xs rounded-full
                                           bg-background-secondary border border-error/30 hover:bg-background-secondary/80 text-error font-ui"
                            >
                                <Cross1Icon className="w-3 h-3" />
                                Clear All Filters
                            </button>
                        )}
                    </div>
                </div>

                {/* Selected Filters Display - Mobile */}
                {selectedFilters.length > 0 && activeOption === "filter" && !isDropdownOpen && (
                    <div className="text-xs text-text-muted flex flex-wrap gap-2 mb-4 font-ui">
                        <span>Filters:</span>
                        <div className="flex flex-wrap gap-1">
                            {selectedFilters.slice(0, 3).map(mood => (
                                <span key={mood} className="inline-flex items-center gap-1 bg-background-secondary border border-border-subtle px-1 py-0.5 rounded-full">
                                    <img
                                        src={getMoodEmoji(mood as MoodType)}
                                        alt={getMoodLabel(mood as MoodType)}
                                        className="w-3 h-3 object-cover"
                                    />
                                    <span className="truncate max-w-[60px]">{getMoodLabel(mood as MoodType)}</span>
                                    <button
                                        onClick={() => handleFilterSelect(mood)}
                                        className="ml-1 text-text-muted hover:text-text-strong"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                            {selectedFilters.length > 3 && (
                                <span className="inline-flex items-center gap-1 bg-background-secondary border border-border-subtle px-1 py-0.5 rounded-full">
                                    +{selectedFilters.length - 3} more
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Active Search Query - Mobile */}
                {activeOption === "search" && (searchQuery || searchMood) && !isSearchOpen && (
                    <div className="text-xs text-text-muted flex flex-wrap gap-2 mb-4 font-ui">
                        <span>Searching:</span>
                        <div className="flex flex-wrap gap-1">
                            {searchQuery && (
                                <span className="inline-flex items-center gap-1 bg-background-secondary border border-border-subtle px-1 py-0.5 rounded-full">
                                    <MagnifyingGlassIcon className="w-3 h-3" />
                                    {searchQuery.length > 15 ? `"${searchQuery.substring(0, 12)}..."` : `"${searchQuery}"`}
                                </span>
                            )}
                            {searchMood && (
                                <span className="inline-flex items-center gap-1 bg-background-secondary border border-border-subtle px-1 py-0.5 rounded-full">
                                    <img
                                        src={getMoodEmoji(searchMood)}
                                        alt={getMoodLabel(searchMood)}
                                        className="w-3 h-3 object-cover"
                                    />
                                    <span className="truncate max-w-[60px]">{getMoodLabel(searchMood)}</span>
                                </span>
                            )}
                            <button
                                onClick={clearSearch}
                                className="inline-flex items-center gap-1 bg-background-secondary border border-error/30 px-1 py-0.5 rounded-full text-error"
                            >
                                <Cross1Icon className="w-3 h-3" />
                                Clear
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Desktop view (original layout with minor improvements)
    return (
        <div className="flex flex-col mt-10 mb-5 px-4">
            <div id="rant-section" className="mb-4"></div>
            <div className="flex items-center justify-between mb-4">
                {/* Section Title */}
                <h2 className="text-xl font-bold font-heading text-text-strong">
                    {activeOption === "search"
                        ? "Search Results 🔍"
                        : activeOption === "popular"
                            ? "Trending Rants ✨"
                            : "Hottest Rants 🔥"}
                </h2>
                {/* Buttons Section */}
                <div className="flex gap-4 items-center">
                    {/* Search Button */}
                    <Button
                        onClick={handleSearchDropdownToggle}
                        variant="outline"
                        className={`border-border-subtle bg-background-secondary hover:bg-background-secondary/80 text-text-strong rounded-full px-6 py-2 flex items-center gap-2 font-ui ${activeOption === "search" ? "ring-2 ring-accent-teal" : ""}`}
                    >
                        <MagnifyingGlassIcon className="mr-1 h-4 w-4" />
                        <span>Search</span>
                        <ChevronDownIcon className={`transition-transform ${isSearchOpen ? 'rotate-180' : ''}`} />
                    </Button>
                    {/* Latest & Popular buttons */}
                    <Button
                        onClick={handleLatestClick}
                        variant="outline"
                        className={`border-border-subtle bg-background-secondary hover:bg-background-secondary/80 text-text-strong rounded-full px-6 py-2 font-ui ${activeOption === "latest" ? "ring-2 ring-accent-teal" : ""
                            }`}
                    >
                        <ClockIcon className="mr-2 h-4 w-4" />
                        Latest
                    </Button>
                    <Button
                        onClick={handlePopularClick}
                        variant="outline"
                        className={`border-border-subtle bg-background-secondary hover:bg-background-secondary/80 text-text-strong rounded-full px-6 py-2 font-ui ${activeOption === "popular" ? "ring-2 ring-accent-teal" : ""
                            }`}
                    >
                        <StarIcon className="mr-2 h-4 w-4" />
                        Popular
                    </Button>
                    {/* Filter button */}
                    <Button
                        onClick={handleFilterDropdownToggle}
                        variant="outline"
                        className={`border-border-subtle bg-background-secondary hover:bg-background-secondary/80 text-text-strong rounded-full px-6 py-2 flex items-center gap-2 font-ui ${activeOption === "filter" && selectedFilters.length > 0 ? "ring-2 ring-accent-teal" : ""
                            }`}
                    >
                        <MixerHorizontalIcon className="mr-1 h-4 w-4" />
                        <span>Filter</span>
                        {selectedFilters.length > 0 && (
                            <span className="inline-flex items-center justify-center w-5 h-5 ml-1 text-xs font-medium text-background-dark bg-accent-teal rounded-full">
                                {selectedFilters.length}
                            </span>
                        )}
                        <ChevronDownIcon className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </Button>
                </div>
            </div>
            {/* Search Dropdown */}
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isSearchOpen ? 'opacity-100' : 'opacity-0 h-0'}`}
                style={{ height: isSearchOpen ? 'auto' : 0, marginBottom: isSearchOpen ? '1rem' : 0 }}
            >
                <div
                    ref={searchDropdownRef}
                    className="bg-background-secondary border border-border-subtle rounded-lg p-4 shadow-medium w-full"
                >
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium font-heading text-text-strong">Search Rants</h3>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="h-4 w-4 text-text-muted" />
                            </div>
                            <Input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Type to search rants..."
                                value={localSearchQuery}
                                onChange={handleSearchInputChange}
                                onFocus={handleInputFocus}
                                onKeyDown={handleKeyDown}
                                className="pl-10 pr-10 bg-background-secondary border-border-subtle text-text-primary font-body"
                            />
                            {localSearchQuery && (
                                <button
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-strong"
                                    onClick={clearSearch}
                                >
                                    <Cross1Icon className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        {/* Search history */}
                        {showHistory && searchHistory.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-medium font-ui text-text-muted">Recent searches:</h4>
                                    <button
                                        onClick={clearHistory}
                                        className="text-xs text-text-muted hover:text-text-strong font-ui"
                                    >
                                        Clear
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {searchHistory.slice(0, 5).map((item, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleHistoryItemClick(item)}
                                            className="inline-flex items-center gap-2 px-2 py-1 text-xs rounded-full
                                                bg-background-secondary border border-border-subtle hover:bg-background-secondary/80 text-text-muted font-ui"
                                        >
                                            <MagnifyingGlassIcon className="h-3 w-3 text-text-muted" />
                                            {item.query}
                                            {item.mood && (
                                                <img
                                                    src={getMoodEmoji(item.mood)}
                                                    alt={getMoodLabel(item.mood)}
                                                    className="w-3 h-3 ml-1"
                                                />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Search suggestions */}
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium font-ui text-text-muted">Suggestions:</h4>
                                <div className="flex flex-wrap gap-2">
                                    {suggestions.map((suggestion, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSuggestionClick(suggestion)}
                                            className="inline-flex items-center gap-2 px-2 py-1 text-xs rounded-full
                                                bg-background-secondary border border-border-subtle hover:bg-background-secondary/80 text-text-muted font-ui"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <h4 className="text-sm font-medium font-ui text-text-muted">Filter by mood:</h4>
                            <div className="flex flex-wrap gap-2">
                                {allMoods.map((mood) => (
                                    <button
                                        key={mood}
                                        type="button"
                                        onClick={() => handleSearchMoodSelect(mood)}
                                        className={`
                                            inline-flex items-center gap-2 px-2 py-1 text-xs font-ui
                                            rounded-full transition-all duration-200
                                            ${localSearchMood === mood
                                                ? 'bg-background-secondary border border-accent-teal text-text-strong font-medium'
                                                : 'bg-background-secondary border border-border-subtle hover:bg-background-secondary/80 text-text-muted'}
                                        `}
                                    >
                                        <img
                                            src={getMoodEmoji(mood)}
                                            alt={getMoodLabel(mood)}
                                            className="w-4 h-4"
                                        />
                                        {getMoodLabel(mood)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Display active search query inside the search panel */}
                        {(localSearchQuery || localSearchMood) && (
                            <div className="text-sm text-text-muted pt-2 border-t border-border-subtle font-ui">
                                <p className="mb-2">Current search:</p>
                                <div className="flex flex-wrap gap-2">
                                    {localSearchQuery && (
                                        <span className="inline-flex items-center gap-2 bg-background-secondary border border-border-subtle px-2 py-1 rounded-full">
                                            <MagnifyingGlassIcon className="w-4 h-4" />
                                            "{localSearchQuery}"
                                        </span>
                                    )}
                                    {localSearchMood && (
                                        <span className="inline-flex items-center gap-2 bg-background-secondary border border-border-subtle px-2 py-1 rounded-full">
                                            <img
                                                src={getMoodEmoji(localSearchMood)}
                                                alt={getMoodLabel(localSearchMood)}
                                                className="w-4 h-4 object-cover"
                                            />
                                            {getMoodLabel(localSearchMood)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Advanced search help */}
                        <div className="text-xs text-text-muted pt-2 border-t border-border-subtle flex items-center justify-between font-ui">
                            <p className="mt-1">
                                For filter and search tips: Use <kbd className="px-1 py-0.5 bg-background-dark rounded">Shift + ?</kbd> to view the shortcuts and tip guide.
                            </p>
                            <SearchHelp />
                        </div>
                    </div>
                </div>
            </div>
            {/* Filter Dropdown */}
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isDropdownOpen ? 'opacity-100' : 'opacity-0 h-0'}`}
                style={{ height: isDropdownOpen ? 'auto' : 0, marginBottom: isDropdownOpen ? '1rem' : 0 }}
            >
                <div
                    ref={dropdownRef}
                    className="bg-background-secondary border border-border-subtle rounded-lg p-4 shadow-medium w-full"
                >
                    <h3 className="text-lg font-medium font-heading text-text-strong mb-3">Filter by Mood</h3>
                    {/* Mood Options - Using smaller rounded pills like search */}
                    <div className="mb-4 flex flex-wrap gap-2">
                        {allMoods.map((mood) => (
                            <button
                                key={mood}
                                type="button"
                                onClick={() => handleFilterSelect(mood)}
                                className={`
                                    inline-flex items-center gap-2 px-2 py-1 text-xs font-ui
                                    rounded-full transition-all duration-200
                                    ${selectedFilters.includes(mood)
                                        ? 'bg-background-secondary border border-accent-teal text-text-strong font-medium'
                                        : 'bg-background-secondary border border-border-subtle hover:bg-background-secondary/80 text-text-muted'}
                                `}
                            >
                                <img
                                    src={getMoodEmoji(mood)}
                                    alt={getMoodLabel(mood)}
                                    className="w-4 h-4"
                                />
                                {getMoodLabel(mood)}
                            </button>
                        ))}
                        {/* Clear Filter Option */}
                        {selectedFilters.length > 0 && (
                            <button
                                onClick={clearAllFilters}
                                className="inline-flex items-center gap-2 px-2 py-1 text-xs rounded-full
                                           bg-background-secondary border border-error/30 hover:bg-background-secondary/80 text-error font-ui"
                            >
                                <Cross1Icon className="w-3 h-3" />
                                Clear All
                            </button>
                        )}
                    </div>

                    {/* Keyboard shortcut hint */}
                    <div className="text-xs text-text-muted pt-2 border-t border-border-subtle flex items-center justify-between font-ui">
                        <p className="mt-1">
                            For filter and search tips: Use <kbd className="px-1 py-0.5 bg-background-dark rounded">Shift + ?</kbd> to view the shortcuts and tip guide.
                        </p>
                        <SearchHelp />
                    </div>

                    {/* Display selected filters inside the filter panel */}
                    {selectedFilters.length > 0 && (
                        <div className="text-sm text-text-muted pt-2 border-t border-border-subtle font-ui">
                            <p className="mb-2">Active filters:</p>
                            <div className="flex flex-wrap gap-2">
                                {selectedFilters.map(mood => (
                                    <span key={mood} className="inline-flex items-center gap-2 bg-background-secondary border border-border-subtle px-2 py-1 rounded-full">
                                        <img
                                            src={getMoodEmoji(mood as MoodType)}
                                            alt={getMoodLabel(mood as MoodType)}
                                            className="w-4 h-4 object-cover"
                                        />
                                        {getMoodLabel(mood as MoodType)}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleFilterSelect(mood);
                                            }}
                                            className="ml-1 text-text-muted hover:text-text-strong"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* Displaying Selected Filters outside the dropdown (only when dropdown is closed) */}
            {selectedFilters.length > 0 && activeOption === "filter" && !isDropdownOpen && (
                <div className="text-sm text-text-muted flex flex-wrap gap-2 mb-4 font-ui">
                    <span>Active filters:</span>
                    {selectedFilters.map(mood => (
                        <span key={mood} className="inline-flex items-center gap-2 bg-background-secondary border border-border-subtle px-2 py-1 rounded-full">
                            <img
                                src={getMoodEmoji(mood as MoodType)}
                                alt={getMoodLabel(mood as MoodType)}
                                className="w-4 h-4 object-cover"
                            />
                            {getMoodLabel(mood as MoodType)}
                            <button
                                onClick={() => handleFilterSelect(mood)}
                                className="ml-1 text-text-muted hover:text-text-strong"
                            >
                                ×
                            </button>
                        </span>
                    ))}
                    <button
                        onClick={clearAllFilters}
                        className="inline-flex items-center gap-2 px-2 py-1 text-xs rounded-full
                                   bg-background-secondary border border-error/30 hover:bg-background-secondary/80 text-error font-ui"
                    >
                        <Cross1Icon className="w-3 h-3" />
                        Clear All
                    </button>
                </div>
            )}
            {/* Display active search query outside the dropdown (only when dropdown is closed) */}
            {activeOption === "search" && (searchQuery || searchMood) && !isSearchOpen && (
                <div className="text-sm text-text-muted flex flex-wrap gap-2 mb-4 font-ui">
                    <span>Searching for:</span>
                    {searchQuery && (
                        <span className="inline-flex items-center gap-2 bg-background-secondary border border-border-subtle px-2 py-1 rounded-full">
                            <MagnifyingGlassIcon className="w-4 h-4" />
                            "{searchQuery}"
                            <button
                                onClick={clearSearch}
                                className="ml-1 text-text-muted hover:text-text-strong"
                            >
                                ×
                            </button>
                        </span>
                    )}
                    {searchMood && (
                        <span className="inline-flex items-center gap-2 bg-background-secondary border border-border-subtle px-2 py-1 rounded-full">
                            <img
                                src={getMoodEmoji(searchMood)}
                                alt={getMoodLabel(searchMood)}
                                className="w-4 h-4 object-cover"
                            />
                            {getMoodLabel(searchMood)}
                            <button
                                onClick={clearSearch}
                                className="ml-1 text-text-muted hover:text-text-strong"
                            >
                                ×
                            </button>
                        </span>
                    )}
                </div>
            )}

            {/* URL Sync Status Indicator - only show in development */}
            {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-text-muted mt-2 font-ui">
                    <span>URL Sync: {isHashBasedRouting ? 'Hash-based (#/)' : 'Regular'}</span>
                    {isHashBasedRouting && (
                        <button
                            onClick={() => {
                                localStorage.removeItem('useHashRouter');
                                window.location.href = window.location.origin + window.location.pathname;
                            }}
                            className="ml-2 underline hover:text-text-strong"
                        >
                            Switch to regular routing
                        </button>
                    )}
                    {!isHashBasedRouting && (
                        <button
                            onClick={() => {
                                localStorage.setItem('useHashRouter', 'true');
                                // Preserve current URL parameters when switching
                                const currentParams = new URLSearchParams(window.location.search);
                                const paramString = currentParams.toString();
                                window.location.href = `${window.location.origin}${window.location.pathname}#/${paramString ? '?' + paramString : ''}`;
                            }}
                            className="ml-2 underline hover:text-text-strong"
                        >
                            Switch to hash-based routing
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default SortingBar;
