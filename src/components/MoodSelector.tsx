import React from 'react';
import { getMoodColor, getMoodLabel, getMoodEmoji, MoodType, getMoodGradient } from '@/lib/utils/mood';
interface MoodSelectorProps {
    selectedMood: MoodType | null;
    onMoodSelect: (mood: MoodType) => void;
}

const MoodSelector: React.FC<MoodSelectorProps> = ({ selectedMood, onMoodSelect }) => {
    const moods: MoodType[] = [
        'sad', 'crying', 'happy', 'neutral', 'angry', 'eyeRoll', 'heartbroken', 'loved', 'mindBlown', 'speechless', 'confused', 'tired', 'nervous',
        'smiling', 'laughing', 'celebratory', 'confident',
    ];

    return (
        <div className="flex flex-wrap gap-2">
            {moods.map((mood) => (
                <button
                    key={mood}
                    type="button"
                    onClick={() => onMoodSelect(mood)}
                    className={`
                        inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-ui whitespace-nowrap transition-all duration-200 ease-in-out
                        ${selectedMood === mood
                            ? 'scale-110 shadow-lg z-10'
                            : 'hover:scale-105 hover:shadow-md'}
                    `}
                    style={{
                        background: selectedMood === mood
                            ? getMoodGradient(mood)
                            : `${getMoodColor(mood)}15`,
                        color: selectedMood === mood
                            ? '#fff'
                            : getMoodColor(mood),
                        border: `1px solid ${getMoodColor(mood)}`,
                    }}
                >
                    <img
                        src={getMoodEmoji(mood)}
                        srcSet={`
                            ${getMoodEmoji(mood).replace('.gif', '.webp')} 1x,
                            ${getMoodEmoji(mood).replace('.gif', '@2x.webp')} 2x,
                            ${getMoodEmoji(mood).replace('.gif', '@3x.webp')} 3x
                        `}
                        alt={getMoodLabel(mood)}
                        className="w-5 h-5"
                        loading="lazy"
                        onError={e => { e.currentTarget.src = '/assets/emojis/neutral.gif'; }}
                    />
                    <span className="capitalize">
                        {mood === 'eyeRoll' ? 'Eye Roll' : mood}
                    </span>
                </button>
            ))}
        </div>
    );
};

export default MoodSelector;
