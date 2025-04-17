import { useEffect } from "react";

interface KeyboardShortcut {
    key: string;
    ctrlKey?: boolean;
    altKey?: boolean;
    shiftKey?: boolean;
    action: () => void;
    description: string;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Don't trigger shortcuts when typing in input fields
            if (
                event.target instanceof HTMLInputElement ||
                event.target instanceof HTMLTextAreaElement
            ) {
                return;
            }

            for (const shortcut of shortcuts) {
                if (
                    event.key.toLowerCase() === shortcut.key.toLowerCase() &&
                    (shortcut.ctrlKey === undefined || event.ctrlKey === shortcut.ctrlKey) &&
                    (shortcut.altKey === undefined || event.altKey === shortcut.altKey) &&
                    (shortcut.shiftKey === undefined || event.shiftKey === shortcut.shiftKey)
                ) {
                    event.preventDefault();
                    shortcut.action();
                    break;
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [shortcuts]);

    // Return the list of shortcuts for documentation
    return shortcuts.map((shortcut) => {
        let combo = "";
        if (shortcut.ctrlKey) combo += "Ctrl + ";
        if (shortcut.altKey) combo += "Alt + ";
        if (shortcut.shiftKey) combo += "Shift + ";
        combo += shortcut.key.toUpperCase();

        return {
            combo,
            description: shortcut.description,
        };
    });
};
