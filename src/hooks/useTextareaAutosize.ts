import { useEffect, RefObject } from 'react';

export function useTextareaAutosize<T extends HTMLTextAreaElement>(
    textareaRef: RefObject<T>,
    value: string,
    minHeight: number = 120
) {
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.max(minHeight, textareaRef.current.scrollHeight)}px`;
        }
    }, [value, textareaRef, minHeight]);
}
