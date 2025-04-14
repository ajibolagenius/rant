
import React from 'react';
import { getMoodColor, getMoodLabel, MoodType } from '@/lib/utils/mood';

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
    <div className="flex flex-wrap gap-2">
      {moods.map((mood) => (
        <button
          key={mood}
          onClick={() => onMoodSelect(mood)}
          className={`rounded-full flex items-center gap-1 py-1 px-3 text-sm transition-colors ${
            selectedMood === mood
              ? 'border-2'
              : 'border'
          }`}
          style={{
            backgroundColor: `${getMoodColor(mood)}20`,
            borderColor: selectedMood === mood ? getMoodColor(mood) : '#333',
            color: getMoodColor(mood)
          }}
        >
          <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: getMoodColor(mood) }}></span>
          {getMoodLabel(mood)}
        </button>
      ))}
    </div>
  );
};

export default MoodSelector;
