import React from 'react';
import { MoodType, getMoodEmoji, getMoodLabel, getMoodColor, allMoods } from '@/lib/utils/mood';
import { Cross1Icon } from '@radix-ui/react-icons';
import { motion } from 'framer-motion';

interface MoodFilterProps {
    selectedMoods: string[];
    onChange: (moods: string[]) => void;
}

const MoodFilter: React.FC<MoodFilterProps> = ({ selectedMoods, onChange }) => {
    // Toggle a mood in the selection
    const toggleMood = (mood: string) => {
        const newSelection = selectedMoods.includes(mood)
            ? selectedMoods.filter(m => m !== mood)
            : [...selectedMoods, mood];

        onChange(newSelection);
    };

    // Clear all selected moods
    const clearAll = () => {
        onChange([]);
    };

    return (
        <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-wrap gap-1 sm:gap-2">
                {allMoods.map((mood) => (
                    <motion.button
                        key={mood}
                        type="button"
                        onClick={() => toggleMood(mood)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`
                            relative overflow-hidden transition-colors duration-200
                            flex items-center gap-1 sm:gap-2 py-1 px-2 sm:py-2 sm:px-4 text-xs sm:text-sm
                            rounded-full
                        `}
                        style={{
                            backgroundColor: selectedMoods.includes(mood)
                                ? getMoodColor(mood)
                                : `${getMoodColor(mood)}15`,
                            color: selectedMoods.includes(mood)
                                ? '#fff'
                                : getMoodColor(mood),
                            border: `1px solid ${getMoodColor(mood)}`,
                        }}
                    >
                        <img
                            src={getMoodEmoji(mood)}
                            alt={getMoodLabel(mood)}
                            className="w-4 h-4 sm:w-5 sm:h-5"
                        />
                        <span className="font-medium truncate">{getMoodLabel(mood)}</span>
                        {selectedMoods.includes(mood) && (
                            <span className="absolute -right-1 -top-1 bg-white rounded-full p-0.5 shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-2 w-2 sm:h-3 sm:w-3" fill="none" viewBox="0 0 24 24" stroke={getMoodColor(mood)} strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </span>
                        )}
                    </motion.button>
                ))}
            </div>

            {/* Selected moods summary */}
            {selectedMoods.length > 0 && (
                <div className="pt-2 sm:pt-3 border-t border-[#333]">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm text-gray-400">Selected moods ({selectedMoods.length}):</span>
                        <button
                            onClick={clearAll}
                            className="text-[10px] sm:text-xs text-red-400 hover:text-red-300"
                        >
                            Clear all
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                        {selectedMoods.map(mood => (
                            <span
                                key={mood}
                                className="inline-flex items-center gap-1 sm:gap-2 bg-[#1A1A1A] border border-[#333] px-2 py-1 rounded-full text-xs"
                                style={{ borderColor: `${getMoodColor(mood as MoodType)}50` }}
                            >
                                <img
                                    src={getMoodEmoji(mood as MoodType)}
                                    srcSet={`
                                        ${getMoodEmoji(mood as MoodType).replace('.gif', '.webp')} 1x,
                                        ${getMoodEmoji(mood as MoodType).replace('.gif', '@2x.webp')} 2x,
                                        ${getMoodEmoji(mood as MoodType).replace('.gif', '@3x.webp')} 3x
                                    `}
                                    alt={getMoodLabel(mood as MoodType)}
                                    className="w-3 h-3 sm:w-4 sm:h-4 object-cover"
                                    loading="lazy"
                                    onError={e => { e.currentTarget.src = '/assets/emojis/neutral.gif'; }}
                                />
                                <span className="truncate max-w-[80px] sm:max-w-none">{getMoodLabel(mood as MoodType)}</span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleMood(mood);
                                    }}
                                    className="ml-1 text-gray-400 hover:text-white"
                                >
                                    <Cross1Icon className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MoodFilter;
