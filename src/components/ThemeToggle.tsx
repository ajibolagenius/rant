import React, { useEffect, useState } from 'react';
import { SunIcon, MoonIcon } from '@radix-ui/react-icons';
import Button from '@/components/Button.tsx';

const ThemeToggle: React.FC = () => {
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');

    useEffect(() => {
        // Initialize theme state from localStorage or system preference
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme) {
            setTheme(savedTheme);
        } else {
            setTheme(prefersDark ? 'dark' : 'light');
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);

        // Update DOM and save preference
        document.documentElement.classList.remove(`theme-${theme}`);
        document.documentElement.classList.add(`theme-${newTheme}`);
        localStorage.setItem('theme', newTheme);
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            className="w-9 h-9 p-0 rounded-full"
        >
            {theme === 'dark' ? (
                <SunIcon className="h-5 w-5" />
            ) : (
                <MoonIcon className="h-5 w-5" />
            )}
        </Button>
    );
};

export default ThemeToggle;
