import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { KeyboardIcon } from "lucide-react";
import { getMoodEmoji, getMoodLabel, allMoods, MoodType } from "@/lib/utils/mood";

// Support both old and new shortcut formats
interface ShortcutInfo {
    combo?: string;
    key?: string;
    description: string;
    category?: string;
    action?: () => void;
}

interface KeyboardShortcutsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    shortcuts: ShortcutInfo[];
}

const KeyboardShortcutsDialog: React.FC<KeyboardShortcutsDialogProps> = ({
    open,
    onOpenChange,
    shortcuts,
}) => {
    if (!shortcuts || !Array.isArray(shortcuts) || shortcuts.length === 0) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[700px] bg-[#09090B] border-[#333] text-white">
                    <DialogHeader>
                        <DialogTitle>Keyboard Shortcuts</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            No shortcuts available at this time.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            onClick={() => onOpenChange(false)}
                            className="bg-cyan-700 hover:bg-cyan-600 text-white"
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    // Normalize shortcuts to handle both old and new formats
    const normalizedShortcuts = shortcuts.map(shortcut => {
        // Clean up the description - remove "Toggle" from mood shortcuts
        let description = shortcut.description;
        if (description.includes("Toggle") && description.includes("mood")) {
            description = description.replace("Toggle ", "").replace(" mood filter", " Mood");
        }

        return {
            key: shortcut.key || shortcut.combo || "",
            description: description,
            category: shortcut.category || "General"
        };
    });

    // Categorize shortcuts into two main categories
    const generalShortcuts: ShortcutInfo[] = [];
    const moodShortcuts: ShortcutInfo[] = [];

    normalizedShortcuts.forEach(shortcut => {
        // Check if the shortcut is related to mood toggling
        if (shortcut.description.toLowerCase().includes("mood") ||
            (shortcut.key && shortcut.key.toLowerCase().includes("shift+"))) {
            moodShortcuts.push(shortcut);
        } else {
            generalShortcuts.push(shortcut);
        }
    });

    // Function to render a keyboard key with proper styling
    const renderKeyCombo = (combo: string) => {
        if (!combo) return null;

        const keys = combo.split('+');

        return (
            <div className="flex items-center space-x-1">
                {keys.map((key, index) => (
                    <span key={index} className="flex items-center">
                        {index > 0 && (
                            <span className="text-gray-500 mx-1">+</span>
                        )}
                        <kbd className="inline-flex h-6 items-center justify-center rounded px-2 font-mono text-xs font-medium bg-[#1A1A1A] border border-[#333] text-white shadow-sm">
                            {key}
                        </kbd>
                    </span>
                ))}
            </div>
        );
    };

    // Function to extract mood name from description
    const extractMoodFromDescription = (description: string): MoodType | null => {
        // Special cases for camelCase mood names
        if (description.toLowerCase().includes("eye roll")) {
            return "eyeRoll" as MoodType;
        }
        if (description.toLowerCase().includes("mind blown")) {
            return "mindBlown" as MoodType;
        }

        // Check for all possible moods in the description
        const moodMap: Record<string, MoodType> = {
            "sad": "sad",
            "crying": "crying",
            "angry": "angry",
            "heartbroken": "heartbroken",
            "speechless": "speechless",
            "confused": "confused",
            "tired": "tired",
            "nervous": "nervous",
            "smiling": "smiling",
            "laughing": "laughing",
            "celebratory": "celebratory",
            "confident": "confident",
            "loved": "loved"
        };

        for (const [textMatch, moodValue] of Object.entries(moodMap)) {
            if (description.toLowerCase().includes(textMatch.toLowerCase())) {
                return moodValue;
            }
        }

        return null;
    };

    // Function to render a shortcut item
    const renderShortcutItem = (shortcut: ShortcutInfo, index: number) => {
        // Extract mood name from description if it's a mood shortcut
        const moodName = extractMoodFromDescription(shortcut.description);

        return (
            <div
                key={index}
                className={cn(
                    "flex justify-between items-center p-3 rounded-lg transition-colors",
                    "bg-[#121212] hover:bg-[#1A1A1A] border border-[#222]"
                )}
            >
                <span className="text-sm text-gray-200 flex items-center">
                    {moodName && (
                        <img
                            src={getMoodEmoji(moodName)}
                            alt={getMoodLabel(moodName)}
                            className="w-4 h-4 mr-2"
                            onError={(e) => {
                                // Fallback if emoji fails to load
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                    )}
                    {shortcut.description}
                </span>
                {renderKeyCombo(shortcut.key || "")}
            </div>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[95vh] bg-[#09090B] border-[#333] text-white overflow-hidden flex flex-col">
                <DialogHeader className="pb-4 border-b border-[#333]">
                    <DialogTitle className="text-xl font-bold flex items-center">
                        <KeyboardIcon className="h-5 w-5 mr-2 text-cyan-500" />
                        Keyboard Shortcuts
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Use these keyboard shortcuts to navigate and interact with the application more efficiently.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col mt-4">
                    <Tabs defaultValue="general" className="flex-1 overflow-hidden flex flex-col">
                        <TabsList className="flex bg-[#121212] p-1 rounded-lg mb-4 overflow-x-auto justify-center">
                            <TabsTrigger
                                value="general"
                                className="flex-shrink-0 data-[state=active]:bg-[#252525] data-[state=active]:text-white data-[state=active]:shadow-sm"
                            >
                                General Shortcuts
                            </TabsTrigger>
                            <TabsTrigger
                                value="moods"
                                className="flex-shrink-0 data-[state=active]:bg-[#252525] data-[state=active]:text-white data-[state=active]:shadow-sm"
                            >
                                Mood Shortcuts
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent
                            value="general"
                            className="flex-1 overflow-hidden data-[state=active]:animate-in data-[state=active]:fade-in-50"
                        >
                            <div className="flex-1" style={{ height: 'calc(60vh - 120px)' }}>
                                <ScrollArea className="h-full pr-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {generalShortcuts.map((shortcut, index) => (
                                            renderShortcutItem(shortcut, index)
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        </TabsContent>

                        <TabsContent
                            value="moods"
                            className="flex-1 overflow-hidden data-[state=active]:animate-in data-[state=active]:fade-in-50"
                        >
                            <div className="flex-1" style={{ height: 'calc(60vh - 120px)' }}>
                                <ScrollArea className="h-full pr-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {moodShortcuts.map((shortcut, index) => (
                                            renderShortcutItem(shortcut, index)
                                        ))}
                                    </div>

                                    {/* If there are no mood shortcuts in the array, show all possible moods */}
                                    {moodShortcuts.length === 0 && (
                                        <div className="text-center text-gray-400 py-4">
                                            <p>No mood shortcuts configured.</p>
                                        </div>
                                    )}
                                </ScrollArea>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                <DialogFooter className="pt-4 mt-4 border-t border-[#333] flex flex-col sm:flex-row justify-between items-center gap-2">
                    <div className="text-xs text-gray-500">
                        Press <kbd className="px-1.5 py-0.5 bg-[#1A1A1A] border border-[#333] rounded text-xs">?</kbd> anytime to show this dialog
                    </div>
                    <Button
                        onClick={() => onOpenChange(false)}
                        className="bg-cyan-700 hover:bg-cyan-600 text-white"
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default KeyboardShortcutsDialog;
