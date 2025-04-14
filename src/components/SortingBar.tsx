import React, { useState, useRef, useEffect } from "react";
import { getMoodEmoji, getMoodLabel, getMoodUnicodeEmoji } from "@/lib/utils/mood";
import {
    ChevronDownIcon,
    ClockIcon,
    StarIcon,
    MixerHorizontalIcon
} from "@radix-ui/react-icons";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Button } from "@/components/ui/button";

type SortOption = "latest" | "popular" | "filter";

interface SortingBarProps {
    activeOption: SortOption;
    onOptionChange: (option: SortOption) => void;
    onFilterChange?: (moods: string[]) => void;
    selectedFilters?: string[];
}

const SortingBar: React.FC<SortingBarProps> = ({
    activeOption,
    onOptionChange,
    onFilterChange,
    selectedFilters = []
}) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [dropdownHeight, setDropdownHeight] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // List of moods (could be moved to the utility if required)
    const moods = [
        "sad", "crying", "angry", "eyeRoll", "heartbroken", "mindBlown", "speechless",
        "confused", "tired", "nervous", "smiling", "laughing", "celebratory", "confident", "loved"
    ];

    // Measure dropdown height when it opens
    useEffect(() => {
        if (isDropdownOpen && dropdownRef.current) {
            setDropdownHeight(dropdownRef.current.offsetHeight);
        } else {
            setDropdownHeight(0);
        }
    }, [isDropdownOpen]);

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

    return (
        <div id="rant-section" className="flex flex-col mt-10 mb-5 px-4">
            <div className="flex items-center justify-between mb-4">
                {/* Section Title */}
                <h2 className="text-xl font-bold text-white">Hot Rants 🔥</h2>

                {/* Buttons Section */}
                <div className="flex gap-4 items-center">
                    {/* Latest & Popular buttons */}
                    <Button
                        onClick={() => onOptionChange("latest")}
                        variant="outline"
                        className={`border-[#333] bg-[#121212] hover:bg-[#1A1A1A] text-white rounded-full px-6 py-2 ${activeOption === "latest" ? "ring-2 ring-white/30" : ""
                            }`}
                    >
                        <ClockIcon className="mr-2 h-4 w-4" />
                        Latest
                    </Button>
                    <Button
                        onClick={() => onOptionChange("popular")}
                        variant="outline"
                        className={`border-[#333] bg-[#121212] hover:bg-[#1A1A1A] text-white rounded-full px-6 py-2 ${activeOption === "popular" ? "ring-2 ring-white/30" : ""
                            }`}
                    >
                        <StarIcon className="mr-2 h-4 w-4" />
                        Popular
                    </Button>

                    {/* Filter button */}
                    <Button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
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

            {/* Filter Dropdown - Rendered directly in the flow */}
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isDropdownOpen ? 'opacity-100' : 'opacity-0 h-0'}`}
                style={{ height: isDropdownOpen ? 'auto' : 0, marginBottom: isDropdownOpen ? '1rem' : 0 }}
            >
                <div
                    ref={dropdownRef}
                    className="bg-[#121212] border border-[#333] rounded-lg p-4 shadow-lg w-full"
                >
                    {/* Mood Options */}
                    <div className="mb-4 flex flex-wrap gap-3">
                        {moods.map((mood) => (
                            <button
                                key={mood}
                                onClick={() => handleFilterSelect(mood)}
                                className={`px-3 py-2 rounded-full text-sm flex items-center gap-2 transition-colors ${selectedFilters.includes(mood)
                                    ? "bg-[#1A1A1A] border border-[#333] text-white"
                                    : "bg-[#121212] border border-[#333] hover:bg-[#1A1A1A] text-gray-200"
                                    }`}
                            >
                                <img
                                    src={getMoodEmoji(mood)}
                                    alt={getMoodLabel(mood)}
                                    className="w-5 h-5 object-cover"
                                />
                                {getMoodLabel(mood)}
                            </button>
                        ))}
                        {/* Clear Filter Option */}
                        <Button
                            onClick={clearAllFilters}
                            variant="outline"
                            className="border-[#333] bg-[#121212] hover:bg-[#1A1A1A] text-red-400 rounded-full px-4 py-2 text-sm"
                            disabled={selectedFilters.length === 0}
                        >
                            Clear All Filters
                        </Button>
                    </div>
                </div>
            </div>

            {/* Displaying Selected Filters */}
            {selectedFilters.length > 0 && activeOption === "filter" && (
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
        </div>
    );
};

export default SortingBar;
