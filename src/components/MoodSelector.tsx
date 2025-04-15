import React from 'react';
import { getMoodColor, getMoodLabel, getMoodEmoji, MoodType } from '@/lib/utils/mood';

interface MoodSelectorProps {
    selectedMood: MoodType | null;
    onMoodSelect: (mood: MoodType) => void;
}

const MoodSelector: React.FC<MoodSelectorProps> = ({ selectedMood, onMoodSelect }) => {
    const moods: MoodType[] = [
        'sad', 'crying', 'angry', 'eyeRoll', 'heartbroken',
        'mindBlown', 'speechless', 'confused', 'tired', 'nervous',
        'smiling', 'laughing', 'celebratory', 'confident', 'loved'
    ];

    return (
        <div className="flex flex-wrap gap-3">
            {moods.map((mood) => (
                <button
                    key={mood}
                    type="button"
                    onClick={() => onMoodSelect(mood)}
                    className={`
            relative overflow-hidden transition-all duration-200 ease-in-out
            flex items-center gap-2 py-2 px-4 text-sm
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
                        className={`w-5 h-5 ${selectedMood === mood ? 'animate-bounce' : ''}`}
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
        </div>
    );
};

export default MoodSelector;
