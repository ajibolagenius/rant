import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TypewriterTextProps extends React.HTMLAttributes<HTMLSpanElement> {
    text: string;
    className?: string;
    delay?: number;
    speed?: number;
    showCaret?: boolean;
    onComplete?: () => void;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({
    text,
    className,
    delay = 0,
    speed = 40,
    showCaret = false,
    onComplete,
    ...rest
}) => {
    const [displayText, setDisplayText] = useState('');
    const [isTyping, setIsTyping] = useState(true);

    useEffect(() => {
        // Reset when text changes
        setDisplayText('');
        setIsTyping(true);

        let interval: NodeJS.Timeout;
        let currentIndex = 0;

        // Delay before starting to type
        const timeout = setTimeout(() => {
            interval = setInterval(() => {
                if (currentIndex < text.length) {
                    setDisplayText(text.substring(0, currentIndex + 1));
                    currentIndex++;
                } else {
                    clearInterval(interval);
                    setIsTyping(false);
                    // Call onComplete callback when typing is finished
                    if (onComplete) {
                        onComplete();
                    }
                }
            }, speed);
        }, delay);

        return () => {
            clearTimeout(timeout);
            clearInterval(interval);
        };
    }, [text, delay, speed, onComplete]);

    return (
        <span className={className} {...rest}>
            {displayText}
            {showCaret && isTyping && (
                <motion.span
                    className="inline-block w-[2px] h-[1em] bg-current ml-1 align-middle"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity, repeatType: "loop" }}
                />
            )}
        </span>
    );
};

export default TypewriterText;
