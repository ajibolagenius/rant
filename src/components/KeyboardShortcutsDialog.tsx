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
import { KeyboardIcon, SearchIcon } from "lucide-react";
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
                <DialogContent className="sm:max-w-[700px] bg-background-dark border-border-subtle text-text-strong">
                    <DialogHeader>
                        <DialogTitle className="text-lg sm:text-xl font-heading font-semibold">Keyboard Shortcuts</DialogTitle>
                        <DialogDescription className="text-sm font-body text-text-muted">
                            No shortcuts available at this time.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            onClick={() => onOpenChange(false)}
                            className="bg-accent-teal hover:bg-accent-teal/90 text-background-dark font-ui text-sm"
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
                            <span className="text-text-muted mx-1">+</span>
                        )}
                        <kbd className="inline-flex h-5 sm:h-6 items-center justify-center rounded px-1.5 sm:px-2 font-mono text-2xs sm:text-xs font-medium bg-background-secondary border border-border-subtle text-text-strong shadow-low">
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
                    "flex justify-between items-center p-2 sm:p-3 rounded-lg transition-colors",
                    "bg-background-secondary hover:bg-background-secondary/80 border border-border-subtle"
                )}
            >
                <span className="text-2xs sm:text-sm text-text-strong flex items-center">
                    {moodName && (
                        <img
                            src={getMoodEmoji(moodName)}
                            alt={getMoodLabel(moodName)}
                            className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2"
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

    // Function to render a search tip item
    const renderSearchTipItem = (title: string, description: React.ReactNode, example?: string, explanation?: string) => {
        return (
            <div className="bg-background-secondary hover:bg-background-secondary/80 border border-border-subtle p-2 sm:p-3 rounded-lg">
                <h4 className="font-medium text-xs sm:text-sm text-text-strong mb-1 font-heading">{title}</h4>
                <div className="text-2xs sm:text-sm text-text-muted mb-1.5 sm:mb-2 font-body">{description}</div>
                {example && (
                    <div className="bg-background-dark p-1.5 sm:p-2 rounded border border-border-subtle">
                        <code className="text-3xs sm:text-xs text-accent-teal">{example}</code>
                        {explanation && (
                            <p className="text-3xs sm:text-xs text-text-muted mt-0.5 sm:mt-1">{explanation}</p>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[95vh] bg-background-dark border-border-subtle text-text-strong overflow-hidden flex flex-col">
                <DialogHeader className="pb-3 sm:pb-4 border-b border-border-subtle">
                    <DialogTitle className="text-lg sm:text-xl font-bold flex items-center font-heading">
                        <KeyboardIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-accent-teal" />
                        Keyboard Shortcuts & Tips
                    </DialogTitle>
                    <DialogDescription className="text-xs sm:text-sm text-text-muted font-body">
                        Use these shortcuts and tips to navigate and interact with the application more efficiently.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col mt-3 sm:mt-4">
                    <Tabs defaultValue="general" className="flex-1 overflow-hidden flex flex-col">
                        <TabsList className="flex bg-background-secondary p-0.5 sm:p-1 rounded-lg mb-3 sm:mb-4 overflow-x-auto justify-center">
                            <TabsTrigger
                                value="general"
                                className="text-xs sm:text-sm flex-shrink-0 data-[state=active]:bg-primary data-[state=active]:text-on-primary data-[state=active]:shadow-low font-ui"
                            >
                                General Shortcuts
                            </TabsTrigger>
                            <TabsTrigger
                                value="moods"
                                className="text-xs sm:text-sm flex-shrink-0 data-[state=active]:bg-primary data-[state=active]:text-on-primary data-[state=active]:shadow-low font-ui"
                            >
                                Mood Shortcuts
                            </TabsTrigger>
                            <TabsTrigger
                                value="search"
                                className="text-xs sm:text-sm flex-shrink-0 data-[state=active]:bg-primary data-[state=active]:text-on-primary data-[state=active]:shadow-low font-ui"
                            >
                                Search Tips
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent
                            value="general"
                            className="flex-1 overflow-hidden data-[state=active]:animate-in data-[state=active]:fade-in-50"
                        >
                            <div className="flex-1" style={{ height: 'calc(60vh - 120px)' }}>
                                <ScrollArea className="h-full pr-3 sm:pr-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 sm:gap-2">
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
                                <ScrollArea className="h-full pr-3 sm:pr-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 sm:gap-2">
                                        {moodShortcuts.map((shortcut, index) => (
                                            renderShortcutItem(shortcut, index)
                                        ))}
                                    </div>

                                    {/* If there are no mood shortcuts in the array, show all possible moods */}
                                    {moodShortcuts.length === 0 && (
                                        <div className="text-center text-text-muted py-3 sm:py-4">
                                            <p className="text-xs sm:text-sm font-body">No mood shortcuts configured.</p>
                                        </div>
                                    )}
                                </ScrollArea>
                            </div>
                        </TabsContent>

                        {/* New Search Tips Tab with two-column layout */}
                        <TabsContent
                            value="search"
                            className="flex-1 overflow-hidden data-[state=active]:animate-in data-[state=active]:fade-in-50"
                        >
                            <div className="flex-1" style={{ height: 'calc(60vh - 120px)' }}>
                                <ScrollArea className="h-full pr-3 sm:pr-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                                        {renderSearchTipItem(
                                            "Basic Search",
                                            "Type any word or phrase to find matching rants.",
                                            "anxiety work stress",
                                            "Finds rants containing any of these words"
                                        )}

                                        {renderSearchTipItem(
                                            "Exact Phrases",
                                            <>Use quotes for exact phrase matching: <code className="bg-background-secondary px-1 rounded text-3xs sm:text-xs">"exactly this phrase"</code></>,
                                            "\"bad day at work\"",
                                            "Finds rants with this exact phrase"
                                        )}

                                        {renderSearchTipItem(
                                            "Mood Filter",
                                            <>Use <code className="bg-background-secondary px-1 rounded text-3xs sm:text-xs">mood:angry</code> to find rants with a specific mood.</>,
                                            "mood:angry",
                                            "Finds angry rants"
                                        )}

                                        {renderSearchTipItem(
                                            "Combined Search",
                                            "You can combine these techniques:",
                                            "mood:angry \"terrible day\" work",
                                            "Finds angry rants containing the exact phrase and word"
                                        )}

                                        {renderSearchTipItem(
                                            "Available Moods",
                                            <div className="text-3xs sm:text-xs grid grid-cols-2 gap-0.5 sm:gap-1">
                                                {allMoods.map(mood => (
                                                    <div key={mood} className="flex items-center gap-0.5 sm:gap-1">
                                                        <img
                                                            src={getMoodEmoji(mood)}
                                                            alt={getMoodLabel(mood)}
                                                            className="w-2.5 h-2.5 sm:w-3 sm:h-3"
                                                        />
                                                        <span>{mood}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {renderSearchTipItem(
                                            "Search Shortcuts",
                                            <div className="space-y-1 sm:space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-2xs sm:text-xs">Focus search box</span>
                                                    <kbd className="px-1 sm:px-1.5 py-0.5 bg-background-secondary border border-border-subtle rounded text-3xs sm:text-xs">
                                                        /
                                                    </kbd>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-2xs sm:text-xs">Search mode</span>
                                                    <kbd className="px-1 sm:px-1.5 py-0.5 bg-background-secondary border border-border-subtle rounded text-3xs sm:text-xs">
                                                        S
                                                    </kbd>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-2xs sm:text-xs">Clear search</span>
                                                    <kbd className="px-1 sm:px-1.5 py-0.5 bg-background-secondary border border-border-subtle rounded text-3xs sm:text-xs">
                                                        Esc
                                                    </kbd>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                <DialogFooter className="pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-border-subtle flex flex-col sm:flex-row justify-between items-center gap-1.5 sm:gap-2">
                    <div className="text-3xs sm:text-xs text-text-muted font-body">
                        Press <kbd className="px-1 sm:px-1.5 py-0.5 bg-background-secondary border border-border-subtle rounded text-3xs sm:text-xs">Shift + ?</kbd> anytime to show this dialog
                    </div>
                    <Button
                        onClick={() => onOpenChange(false)}
                        className="bg-accent-teal hover:bg-accent-teal/90 text-background-dark font-ui text-xs sm:text-sm"
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default KeyboardShortcutsDialog;
