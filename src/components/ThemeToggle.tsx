import React from 'react';
import { SunIcon, MoonIcon } from 'lucide-react';
import { useAccessibility } from '@/components/AccessibilityContext';

interface ThemeToggleProps {
    className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
    // Use the theme state and setTheme function from AccessibilityContext
    const { theme, setTheme } = useAccessibility();

    const toggleTheme = () => {
        // Toggle between light and dark themes
        const newTheme = theme === 'dark' ? 'light' : 'dark';

        // Use the context's setTheme function which should handle:
        // - Updating the theme state
        // - Updating DOM classes
        // - Saving to localStorage
        setTheme(newTheme);
    };

    return (
        <div
            onClick={toggleTheme}
            className={className}
            role="button"
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleTheme();
                }
            }}
        >
            {theme === 'dark' ? (
                <SunIcon size={16} />
            ) : (
                <MoonIcon size={16} />
            )}
        </div>
    );
};

export default ThemeToggle;
