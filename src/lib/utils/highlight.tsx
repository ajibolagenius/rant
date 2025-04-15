import React from 'react';

export const highlightText = (text: string, searchTerm: string): React.ReactNode => {
    if (!searchTerm.trim()) return text;

    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,  'gi'); // Escape special characters
    const parts = text.split(regex);

    return (
        <>
            {parts.map((part, i) => {
                if (part.toLowerCase() === searchTerm.toLowerCase()) {
                    return (
                        <span
                            key={i}
                            className="bg-yellow-500/30 text-white px-0.5 rounded"
                        >
                            {part}
                        </span>
                    );
                }
                return part;
            })}
        </>
    );
};
