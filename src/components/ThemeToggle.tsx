import React, { useEffect, useState } from 'react';
import { SunIcon, MoonIcon } from 'lucide-react';
import { themeChange } from 'theme-change';

interface ThemeToggleProps {
    className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
    const [theme, setTheme] = useState<'light' | 'dark'>(
        localStorage.getItem('theme') === 'light' ? 'light' : 'dark'
    );

    useEffect(() => {
        themeChange(false);
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
    };

    return (
        <button
            onClick={toggleTheme}
            className={`flex items-center justify-center p-2 rounded-full transition-colors ${className}`}
            aria-label="Toggle Theme"
        >
            {theme === 'dark' ? <SunIcon size={16} /> : <MoonIcon size={16} />}
        </button>
    );
};

export default ThemeToggle;
