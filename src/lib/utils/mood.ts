
export type MoodType =
    | 'sad'
    | 'crying'
    | 'angry'
    | 'eyeRoll'
    | 'heartbroken'
    | 'mindBlown'
    | 'speechless'
    | 'confused'
    | 'tired'
    | 'nervous'
    | 'smiling'
    | 'laughing'
    | 'celebratory'
    | 'confident'
    | 'loved';

export const getMoodColor = (mood: MoodType): string => {
    const moodColors: Record<MoodType, string> = {
        sad: '#8B93A7',
        crying: '#6A89CC',
        angry: '#E74C3C',
        eyeRoll: '#9B59B6',
        heartbroken: '#E83E8C',
        mindBlown: '#8E44AD',
        speechless: '#5D6D7E',
        confused: '#F39C12',
        tired: '#7F8C8D',
        nervous: '#D35400',
        smiling: '#F1C40F',
        laughing: '#F7DC6F',
        celebratory: '#2ECC71',
        confident: '#3498DB',
        loved: '#FF66B2'
    };

    return moodColors[mood] || '#8B93A7';
};

export const getMoodEmoji = (mood: MoodType): string => {
    const emojiMap: Record<MoodType, string> = {
        sad: "😞",
        crying: "😭",
        angry: "😡",
        eyeRoll: "🙄",
        heartbroken: "💔",
        mindBlown: "🤯",
        speechless: "😶",
        confused: "😕",
        tired: "😩",
        nervous: "😬",
        smiling: "🙂",
        laughing: "😂",
        celebratory: "🎉",
        confident: "😎",
        loved: "🥰"
    };

    return emojiMap[mood] || "💭";
};

export const getMoodAnimation = (mood: MoodType) => {
    const animationMap: Record<MoodType, { y: number; scale: number; ease: string }> = {
        sad: { y: 30, scale: 0.95, ease: "easeInOut" },
        crying: { y: 40, scale: 0.92, ease: "anticipate" },
        angry: { y: 60, scale: 0.9, ease: "easeOut" },
        eyeRoll: { y: 25, scale: 0.97, ease: "easeInOut" },
        heartbroken: { y: 35, scale: 0.94, ease: "easeOut" },
        mindBlown: { y: 50, scale: 0.9, ease: "easeInOut" },
        speechless: { y: 20, scale: 0.96, ease: "easeInOut" },
        confused: { y: 45, scale: 0.93, ease: "anticipate" },
        tired: { y: 60, scale: 0.9, ease: "easeInOut" },
        nervous: { y: 55, scale: 0.91, ease: "backOut" },
        smiling: { y: 20, scale: 1, ease: "easeOut" },
        laughing: { y: 15, scale: 1, ease: "easeOut" },
        celebratory: { y: 10, scale: 1.05, ease: "easeOut" },
        confident: { y: 10, scale: 1.03, ease: "easeOut" },
        loved: { y: 25, scale: 1.02, ease: "easeOut" }
    };

    return animationMap[mood] || { y: 30, scale: 0.95, ease: "easeInOut" };
};

export const getMoodAnimationProps = (mood: MoodType, index: number = 0) => {
    const baseDelay = index * 0.07;

    const animations: Record<MoodType, any> = {
        sad: {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            transition: { delay: baseDelay, duration: 0.6, ease: "easeOut" },
        },
        angry: {
            initial: { opacity: 0, scale: 0.9, rotate: -2 },
            animate: { opacity: 1, scale: 1, rotate: 0 },
            transition: { delay: baseDelay, duration: 0.5, ease: "easeInOut" },
        },
        laughing: {
            initial: { opacity: 0, scale: 0.85 },
            animate: { opacity: 1, scale: 1 },
            transition: { delay: baseDelay, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] },
        },
        confident: {
            initial: { opacity: 0, x: 40 },
            animate: { opacity: 1, x: 0 },
            transition: { delay: baseDelay, duration: 0.5, ease: "easeOut" },
        },
        loved: {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            transition: { delay: baseDelay, duration: 0.55, ease: "easeInOut" },
        },
        // fallback/default
        default: {
            initial: { opacity: 0, scale: 0.95 },
            animate: { opacity: 1, scale: 1 },
            transition: { delay: baseDelay, duration: 0.5, ease: "easeOut" },
        },
    };

    return animations[mood] || animations.default;
};



export const getMoodTailwindClass = (mood: MoodType): string => {
    const moodClasses: Record<MoodType, string> = {
        sad: 'bg-mood-sad',
        crying: 'bg-mood-crying',
        angry: 'bg-mood-angry',
        eyeRoll: 'bg-mood-eyeRoll',
        heartbroken: 'bg-mood-heartbroken',
        mindBlown: 'bg-mood-mindBlown',
        speechless: 'bg-mood-speechless',
        confused: 'bg-mood-confused',
        tired: 'bg-mood-tired',
        nervous: 'bg-mood-nervous',
        smiling: 'bg-mood-smiling',
        laughing: 'bg-mood-laughing',
        celebratory: 'bg-mood-celebratory',
        confident: 'bg-mood-confident',
        loved: 'bg-mood-loved'
    };

    return moodClasses[mood] || 'bg-mood-sad';
};

export const getMoodBorderClass = (mood: MoodType): string => {
    const moodClasses: Record<MoodType, string> = {
        sad: 'border-mood-sad',
        crying: 'border-mood-crying',
        angry: 'border-mood-angry',
        eyeRoll: 'border-mood-eyeRoll',
        heartbroken: 'border-mood-heartbroken',
        mindBlown: 'border-mood-mindBlown',
        speechless: 'border-mood-speechless',
        confused: 'border-mood-confused',
        tired: 'border-mood-tired',
        nervous: 'border-mood-nervous',
        smiling: 'border-mood-smiling',
        laughing: 'border-mood-laughing',
        celebratory: 'border-mood-celebratory',
        confident: 'border-mood-confident',
        loved: 'border-mood-loved'
    };

    return moodClasses[mood] || 'border-mood-sad';
};

export const getMoodLabel = (mood: MoodType): string => {
    const labels: Record<MoodType, string> = {
        sad: 'Sad',
        crying: 'Crying',
        angry: 'Angry',
        eyeRoll: 'Eye Roll',
        heartbroken: 'Heartbroken',
        mindBlown: 'Mind Blown',
        speechless: 'Speechless',
        confused: 'Confused',
        tired: 'Tired',
        nervous: 'Nervous',
        smiling: 'Smiling',
        laughing: 'Laughing',
        celebratory: 'Celebratory',
        confident: 'Confident',
        loved: 'Loved'
    };

    return labels[mood] || 'Sad';
};

export const generateAlias = (): string => {
    const adjectives = [
        'Anonymous',
        'Hidden',
        'Secret',
        'Mysterious',
        'Unknown',
        'Masked',
        'Concealed',
        'Veiled',
        'Invisible',
        'Shadow'
    ];

    return adjectives[Math.floor(Math.random() * adjectives.length)];
};

export const isLightColor = (hexColor: string): boolean => {
    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    // Calculate the relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return true if light, false if dark
    return luminance > 0.5;
};
