import React, { useEffect, useState } from "react";
import { Rant } from "@/lib/types/rant";
import { getMoodColor, getMoodEmoji, getMoodAnimation, getMoodUnicodeEmoji, getMoodGradient } from "@/lib/utils/mood";
import { motion } from "framer-motion";
import * as Tooltip from "@radix-ui/react-tooltip";
import {
    HeartIcon,
    HeartFilledIcon,
    ChatBubbleIcon,
    Share1Icon,
    BookmarkIcon,
    BookmarkFilledIcon,
} from "@radix-ui/react-icons";
import { formatDistanceToNow } from "date-fns";
import { useLikeStatus } from "@/hooks/useLikeStatus";
import { toast } from "@/hooks/use-toast";
import { useAccessibility } from "@/components/AccessibilityContext";
import { cn } from "@/lib/utils";

// We'll add a function to manage bookmarks in localStorage
const getBookmarks = (): string[] => {
    try {
        const bookmarks = localStorage.getItem('bentoRant_bookmarks');
        return bookmarks ? JSON.parse(bookmarks) : [];
    } catch (error) {
        console.error("Failed to get bookmarks:", error);
        return [];
    }
};

const saveBookmarks = (bookmarks: string[]): void => {
    try {
        localStorage.setItem('bentoRant_bookmarks', JSON.stringify(bookmarks));
    } catch (error) {
        console.error("Failed to save bookmarks:", error);
    }
};

interface RantCardProps {
    rant: Rant;
    index: number;
    onRemove?: (id: string) => void;
    onClick?: () => void;
    searchTerm?: string;
    onLike?: () => void;
}

const arePropsEqual = (prevProps: RantCardProps, nextProps: RantCardProps) => {
    return (
        prevProps.rant.id === nextProps.rant.id &&
        prevProps.rant.likes === nextProps.rant.likes &&
        prevProps.rant.content === nextProps.rant.content &&
        prevProps.searchTerm === nextProps.searchTerm &&
        prevProps.index === nextProps.index
    );
};

