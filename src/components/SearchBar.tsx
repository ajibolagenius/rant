import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { MoodType, getMoodEmoji, getMoodLabel, getMoodColor } from '@/lib/utils/mood';
import { useSearchParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

interface SearchBarProps {
    onSearch: (query: string, mood: MoodType | null) => void;
    initialQuery?: string;
    initialMood?: MoodType | null;
    onMoodSelect?: (mood: MoodType) => void;
    selectedMoods?: MoodType[];
}

const SearchBar: React.FC<SearchBarProps> = ({
    onSearch,
    initialQuery = '',
    initialMood = null,
    onMoodSelect,
    selectedMoods = []
}) => {
    const [searchParams, setSearchParams] = useSearchParams();

    // Get initial values from URL params first, then fallback to props or localStorage
    const urlQuery = searchParams.get('q') || '';
    const urlMood = searchParams.get('mood') as MoodType | null;

    // Initialize state with URL parameters taking precedence
    const [query, setQuery] = useState(urlQuery || initialQuery || localStorage.getItem('lastSearchQuery') || '');
    const [selectedMood, setSelectedMood] = useState<MoodType | null>(
        urlMood || initialMood || (localStorage.getItem('lastSearchMood') as MoodType | null)
    );
    const [isExpanded, setIsExpanded] = useState(!!urlQuery || !!urlMood || !!initialQuery || !!initialMood);
    const inputRef = useRef<HTMLInputElement>(null);

    // Common moods for quick filtering
    const quickMoods: MoodType[] = [
        'sad', 'angry', 'confused', 'tired', 'smiling', 'loved', 'neutral'
    ];

    // Update search when query or mood changes - real-time search
    useEffect(() => {
        // Save to localStorage for persistence
        if (query) {
            localStorage.setItem('lastSearchQuery', query);
        } else {
            localStorage.removeItem('lastSearchQuery');
        }

        if (selectedMood) {
            localStorage.setItem('lastSearchMood', selectedMood);
        } else {
            localStorage.removeItem('lastSearchMood');
        }

        // Trigger search immediately
        onSearch(query, selectedMood);

        // Update URL parameters
        updateUrlParams();
    }, [query, selectedMood, onSearch]);

    // Update URL parameters when search changes
    const updateUrlParams = () => {
        const newParams = new URLSearchParams(searchParams);

        if (query) {
            newParams.set('q', query);
            // If we have a query, ensure we're in search mode
            newParams.set('sort', 'search');
        } else {
            newParams.delete('q');
        }

        if (selectedMood) {
            newParams.set('mood', selectedMood);
            // If we have a mood, ensure we're in search mode
            newParams.set('sort', 'search');
        } else {
            newParams.delete('mood');
        }

        // If neither query nor mood is set, remove the sort parameter if it's 'search'
        if (!query && !selectedMood && newParams.get('sort') === 'search') {
            newParams.delete('sort');
        }

        // Only update if there's a change to avoid unnecessary history entries
        if (newParams.toString() !== searchParams.toString()) {
            setSearchParams(newParams, { replace: true });
        }
    };

    // Check for URL parameter changes
    useEffect(() => {
        const urlQuery = searchParams.get('q');
        const urlMood = searchParams.get('mood') as MoodType | null;

        // Only update state if the URL parameters differ from current state
        // to avoid infinite loops
        if (urlQuery !== null && urlQuery !== query) {
            setQuery(urlQuery);
        } else if (urlQuery === null && query !== '') {
            // If URL has no query but state does, check if we should clear it
            // Only clear if we're not in search mode anymore
            if (searchParams.get('sort') !== 'search') {
                setQuery('');
            }
        }

        if (urlMood !== selectedMood) {
            setSelectedMood(urlMood);
        } else if (urlMood === null && selectedMood !== null) {
            // If URL has no mood but state does, check if we should clear it
            // Only clear if we're not in search mode anymore
            if (searchParams.get('sort') !== 'search') {
                setSelectedMood(null);
            }
        }

        // Expand the search options if there are search parameters
        if (urlQuery || urlMood) {
            setIsExpanded(true);
        }
    }, [searchParams, query, selectedMood]);


    const handleClear = () => {
        setQuery('');
        setSelectedMood(null);
        localStorage.removeItem('lastSearchQuery');
        localStorage.removeItem('lastSearchMood');

        // Update URL to remove search parameters
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('q');
        newParams.delete('mood');

        // If sort is 'search' and we're clearing the search, remove sort too
        if (newParams.get('sort') === 'search') {
            newParams.delete('sort');
        }

        setSearchParams(newParams, { replace: true });

        // Focus the input after clearing
        inputRef.current?.focus();
    };

    // Handle mood selection for multiple mood filtering
    const handleMoodToggle = (mood: MoodType) => {
        if (onMoodSelect) {
            // If we have a mood selection handler, use it for multiple mood selection
            onMoodSelect(mood);
        } else {
            // Otherwise, use the single mood selection behavior
            setSelectedMood(selectedMood === mood ? null : mood);
        }
    };

    // Check if a mood is selected (either as the single mood or in the multiple selection)
    const isMoodSelected = (mood: MoodType) => {
        return selectedMood === mood || (selectedMoods && selectedMoods.includes(mood));
    };

    return (
        <div className="w-full mb-6">
            <div className="relative">
                <div className="flex items-center">
                    <div className="relative flex-grow">
                        <Input
                            ref={inputRef}
                            type="text"
                            placeholder="Search rants..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="pl-10 pr-10 py-2 bg-[#121212] border-[#333] rounded-full focus-visible:ring-1 focus-visible:ring-cyan-500"
                            onFocus={() => setIsExpanded(true)}
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        {query && (
                            <button
                                onClick={handleClear}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                {isExpanded && (
                    <div className="mt-2 flex flex-wrap gap-2 items-center">
                        <span className="text-sm text-gray-400">Filter by mood:</span>
                        <div className="flex flex-wrap gap-2">
                            {quickMoods.map((mood) => (
                                <button
                                    key={mood}
                                    type="button"
                                    onClick={() => handleMoodToggle(mood)}
                                    className={`
                                        relative overflow-hidden transition-all duration-200 ease-in-out
                                        flex items-center gap-2 py-1 px-3 text-xs
                                        ${isMoodSelected(mood)
                                            ? 'scale-110 shadow-lg z-10'
                                            : 'hover:scale-105 hover:shadow-md'}
                                        rounded-xl
                                    `}
                                    style={{
                                        backgroundColor: isMoodSelected(mood)
                                            ? getMoodColor(mood)
                                            : `${getMoodColor(mood)}15`,
                                        color: isMoodSelected(mood)
                                            ? '#fff'
                                            : getMoodColor(mood),
                                        border: `1px solid ${getMoodColor(mood)}`,
                                    }}
                                >
                                    <img
                                        src={getMoodEmoji(mood)}
                                        alt={getMoodLabel(mood)}
                                        className="w-4 h-4"
                                    />
                                    <span className="font-medium">{getMoodLabel(mood)}</span>
                                    {isMoodSelected(mood) && (
                                        <span className="absolute -right-1 -top-1 bg-white rounded-full p-0.5 shadow-sm">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke={getMoodColor(mood)} strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </span>
                                    )}
                                </button>
                            ))}
                            <button
                                type="button"
                                onClick={() => setIsExpanded(false)}
                                className="text-xs text-gray-500 hover:text-white ml-2"
                            >
                                Hide options
                            </button>
                        </div>
                    </div>
                )}

                {/* Display active search */}
                {(query || selectedMood || (selectedMoods && selectedMoods.length > 0)) && (
                    <div className="mt-3 text-sm text-gray-400">
                        <div className="flex flex-wrap gap-2 items-center">
                            <span>Searching for:</span>
                            {query && (
                                <span className="inline-flex items-center gap-2 bg-[#121212] border border-[#333] px-2 py-1 rounded-full">
                                    <Search className="w-3 h-3" />
                                    "{query}"
                                </span>
                            )}
                            {selectedMood && (
                                <span className="inline-flex items-center gap-2 bg-[#121212] border border-[#333] px-2 py-1 rounded-full">
                                    <img
                                        src={getMoodEmoji(selectedMood)}
                                        alt={getMoodLabel(selectedMood)}
                                        className="w-4 h-4 object-cover"
                                    />
                                    {getMoodLabel(selectedMood)}
                                </span>
                            )}
                            {/* Show multiple selected moods if using that mode */}
                            {!selectedMood && selectedMoods && selectedMoods.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {selectedMoods.map(mood => (
                                        <span
                                            key={mood}
                                            className="inline-flex items-center gap-2 bg-[#121212] border border-[#333] px-2 py-1 rounded-full"
                                            style={{ borderColor: getMoodColor(mood) }}
                                        >
                                            <img
                                                src={getMoodEmoji(mood)}
                                                alt={getMoodLabel(mood)}
                                                className="w-4 h-4 object-cover"
                                            />
                                            {getMoodLabel(mood)}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Clear all button */}
                            {(query || selectedMood || (selectedMoods && selectedMoods.length > 0)) && (
                                <button
                                    onClick={handleClear}
                                    className="text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded-full transition-colors"
                                >
                                    Clear all
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchBar;
