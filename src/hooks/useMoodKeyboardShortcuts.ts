import { useEffect } from 'react';
import { MoodType } from '@/lib/utils/mood';
import { toast } from '@/hooks/use-toast';

interface MoodShortcutOptions {
    onMoodToggle: (mood: MoodType) => void;
    onClearAll?: () => void;
    isEnabled?: boolean;
}

/**
 * Hook to handle keyboard shortcuts for mood selection
 */
export function useMoodKeyboardShortcuts({
    onMoodToggle,
    onClearAll,
    isEnabled = true
}: MoodShortcutOptions) {
    useEffect(() => {
        if (!isEnabled) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Only process if Shift key is pressed and not in an input field
            if (e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
                // Skip if focus is in an input, textarea, or contentEditable element
                const activeElement = document.activeElement;
                if (
                    activeElement instanceof HTMLInputElement ||
                    activeElement instanceof HTMLTextAreaElement ||
                    activeElement instanceof HTMLSelectElement ||
                    activeElement?.getAttribute('contenteditable') === 'true'
                ) {
                    return;
                }

                let targetMood: MoodType | null = null;

                // Map keys to moods - using unique first letters or intuitive keys
                switch (e.key.toLowerCase()) {
                    // Common moods with unique first letters
                    case 's': targetMood = 'sad'; break;
                    case 'a': targetMood = 'angry'; break;
                    case 'c': targetMood = 'confused'; break;
                    case 't': targetMood = 'tired'; break;
                    case 'n': targetMood = 'nervous'; break;
                    case 'l': targetMood = 'loved'; break;

                    // Moods with conflicting first letters - using intuitive alternatives
                    case 'y': targetMood = 'crying'; break;        // crY
                    case 'e': targetMood = 'eyeRoll'; break;       // Eye roll
                    case 'b': targetMood = 'heartbroken'; break;   // heartBroken
                    case 'm': targetMood = 'mindBlown'; break;     // Mind blown
                    case 'p': targetMood = 'speechless'; break;    // sPeechless
                    case 'g': targetMood = 'smiling'; break;       // smilinG
                    case 'f': targetMood = 'laughing'; break;      // laughF
                    case 'd': targetMood = 'celebratory'; break;   // celebratory -> D for dance/celebrate
                    case 'o': targetMood = 'confident'; break;     // cOnfident
                }

                // If a valid mood key was pressed
                if (targetMood) {
                    e.preventDefault();
                    onMoodToggle(targetMood);
                }
            }

            // Clear all filters with Escape key
            if (e.key === 'Escape' && !e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey && onClearAll) {
                // Skip if focus is in an input, textarea, or contentEditable element
                const activeElement = document.activeElement;
                if (
                    activeElement instanceof HTMLInputElement ||
                    activeElement instanceof HTMLTextAreaElement ||
                    activeElement instanceof HTMLSelectElement ||
                    activeElement?.getAttribute('contenteditable') === 'true'
                ) {
                    return;
                }

                onClearAll();
                toast({
                    title: "Filters Cleared",
                    description: "All mood filters have been reset",
                    variant: "default",
                });
            }
        };

        // Add event listener
        window.addEventListener('keydown', handleKeyDown);

        // Clean up
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onMoodToggle, onClearAll, isEnabled]);
}
