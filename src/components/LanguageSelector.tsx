import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { GlobeIcon, CheckIcon, ChevronDownIcon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';

const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' }
];

const LanguageSelector = () => {
    const { i18n } = useTranslation('common');
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                aria-haspopup="true"
                aria-expanded={isOpen}
                aria-label="Select language"
                className="flex items-center gap-2"
            >
                <GlobeIcon className="h-4 w-4" />
                <span>{languages.find(lang => lang.code === i18n.language)?.name || 'English'}</span>
                <ChevronDownIcon className="h-4 w-4" />
            </Button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 py-1" role="menu">
                    {languages.map((language) => (
                        <button
                            key={language.code}
                            onClick={() => changeLanguage(language.code)}
                            className={cn(
                                "flex w-full items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700",
                                i18n.language === language.code ? "text-primary font-medium" : "text-gray-700 dark:text-gray-300"
                            )}
                            role="menuitem"
                        >
                            {i18n.language === language.code && <CheckIcon className="mr-2 h-4 w-4" />}
                            <span className={i18n.language !== language.code ? "ml-6" : ""}>{language.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LanguageSelector;
