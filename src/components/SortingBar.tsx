import React, { useState, useRef, useEffect } from "react";
import { getMoodEmoji, getMoodLabel, getMoodColor, MoodType } from "@/lib/utils/mood";
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

type SortOption = "latest" | "popular" | "filter" | "search";

interface SortingBarProps {
    activeOption: SortOption;
    onOptionChange: (option: SortOption) => void;
    onFilterChange?: (moods: string[]) => void;
    onSearch?: (query: string, mood: MoodType | null) => void;
    selectedFilters?: string[];
    searchQuery?: string;
    searchMood?: MoodType | null;
}

const SortingBar: React.FC<SortingBarProps> = ({
    activeOption,
    onOptionChange,
    onFilterChange,
    onSearch,
    selectedFilters = [],
    searchQuery = '',
    searchMood = null
}) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
    const [localSearchMood, setLocalSearchMood] = useState<MoodType | null>(searchMood);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchDropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // List of all moods
    const moods: MoodType[] = [
        'sad', 'crying', 'angry', 'eyeRoll', 'heartbroken',
        'mindBlown', 'speechless', 'confused', 'tired', 'nervous',
        'smiling', 'laughing', 'celebratory', 'confident', 'loved'
    ];

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

    // Handle opening the filter dropdown
    const handleFilterDropdownToggle = () => {
        // Close search dropdown if open
        setIsSearchOpen(false);

        // Toggle filter dropdown
        setIsDropdownOpen(!isDropdownOpen);

        // If opening filter dropdown, switch to filter mode
        if (!isDropdownOpen && selectedFilters.length > 0) {
            onOptionChange("filter");
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
    };

    // Handle clicking Popular button
    const handlePopularClick = () => {
        setIsDropdownOpen(false);
        setIsSearchOpen(false);
        onOptionChange("popular");
    };

    // Handle mood filter selection
    const handleFilterSelect = (mood: string) => {
        if (onFilterChange) {
            // Toggle mood selection
            const newFilters = selectedFilters.includes(mood)
                ? selectedFilters.filter(m => m !== mood)
                : [...selectedFilters, mood];

            onFilterChange(newFilters);

            // Only set to filter mode if we have filters selected
            if (newFilters.length > 0) {
                onOptionChange("filter");
            } else if (activeOption === "filter") {
                // If we cleared all filters and were in filter mode, switch to latest
                onOptionChange("latest");
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
            } else {
                onOptionChange("latest");
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
            } else if (activeOption === "search") {
                onOptionChange("latest");
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
            }
        }

        // Focus the search input after clearing
        searchInputRef.current?.focus();
    };

    return (
        <div className="flex flex-col mt-10 mb-5 px-4">
            <div id="rant-section" className="mb-4"></div>

            <div className="flex items-center justify-between mb-4">
                {/* Section Title */}
                <h2 className="text-xl font-bold text-white">
                    {activeOption === "search" ? "Search Results 🔍" : "Hot Rants 🔥"}
                </h2>

                {/* Buttons Section */}
                <div className="flex gap-4 items-center">
                    {/* Search Button */}
                    <Button
                        onClick={handleSearchDropdownToggle}
                        variant="outline"
                        className={`border-[#333] bg-[#121212] hover:bg-[#1A1A1A] text-white rounded-full px-6 py-2 flex items-center gap-2 ${activeOption === "search" ? "ring-2 ring-white/30" : ""}`}
                    >
                        <MagnifyingGlassIcon className="mr-1 h-4 w-4" />
                        <span>Search</span>
                        <ChevronDownIcon className={`transition-transform ${isSearchOpen ? 'rotate-180' : ''}`} />
                    </Button>

                    {/* Latest & Popular buttons */}
                    <Button
                        onClick={handleLatestClick}
                        variant="outline"
                        className={`border-[#333] bg-[#121212] hover:bg-[#1A1A1A] text-white rounded-full px-6 py-2 ${activeOption === "latest" ? "ring-2 ring-white/30" : ""
                            }`}
                    >
                        <ClockIcon className="mr-2 h-4 w-4" />
                        Latest
                    </Button>
                    <Button
                        onClick={handlePopularClick}
                        variant="outline"
                        className={`border-[#333] bg-[#121212] hover:bg-[#1A1A1A] text-white rounded-full px-6 py-2 ${activeOption === "popular" ? "ring-2 ring-white/30" : ""
                            }`}
                    >
                        <StarIcon className="mr-2 h-4 w-4" />
                        Popular
                    </Button>

                    {/* Filter button */}
                    <Button
                        onClick={handleFilterDropdownToggle}
                        variant="outline"
                        className={`border-[#333] bg-[#121212] hover:bg-[#1A1A1A] text-white rounded-full px-6 py-2 flex items-center gap-2 ${activeOption === "filter" && selectedFilters.length > 0 ? "ring-2 ring-white/30" : ""
                            }`}
                    >
                        <MixerHorizontalIcon className="mr-1 h-4 w-4" />
                        <span>Filter</span>
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
                    className="bg-[#121212] border border-[#333] rounded-lg p-4 shadow-lg w-full"
                >
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-white">Search Rants</h3>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                            </div>
                            <Input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Type to search rants..."
                                value={localSearchQuery}
                                onChange={handleSearchInputChange}
                                className="pl-10 pr-10 bg-[#1A1A1A] border-[#333] text-white"
                            />
                            {localSearchQuery && (
                                <button
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                                    onClick={clearSearch}
                                >
                                    <Cross1Icon className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-400">Filter by mood:</h4>
                            <div className="flex flex-wrap gap-2">
                                {moods.map((mood) => (
                                    <button
                                        key={mood}
                                        type="button"
                                        onClick={() => handleSearchMoodSelect(mood)}
                                        className={`
                                            inline-flex items-center gap-2 px-2 py-1 text-xs
                                            rounded-full transition-all duration-200
                                            ${localSearchMood === mood
                                                ? 'bg-[#1A1A1A] border border-[#333] text-white font-medium'
                                                : 'bg-[#121212] border border-[#333] hover:bg-[#1A1A1A] text-gray-300'}
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
                            <div className="text-sm text-gray-400 pt-2 border-t border-[#333]">
                                <p className="mb-2">Current search:</p>
                                <div className="flex flex-wrap gap-2">
                                    {localSearchQuery && (
                                        <span className="inline-flex items-center gap-2 bg-[#1A1A1A] border border-[#333] px-2 py-1 rounded-full">
                                            <MagnifyingGlassIcon className="w-4 h-4" />
                                            "{localSearchQuery}"
                                        </span>
                                    )}
                                    {localSearchMood && (
                                        <span className="inline-flex items-center gap-2 bg-[#1A1A1A] border border-[#333] px-2 py-1 rounded-full">
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
                    className="bg-[#121212] border border-[#333] rounded-lg p-4 shadow-lg w-full"
                >
                    <h3 className="text-lg font-medium text-white mb-3">Filter by Mood</h3>

                    {/* Mood Options - Using smaller rounded pills like search */}
                    <div className="mb-4 flex flex-wrap gap-2">
                        {moods.map((mood) => (
                            <button
                                key={mood}
                                type="button"
                                onClick={() => handleFilterSelect(mood)}
                                className={`
                                    inline-flex items-center gap-2 px-2 py-1 text-xs
                                    rounded-full transition-all duration-200
                                    ${selectedFilters.includes(mood)
                                        ? 'bg-[#1A1A1A] border border-[#333] text-white font-medium'
                                        : 'bg-[#121212] border border-[#333] hover:bg-[#1A1A1A] text-gray-300'}
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
                                           bg-[#121212] border border-red-500/30 hover:bg-[#1A1A1A] text-red-400"
                            >
                                <Cross1Icon className="w-3 h-3" />
                                Clear All
                            </button>
                        )}
                    </div>

                    {/* Display selected filters inside the filter panel */}
                    {selectedFilters.length > 0 && (
                        <div className="text-sm text-gray-400 pt-2 border-t border-[#333]">
                            <p className="mb-2">Active filters:</p>
                            <div className="flex flex-wrap gap-2">
                                {selectedFilters.map(mood => (
                                    <span key={mood} className="inline-flex items-center gap-2 bg-[#1A1A1A] border border-[#333] px-2 py-1 rounded-full">
                                        <img
                                            src={getMoodEmoji(mood)}
                                            alt={getMoodLabel(mood)}
                                            className="w-4 h-4 object-cover"
                                        />
                                        {getMoodLabel(mood)}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleFilterSelect(mood);
                                            }}
                                            className="ml-1 text-gray-400 hover:text-white"
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
                <div className="text-sm text-gray-400 flex flex-wrap gap-2 mb-4">
                    <span>Active filters:</span>
                    {selectedFilters.map(mood => (
                        <span key={mood} className="inline-flex items-center gap-2 bg-[#121212] border border-[#333] px-2 py-1 rounded-full">
                            <img
                                src={getMoodEmoji(mood)}
                                alt={getMoodLabel(mood)}
                                className="w-4 h-4 object-cover"
                            />
                            {getMoodLabel(mood)}
                            <button
                                onClick={() => handleFilterSelect(mood)}
                                className="ml-1 text-gray-400 hover:text-white"
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Display active search query outside the dropdown (only when dropdown is closed) */}
            {activeOption === "search" && (searchQuery || searchMood) && !isSearchOpen && (
                <div className="text-sm text-gray-400 flex flex-wrap gap-2 mb-4">
                    <span>Searching for:</span>
                    {searchQuery && (
                        <span className="inline-flex items-center gap-2 bg-[#121212] border border-[#333] px-2 py-1 rounded-full">
                            <MagnifyingGlassIcon className="w-4 h-4" />
                            "{searchQuery}"
                            <button
                                onClick={clearSearch}
                                className="ml-1 text-gray-400 hover:text-white"
                            >
                                ×
                            </button>
                        </span>
                    )}
                    {searchMood && (
                        <span className="inline-flex items-center gap-2 bg-[#121212] border border-[#333] px-2 py-1 rounded-full">
                            <img
                                src={getMoodEmoji(searchMood)}
                                alt={getMoodLabel(searchMood)}
                                className="w-4 h-4 object-cover"
                            />
                            {getMoodLabel(searchMood)}
                            <button
                                onClick={clearSearch}
                                className="ml-1 text-gray-400 hover:text-white"
                            >
                                ×
                            </button>
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

export default SortingBar;
