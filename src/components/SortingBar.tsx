import React, { useState } from "react";
import { getMoodEmoji, getMoodLabel } from "@/lib/utils/mood";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import * as Tooltip from "@radix-ui/react-tooltip";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

interface SortingBarProps {
    onFilterChange: (mood: string) => void;
    selectedFilter: string;
}

const SortingBar: React.FC<SortingBarProps> = ({ onFilterChange, selectedFilter }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // List of moods (could be moved to the utility if required)
    const moods = [
        "sad", "crying", "angry", "eyeRoll", "heartbroken", "mindBlown", "speechless",
        "confused", "tired", "nervous", "smiling", "laughing", "celebratory", "confident", "loved"
    ];

    // Handle mood filter selection
    const handleFilterSelect = (mood: string) => {
        onFilterChange(mood);
        setIsDropdownOpen(false); // Close dropdown after selection
    };

    return (
        <div id="rant-section" className="flex items-center justify-between mt-10 mb-5 px-4">
            {/* Section Title */}
            <h2 className="text-xl font-bold text-white">Hot Rants 🔥</h2>

            {/* Buttons Section */}
            <div className="flex gap-4 items-center">
                {/* Latest & Popular buttons */}
                <button className="px-6 py-2 text-sm text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
                    Latest
                </button>
                <button className="px-6 py-2 text-sm text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
                    Popular
                </button>

                {/* Filter button with dropdown */}
                <DropdownMenu.Root open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                    <DropdownMenu.Trigger className="px-6 py-2 text-sm text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center gap-2">
                        <span>Filter</span>
                        <ChevronDownIcon />
                    </DropdownMenu.Trigger>

                    <DropdownMenu.Content className="bg-gray-800 text-white rounded-lg p-2 shadow-lg">
                        {/* Mood Options */}
                        <div className="mb-2">
                            {moods.map((mood) => (
                                <DropdownMenu.Item
                                    key={mood}
                                    onClick={() => handleFilterSelect(mood)}
                                    className="hover:bg-gray-700 rounded p-2 cursor-pointer"
                                >
                                    {getMoodEmoji(mood)} {getMoodLabel(mood)}
                                </DropdownMenu.Item>
                            ))}
                        </div>

                        {/* Clear Filter Option */}
                        <DropdownMenu.Separator className="border-t border-gray-600 mb-2" />
                        <DropdownMenu.Item
                            onClick={() => onFilterChange("")}
                            className="text-red-500 cursor-pointer"
                        >
                            Clear Filter X
                        </DropdownMenu.Item>
                    </DropdownMenu.Content>
                </DropdownMenu.Root>
            </div>

            {/* Displaying Selected Filter */}
            {selectedFilter && (
                <div className="mt-3 text-sm text-gray-400">
                    Filtering by: {getMoodLabel(selectedFilter)} {getMoodEmoji(selectedFilter)}
                </div>
            )}
        </div>
    );
};

export default SortingBar;
