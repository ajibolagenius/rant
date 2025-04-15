import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { MoodType, getMoodEmoji, getMoodLabel, getMoodColor } from '@/lib/utils/mood';

interface SearchBarProps {
    onSearch: (query: string, mood: MoodType | null) => void;
    initialQuery?: string;
    initialMood?: MoodType | null;
}

const SearchBar: React.FC<SearchBarProps> = ({
    onSearch,
    initialQuery = '',
    initialMood = null
}) => {
    // Get initial values from localStorage if not provided
    const [query, setQuery] = useState(initialQuery || localStorage.getItem('lastSearchQuery') || '');
    const [selectedMood, setSelectedMood] = useState<MoodType | null>(
        initialMood || (localStorage.getItem('lastSearchMood') as MoodType | null)
    );
    const [isExpanded, setIsExpanded] = useState(!!initialQuery || !!initialMood);
    const inputRef = useRef<HTMLInputElement>(null);

    // Common moods for quick filtering
    const quickMoods: MoodType[] = [
        'sad', 'angry', 'confused', 'tired', 'smiling', 'loved'
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
    }, [query, selectedMood, onSearch]);

    const handleClear = () => {
        setQuery('');
        setSelectedMood(null);
        localStorage.removeItem('lastSearchQuery');
        localStorage.removeItem('lastSearchMood');

        // Focus the input after clearing
        inputRef.current?.focus();
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
                                    onClick={() => setSelectedMood(selectedMood === mood ? null : mood)}
                                    className={`
                                        relative overflow-hidden transition-all duration-200 ease-in-out
                                        flex items-center gap-2 py-1 px-3 text-xs
                                        ${selectedMood === mood
                                            ? 'scale-110 shadow-lg z-10'
                                            : 'hover:scale-105 hover:shadow-md'}
                                        rounded-xl
                                    `}
                                    style={{
                                        backgroundColor: selectedMood === mood
                                            ? getMoodColor(mood)
                                            : `${getMoodColor(mood)}15`,
                                        color: selectedMood === mood
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
                                    {selectedMood === mood && (
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
                {(query || selectedMood) && (
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
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchBar;
