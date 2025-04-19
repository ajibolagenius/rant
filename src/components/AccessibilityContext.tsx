import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';
type FontSize = 'normal' | 'large' | 'x-large';

interface AccessibilityContextType {
    highContrast: boolean;
    toggleHighContrast: () => void;
    fontSize: FontSize;
    setFontSize: (size: FontSize) => void;
    theme: ThemeMode;
    setTheme: (theme: ThemeMode) => void;
    reducedMotion: boolean;
    toggleReducedMotion: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [highContrast, setHighContrast] = useState(() => {
        const saved = localStorage.getItem('highContrast');
        return saved ? JSON.parse(saved) : false;
    });

    const [fontSize, setFontSizeState] = useState<FontSize>(() => {
        const saved = localStorage.getItem('fontSize') as FontSize | null;
        return saved || 'normal';
    });

    const [theme, setThemeState] = useState<ThemeMode>(() => {
        const saved = localStorage.getItem('theme') as ThemeMode | null;
        return saved || 'system';
    });

    const [reducedMotion, setReducedMotion] = useState(() => {
        const saved = localStorage.getItem('reducedMotion');
        if (saved !== null) return JSON.parse(saved);

        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    });

    useEffect(() => {
        localStorage.setItem('highContrast', JSON.stringify(highContrast));
        document.documentElement.classList.toggle('high-contrast', highContrast);
    }, [highContrast]);

    useEffect(() => {
        localStorage.setItem('fontSize', fontSize);
        document.documentElement.dataset.fontSize = fontSize;
    }, [fontSize]);

    useEffect(() => {
        localStorage.setItem('theme', theme);

        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const shouldUseDarkMode =
            theme === 'dark' || (theme === 'system' && systemPrefersDark);

        document.documentElement.classList.toggle('dark', shouldUseDarkMode);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('reducedMotion', JSON.stringify(reducedMotion));
        document.documentElement.classList.toggle('reduce-motion', reducedMotion);
    }, [reducedMotion]);

    const toggleHighContrast = () => setHighContrast(prev => !prev);
    const setFontSize = (size: FontSize) => setFontSizeState(size);
    const setTheme = (newTheme: ThemeMode) => setThemeState(newTheme);
    const toggleReducedMotion = () => setReducedMotion(prev => !prev);

    return (
        <AccessibilityContext.Provider value={{
            highContrast,
            toggleHighContrast,
            fontSize,
            setFontSize,
            theme,
            setTheme,
            reducedMotion,
            toggleReducedMotion
        }}>
            {children}
        </AccessibilityContext.Provider>
    );
};

export const useAccessibility = () => {
    const context = useContext(AccessibilityContext);
    if (context === undefined) {
        throw new Error('useAccessibility must be used within an AccessibilityProvider');
    }
    return context;
};