const RantCard: React.FC<RantCardProps> = ({
    rant,
    onClick,
    index = 0,
    searchTerm = '',
    onLike
}) => {
    const { reducedMotion, highContrast, fontSize } = useAccessibility();
    const moodColor = getMoodColor(rant.mood);
    const moodEmojiPath = getMoodEmoji(rant.mood);
    const moodUnicode = getMoodUnicodeEmoji(rant.mood);
    const moodText = `Mood: ${rant.mood}`;
    const [isNew, setIsNew] = useState(false);
    const [isOptimistic, setIsOptimistic] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    // Add state for bookmarked status
    const [isBookmarked, setIsBookmarked] = useState(false);

    // Use the useLikeStatus hook to manage like status
    const { isLiked, likeCount, setLikeStatus, isLoading } = useLikeStatus(rant.id);

    // Animation based on mood - respect reduced motion preference
    const moodAnimation = reducedMotion
        ? { initial: {}, animate: {} }
        : getMoodAnimation(rant.mood);

    // Check device width for responsive design
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 640);
        };

        // Check initially
        checkMobile();

        // Add resize listener
        window.addEventListener('resize', checkMobile);

        // Cleanup
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Check if this is a new rant (less than 2 minutes old)
    useEffect(() => {
        if (rant.created_at) {
            const createdAt = new Date(rant.created_at);
            const now = new Date();
            const diffInSeconds = Math.floor((now.getTime() - createdAt.getTime()) / 1000);

            // If the rant was created less than 120 seconds ago, mark it as new
            setIsNew(diffInSeconds < 120);

            // Check if this is likely an optimistic update (created in the last 2 seconds or has the flag)
            setIsOptimistic(diffInSeconds < 2 || rant.is_optimistic === true);
        }
    }, [rant.created_at, rant.is_optimistic]);

    // Check if the rant is bookmarked
    useEffect(() => {
        const bookmarks = getBookmarks();
        setIsBookmarked(bookmarks.includes(rant.id));
    }, [rant.id]);

    // Format the relative time
    const formattedTime = rant.created_at
        ? formatDistanceToNow(new Date(rant.created_at), { addSuffix: true })
        : '';

    const handleLikeClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isLiked) {
            await setLikeStatus(true);
            if (onLike) {
                onLike();
            }
        }
    };

    // Add bookmark toggle handler
    const handleBookmarkClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        const bookmarks = getBookmarks();

        if (isBookmarked) {
            // Remove from bookmarks
            const updatedBookmarks = bookmarks.filter(id => id !== rant.id);
            saveBookmarks(updatedBookmarks);
            setIsBookmarked(false);
            toast({
                title: 'Bookmark Removed',
                description: 'This rant has been removed from your bookmarks.',
                duration: 3000,
            });
        } else {
            // Add to bookmarks
            const updatedBookmarks = [...bookmarks, rant.id];
            saveBookmarks(updatedBookmarks);
            setIsBookmarked(true);
            toast({
                title: 'Bookmark Added',
                description: 'This rant has been added to your bookmarks.',
                duration: 3000,
            });
        }
    };

    // Calculate border width - make it thicker for optimistic updates
    const borderWidth = isOptimistic ? "2px 2px 5px 2px" : "1px 1px 4px 1px";

    // High contrast mode adjustments
    const cardBackground = highContrast ? "rgba(0, 0, 0, 0.8)" : "rgba(26, 26, 46, 0.25)";
    const cardTextColor = highContrast ? "#ffffff" : "#d0d0d0";
    const secondaryTextColor = highContrast ? "#ffffff" : "#a0a0a0";

    // Get font size class based on accessibility setting
    const getFontSizeClass = () => {
        switch (fontSize) {
            case 'large': return isMobile ? 'text-sm' : 'text-base';
            case 'x-large': return isMobile ? 'text-base' : 'text-lg';
            default: return isMobile ? 'text-xs' : 'text-sm';
        }
    };

    // Create gradient background for the card header
    const moodGradient = getMoodGradient ? getMoodGradient(rant.mood) : `linear-gradient(to right, ${moodColor}22, ${moodColor}44)`;

    return (
        <motion.div
            onClick={onClick}
            role="article"
            aria-label={`Rant by Anonymous #${rant.author_id?.slice(-3).toUpperCase() || "???"}, ${moodText}, ${formattedTime}`}
            id={`rant-${rant.id}`}
            className={cn(
                "rounded-xl overflow-hidden shadow-medium hover:shadow-high transition-all duration-200",
                "cursor-pointer relative backdrop-blur-sm flex flex-col h-full",
                isOptimistic ? "border-2 border-accent-teal" : "border border-border-subtle",
                highContrast ? "high-contrast-card" : ""
            )}
            style={{
                backgroundColor: highContrast ? "var(--background-dark)" : "var(--background-secondary)",
            }}
            initial={reducedMotion ? undefined : moodAnimation.initial}
            animate={reducedMotion ? undefined : moodAnimation.animate}
            transition={{ duration: reducedMotion ? 0 : 0.35, delay: reducedMotion ? 0 : (index ? index * 0.05 : 0) }}
            whileHover={reducedMotion ? undefined : {
                y: -5,
                transition: { duration: 0.2 }
            }}
        >
            {/* Mood gradient header */}
            <div
                className="h-2 w-full"
                style={{ background: moodGradient }}
            />

            <div className="p-4 sm:p-6 flex flex-col h-full">
                {/* New indicator with proper live region for screen readers */}
                {isNew && (
                    <div className="absolute top-2 right-2">
                        <motion.div
                            initial={reducedMotion ? { scale: 1 } : { scale: 0 }}
                            animate={reducedMotion ? undefined : { scale: 1 }}
                            className="bg-accent-teal text-xs px-2 py-0.5 rounded-full text-background-dark font-medium font-ui"
                            aria-live="polite"
                        >
                            New
                        </motion.div>
                    </div>
                )}

                {/* Header with mood and author info */}
                <div className="flex items-center justify-between mb-4">
                    {/* Mood Tag with dynamic outline - smaller on mobile */}
                    <div className="flex items-center gap-2">
                        <div
                            className={`${isMobile ? 'w-7 h-7' : 'w-9 h-9'} flex items-center justify-center rounded-md overflow-hidden`}
                            style={{
                                backgroundColor: `${moodColor}22`,
                                border: `1px solid ${moodColor}`,
                            }}
                            aria-hidden="true"
                        >
                            <div className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} flex items-center justify-center`}>
                                <img
                                    src={moodEmojiPath}
                                    alt=""
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                        e.currentTarget.src = "/assets/emojis/neutral.gif"; // Fallback emoji
                                    }}
                                />
                            </div>
                        </div>
                        <span className="text-xs sm:text-sm font-ui" style={{ color: moodColor }}>
                            {moodText}
                        </span>
                    </div>

                    {/* Author info */}
                    <div className="text-xs text-text-muted font-ui">
                        {`Anonymous Author #${rant.author_id?.slice(-3).toUpperCase() || "???"}`}
                    </div>
                </div>

                {/* Accessible label for mood (screen reader only) */}
                <span className="sr-only">{`Mood is ${moodText}`}</span>

                {/* Rant content with search term highlighting and accessible font size */}
                <div
                    className={`${getFontSizeClass()} text-text-primary leading-relaxed mb-4 font-body break-words flex-grow`}
                    aria-label={`Rant content`}
                >
                    {searchTerm ? (
                        <div dangerouslySetInnerHTML={{
                            __html: highlightText(rant.content, searchTerm)
                        }} />
                    ) : (
                        rant.content
                    )}
                </div>

                {/* Footer with timestamp and actions */}
                <div className="mt-auto">
                    {/* Timestamp */}
                    <div className="text-xs text-text-muted mb-3 font-ui">
                        {formattedTime}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-between">
                        {/* Like button with accessible labels */}
                        <Tooltip.Provider delayDuration={100}>
                            <Tooltip.Root>
                                <Tooltip.Trigger asChild>
                                    <button
                                        onClick={handleLikeClick}
                                        aria-label={isLiked
                                            ? `Already Liked ${likeCount} times`
                                            : `Like this rant ${likeCount} times`
                                        }
                                        className="hover:scale-110 transition-transform flex items-center gap-1"
                                        disabled={isLiked || isLoading}
                                        aria-pressed={isLiked}
                                    >
                                        {isLiked ? (
                                            <HeartFilledIcon className="text-rose hover:text-rose/80 w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />
                                        ) : (
                                            <HeartIcon className="text-text-muted hover:text-rose w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />
                                        )}
                                        <span className="text-xs text-text-muted">{likeCount}</span>
                                    </button>
                                </Tooltip.Trigger>
                                <Tooltip.Content asChild side="top" sideOffset={5}>
                                    <motion.div
                                        className="text-xs bg-background-dark text-text-strong px-2 py-1 rounded-md shadow-medium font-ui"
                                        initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -4 }}
                                        animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                                        transition={{ duration: reducedMotion ? 0 : 0.2 }}
                                    >
                                        {isLiked ? `Already Liked` : `Like this rant`}
                                        <Tooltip.Arrow className="fill-background-dark" />
                                    </motion.div>
                                </Tooltip.Content>
                            </Tooltip.Root>
                        </Tooltip.Provider>

                        {/* Comment button with accessible label */}
                        <Tooltip.Provider delayDuration={100}>
                            <Tooltip.Root>
                                <Tooltip.Trigger asChild>
                                    <button
                                        onClick={(e) => e.stopPropagation()}
                                        aria-label={`Comment on this rant`}
                                        className="hover:scale-110 transition-transform"
                                    >
                                        <ChatBubbleIcon className="text-text-muted hover:text-accent-info w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />
                                    </button>
                                </Tooltip.Trigger>
                                <Tooltip.Content asChild side="top" sideOffset={5}>
                                    <motion.div
                                        className="text-xs bg-background-dark text-text-strong px-2 py-1 rounded-md shadow-medium font-ui"
                                        initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -4 }}
                                        animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                                        transition={{ duration: reducedMotion ? 0 : 0.2 }}
                                    >
                                        {`Comment on this rant`}
                                        <Tooltip.Arrow className="fill-background-dark" />
                                    </motion.div>
                                </Tooltip.Content>
                            </Tooltip.Root>
                        </Tooltip.Provider>

                        {/* Bookmark button with accessible label */}
                        <Tooltip.Provider delayDuration={100}>
                            <Tooltip.Root>
                                <Tooltip.Trigger asChild>
                                    <button
                                        onClick={handleBookmarkClick}
                                        aria-label={isBookmarked
                                            ? `Remove Bookmark`
                                            : `Bookmark this rant`
                                        }
                                        className="hover:scale-110 transition-transform"
                                        aria-pressed={isBookmarked}
                                    >
                                        {isBookmarked ? (
                                            <BookmarkFilledIcon className="text-accent-warm hover:text-accent-warm/80 w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />
                                        ) : (
                                            <BookmarkIcon className="text-text-muted hover:text-accent-warm w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />
                                        )}
                                    </button>
                                </Tooltip.Trigger>
                                <Tooltip.Content asChild side="top" sideOffset={5}>
                                    <motion.div
                                        className="text-xs bg-background-dark text-text-strong px-2 py-1 rounded-md shadow-medium font-ui"
                                        initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -4 }}
                                        animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                                        transition={{ duration: reducedMotion ? 0 : 0.2 }}
                                    >
                                        {isBookmarked ? `Remove Bookmark` : `Bookmark this rant`}
                                        <Tooltip.Arrow className="fill-background-dark" />
                                    </motion.div>
                                </Tooltip.Content>
                            </Tooltip.Root>
                        </Tooltip.Provider>

                        {/* Share button with accessible label */}
                        <Tooltip.Provider delayDuration={100}>
                            <Tooltip.Root>
                                <Tooltip.Trigger asChild>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // Copy a shareable link to clipboard
                                            const shareText = `${t('rant.shareMessage')}: "${rant.content.substring(0, 50)}${rant.content.length > 50 ? "..." : ""}"`;
                                            navigator.clipboard.writeText(shareText);

                                            // Show toast notification
                                            toast({
                                                title: 'Copied to Clipboard',
                                                description: 'Share link has been copied to clipboard.',
                                                duration: 3000,
                                            });
                                        }}
                                        aria-label={`Share this rant`}
                                        className="hover:scale-110 transition-transform"
                                    >
                                        <Share1Icon className="text-text-muted hover:text-accent-success w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />
                                    </button>
                                </Tooltip.Trigger>
                                <Tooltip.Content asChild side="top" sideOffset={5}>
                                    <motion.div
                                        className="text-xs bg-background-dark text-text-strong px-2 py-1 rounded-md shadow-medium font-ui"
                                        initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -4 }}
                                        animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                                        transition={{ duration: reducedMotion ? 0 : 0.2 }}
                                    >
                                        {`Share this rant`}
                                        <Tooltip.Arrow className="fill-background-dark" />
                                    </motion.div>
                                </Tooltip.Content>
                            </Tooltip.Root>
                        </Tooltip.Provider>
                    </div>
                </div>
            </div>

            {/* Optimistic update indicator with reduced motion support */}
            {isOptimistic && !reducedMotion && (
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-accent-teal/10 to-primary/10 pointer-events-none"
                    animate={{ opacity: [0.2, 0.1, 0] }}
                    transition={{ duration: 2 }}
                    aria-hidden="true"
                />
            )}

            {/* Static indicator for optimistic updates when reduced motion is enabled */}
            {isOptimistic && reducedMotion && (
                <div
                    className="absolute inset-0 bg-accent-teal/5 pointer-events-none"
                    aria-hidden="true"
                />
            )}
        </motion.div>
    );
};

// Missing function from the original code
const highlightText = (text: string, query: string): string => {
    if (!query) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-accent-warm/30 text-text-strong">$1</mark>');
};

// Export the RantCard component with React.memo for performance optimization
export default React.memo(RantCard, arePropsEqual);
