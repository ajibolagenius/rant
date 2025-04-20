// Core color tokens from the design system
export const colors = {
    // Primary Palette
    primary: {
        main: '#6C63FF',
        dark: '#5C54DD',
        light: '#7D76FF',
        background: {
            dark: '#121225',
            light: '#F5F5F7'
        },
        onPrimary: '#FFFFFF'
    },

    // Accent Palette
    accent: {
        teal: '#2DD4BF',
        amber: '#F59E0B',
        rose: '#FB7185'
    },

    // Utility Colors
    utility: {
        borderSubtle: '#2DD4BF22',
        borderStrong: '#6C63FF88',
        textMuted: '#A0AEC0',
        textStrong: '#FFFFFF',
        error: '#E11D48',
        success: '#34D399',
        info: '#60A5FA'
    },

    // States
    states: {
        hover: 'brightness(1.05)',
        focus: '#2DD4BF',
        active: 'brightness(0.9)',
        clicked: '#6C63FF33',
        disabled: '#99999980'
    },

    // Shadows
    shadows: {
        low: '0 1px 2px rgba(0,0,0,0.05)',
        medium: '0 4px 12px rgba(0,0,0,0.1)',
        high: '0 12px 24px rgba(0,0,0,0.2)'
    }
};

// Mood-based gradients
export const moodGradients: Record<string, string> = {
    sad: 'linear-gradient(to right, #3B82F6, #A5B4FC)',
    crying: 'linear-gradient(to right, #6366F1, #C4B5FD)',
    angry: 'linear-gradient(to right, #EF4444, #DC2626)',
    happy: 'linear-gradient(to right, #FBBF24, #FDE68A)',
    eyeRoll: 'linear-gradient(to right, #D1D5DB, #6B7280)',
    heartbroken: 'linear-gradient(to right, #E11D48, #9F1239)',
    mindBlown: 'linear-gradient(to right, #8B5CF6, #06B6D4)',
    speechless: 'linear-gradient(to right, #1F2937, #4B5563)',
    confused: 'linear-gradient(to right, #F59E0B, #EC4899)',
    tired: 'linear-gradient(to right, #64748B, #CBD5E1)',
    nervous: 'linear-gradient(to right, #FDE68A, #FCA5A5)',
    smiling: 'linear-gradient(to right, #10B981, #F59E0B)',
    laughing: 'linear-gradient(to right, #22D3EE, #A7F3D0)',
    celebratory: 'linear-gradient(to right, #F97316, #FCD34D)',
    confident: 'linear-gradient(to right, #6D28D9, #2DD4BF)',
    loved: 'linear-gradient(to right, #EC4899, #F472B6)',
    neutral: 'linear-gradient(to right, #9CA3AF, #D1D5DB)'
};

// Mood solid colors (extracted from gradients for single-color use cases)
export const moodColors: Record<string, string> = {
    sad: '#3B82F6',
    crying: '#6366F1',
    angry: '#EF4444',
    happy: '#FBBF24',
    eyeRoll: '#D1D5DB',
    heartbroken: '#E11D48',
    mindBlown: '#8B5CF6',
    speechless: '#1F2937',
    confused: '#F59E0B',
    tired: '#64748B',
    nervous: '#FDE68A',
    smiling: '#10B981',
    laughing: '#22D3EE',
    celebratory: '#F97316',
    confident: '#6D28D9',
    loved: '#EC4899',
    neutral: '#9CA3AF'
};


// Button variants
export const buttonVariants = {
    primary: {
        background: colors.primary.main,
        text: colors.primary.onPrimary,
        border: 'none',
        hover: colors.primary.light,
        active: colors.primary.dark
    },
    accentTeal: {
        background: colors.accent.teal,
        text: colors.primary.background.dark,
        border: 'none',
        hover: '#22C6AD',
        active: '#1EB9A2'
    },
    danger: {
        background: colors.accent.rose,
        text: colors.primary.onPrimary,
        border: 'none',
        hover: '#F43F5E',
        active: '#E11D48'
    },
    ghost: {
        background: 'transparent',
        text: colors.primary.main,
        border: `1px solid ${colors.primary.main}`,
        hover: '#6C63FF22',
        active: '#6C63FF44'
    }
};

// Dialog and modal styles
export const dialogStyles = {
    default: {
        background: colors.primary.background.dark,
        border: colors.utility.borderSubtle,
        shadow: colors.shadows.medium,
        text: colors.primary.onPrimary
    },
    focused: {
        background: '#1E1E3F',
        border: colors.utility.borderStrong,
        shadow: colors.shadows.high,
        text: colors.primary.background.light
    }
};
