import React from 'react';
import {
    QuestionMarkCircledIcon,
} from "@radix-ui/react-icons";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getMoodEmoji, getMoodLabel, allMoods, MoodType } from "@/lib/utils/mood";

const SearchHelp: React.FC = () => {
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
                            <p className="text-3xs sm:text-xs text-text-muted mt-0.5 sm:mt-1 font-body">{explanation}</p>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button className="text-text-muted hover:text-text-strong transition-colors">
                    <QuestionMarkCircledIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
            </PopoverTrigger>
            <PopoverContent
                className="w-[95vw] sm:w-[90vw] max-w-[800px] max-h-[80vh] bg-background-dark border border-border-subtle text-text-strong p-3 sm:p-4 shadow-high"
                sideOffset={5}
                align="end"
            >
                <div className="space-y-2">
                    <h3 className="font-medium text-base sm:text-lg mb-2 sm:mb-3 font-heading">Search Tips</h3>

                    <ScrollArea className="h-[min(400px,calc(80vh-80px))] pr-2 sm:pr-4">
                        {/* Responsive grid: 1 column on small screens, 2 on medium, 3 on large */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                            {renderSearchTipItem(
                                "Basic Search",
                                "Type any word or phrase to find matching rants.",
                                "anxiety work stress",
                                "Finds rants containing any of these words"
                            )}

                            {renderSearchTipItem(
                                "Exact Phrases",
                                <>Use quotes for exact phrase matching: <code className="bg-background-secondary px-1 rounded text-3xs sm:text-xs">
                                    "exactly this phrase"</code></>,
                                "\"bad day at work\"",
                                "Finds rants with this exact phrase"
                            )}

                            {renderSearchTipItem(
                                "Mood Filter",
                                <>Use <code className="bg-background-secondary px-1 rounded text-3xs sm:text-xs">
                                    mood:angry</code> to find rants with a specific mood.</>,
                                "mood:angry",
                                "Finds angry rants"
                            )}

                            {renderSearchTipItem(
                                "Combined Search",
                                "You can combine these techniques:",
                                "mood:angry \"terrible day\" work",
                                "Finds angry rants containing the exact phrase and word"
                            )}

                            {/* This item spans 2 columns on medium screens and above */}
                            <div className="sm:col-span-2 lg:col-span-3">
                                {renderSearchTipItem(
                                    "Available Moods",
                                    <div className="text-3xs sm:text-xs grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-0.5 sm:gap-1">
                                        {allMoods.map(mood => (
                                            <div key={mood} className="flex items-center gap-0.5 sm:gap-1">
                                                <img
                                                    src={getMoodEmoji(mood)}
                                                    alt={getMoodLabel(mood)}
                                                    className="w-2.5 h-2.5 sm:w-3 sm:h-3"
                                                    onError={(e) => {
                                                        // Fallback if emoji fails to load
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                    }}
                                                />
                                                <span>{mood}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

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
            </PopoverContent>
        </Popover>
    );
};

export default SearchHelp;
