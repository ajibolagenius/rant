import { useState, useEffect } from 'react';

export function useTypewriterEffect(
    texts: string[],
    typingSpeed: number = 50,
    displayTime: number = 5000,
    skipWhenContentExists: boolean = true,
    contentValue: string = ''
) {
    const [placeholder, setPlaceholder] = useState('');

    useEffect(() => {
        if (skipWhenContentExists && contentValue) {
            setPlaceholder('');
            return () => { };
        }

        let currentTextIndex = 0;
        let isTyping = true;
        let charIndex = 0;
        let timeoutId: NodeJS.Timeout;

        const animatePlaceholder = () => {
            const currentText = texts[currentTextIndex];

            if (isTyping) {
                // Typing phase
                if (charIndex <= currentText.length) {
                    setPlaceholder(currentText.substring(0, charIndex));
                    charIndex++;
                    timeoutId = setTimeout(animatePlaceholder, typingSpeed);
                } else {
                    // Finished typing, pause before erasing
                    isTyping = false;
                    timeoutId = setTimeout(animatePlaceholder, displayTime);
                }
            } else {
                // Erasing phase
                if (charIndex > 0) {
                    charIndex--;
                    setPlaceholder(currentText.substring(0, charIndex));
                    timeoutId = setTimeout(animatePlaceholder, typingSpeed / 2);
                } else {
                    // Move to next text
                    isTyping = true;
                    currentTextIndex = (currentTextIndex + 1) % texts.length;
                    timeoutId = setTimeout(animatePlaceholder, typingSpeed * 2);
                }
            }
        };

        // Start the animation
        timeoutId = setTimeout(animatePlaceholder, 500);

        // Cleanup
        return () => {
            clearTimeout(timeoutId);
        };
    }, [texts, typingSpeed, displayTime, skipWhenContentExists, contentValue]);

    return placeholder;
}
