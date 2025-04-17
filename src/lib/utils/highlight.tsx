import React from 'react';

export function highlightText(text: string, query: string): React.ReactNode {
    if (!query.trim()) {
        return text;
    }

    const parts = text.split(new RegExp(`(${query})`, 'gi'));

    return (
        <>
            {parts.map((part, i) =>
                part.toLowerCase() === query.toLowerCase() ? (
                    <mark
                        key={i}
                        className="bg-cyan-500/30 text-white px-0.5 rounded"
                    >
                        {part}
                    </mark>
                ) : (
                    part
                )
            )}
        </>
    );
}
