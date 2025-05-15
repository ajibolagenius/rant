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
    TrashIcon,
} from "@radix-ui/react-icons";
import { formatDistanceToNow } from "date-fns";
import { useLikeStatus } from "@/hooks/useLikeStatus";
import { toast } from "@/hooks/use-toast";
import { useAccessibility } from "@/components/AccessibilityContext";
import { cn } from "@/lib/utils";
import { highlightText } from "@/lib/utils/highlight";
import { supabase } from '@/lib/supabase';
import { addDeletedRant } from '@/utils/userStorage';

// function to manage bookmarks in localStorage
const getBookmarks = (): string[] => {
    try {
        const bookmarks = localStorage.getItem('rant_bookmarks');
        return bookmarks ? JSON.parse(bookmarks) : [];
    } catch (error) {
        console.error("Failed to get bookmarks:", error);
        return [];
    }
};

const saveBookmarks = (bookmarks: string[]): void => {
    try {
        localStorage.setItem('rant_bookmarks', JSON.stringify(bookmarks));
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
    isNew?: boolean;
    currentUserId?: string;  // Add this to check if current user is the creator
    showRemove?: boolean; // Add this prop
}

const arePropsEqual = (prevProps: RantCardProps, nextProps: RantCardProps) => {
    return (
        prevProps.rant.id === nextProps.rant.id &&
        prevProps.rant.likes === nextProps.rant.likes &&
        prevProps.rant.content === nextProps.rant.content &&
        prevProps.searchTerm === nextProps.searchTerm &&
        prevProps.index === nextProps.index &&
        prevProps.isNew === nextProps.isNew &&
        prevProps.currentUserId === nextProps.currentUserId // Add this to check for changes in currentUserId
    );
};

const RantCard: React.FC<RantCardProps> = ({
    rant,
    onClick,
    index = 0,
    searchTerm = '',
    onLike,
    onRemove,
    isNew = false,
    currentUserId,
    showRemove = false // Default to false
}) => {
    const { reducedMotion, highContrast, fontSize } = useAccessibility();
    const moodColor = getMoodColor(rant.mood);
    const moodEmojiPath = getMoodEmoji(rant.mood);
    const moodUnicode = getMoodUnicodeEmoji(rant.mood);
    const moodText = `${rant.mood.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`;
    const [isAutoNew, setIsAutoNew] = useState(false);
    const [isOptimistic, setIsOptimistic] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    // Add state for bookmarked status
    const [isBookmarked, setIsBookmarked] = useState(false);
    // Add state for highlight animation
    const [isHighlighted, setIsHighlighted] = useState(isNew);

    // Check if current user is the owner of this rant
    const isOwner = currentUserId && rant.anonymous_user_id === currentUserId;
    // For anonymous rants, check if the anonymous ID matches the user's anonymous ID
    const isAnonymousOwner = currentUserId && rant.anonymous_user_id && currentUserId === rant.anonymous_user_id;
    // Determine if user can remove this rant
    const canRemove = isOwner || isAnonymousOwner;

    // Use the useLikeStatus hook to manage like status
    const { isLiked, likeCount, setLikeStatus, isLoading } = useLikeStatus(rant.id);

    // Animation based on mood - respect reduced motion preference
    const moodAnimation = reducedMotion
        ? { y: 0, scale: 1, ease: "easeOut" } // Default animation for reduced motion
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
            setIsAutoNew(diffInSeconds < 120);

            // Check if this is likely an optimistic update (created in the last 2 seconds or has the flag)
            setIsOptimistic(diffInSeconds < 2 || rant.is_optimistic === true);
        }
    }, [rant.created_at, rant.is_optimistic]);

    // Check if the rant is bookmarked
    useEffect(() => {
        const bookmarks = getBookmarks();
        setIsBookmarked(bookmarks.includes(rant.id));
    }, [rant.id]);

    // Handle highlight effect for new rants
    useEffect(() => {
        setIsHighlighted(isNew);

        // If this is a new rant from notification, auto-remove highlight after 5 seconds
        if (isNew) {
            const timer = setTimeout(() => {
                setIsHighlighted(false);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [isNew]);

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
            });
        } else {
            // Add to bookmarks
            const updatedBookmarks = [...bookmarks, rant.id];
            saveBookmarks(updatedBookmarks);
            setIsBookmarked(true);
            toast({
                title: 'Bookmark Added',
                description: 'This rant has been added to your bookmarks.',
            });
        }
    };

    // Remove handler with Supabase delete and undo support
    const handleRemoveClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!onRemove) return;
        try {
            // Optimistically remove from UI
            onRemove(rant.id);
            // Store in recentlyDeleted for undo
            addDeletedRant(rant);
            // Delete from Supabase
            const { error } = await supabase.from('rants').delete().eq('id', rant.id);
            if (error) throw error;
            toast({
                title: 'Rant Deleted',
                description: 'You can undo this action for a short time.',
                variant: 'default',
            });
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to delete rant. Please try again.',
                variant: 'error',
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
            aria-label={`Rant by Anonymous #${rant.anonymous_user_id?.slice(-3).toUpperCase() || "???"}, ${moodText}, ${formattedTime}`}
            id={`rant-${rant.id}`}
            className={cn(
                "rounded-xl overflow-hidden shadow-medium hover:shadow-high transition-all duration-200",
                "cursor-pointer relative backdrop-blur-sm flex flex-col h-full",
                isOptimistic ? "border-2 border-accent-teal" : "border border-border-subtle",
                highContrast ? "high-contrast-card" : "",
                isHighlighted ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-background-dark" : ""
            )}
            style={{
                backgroundColor: highContrast ? "var(--background-dark)" : "var(--background-secondary)",
            }}
            initial={reducedMotion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: moodAnimation.y, scale: moodAnimation.scale }}
            animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                boxShadow: isHighlighted ? "0 0 0 2px rgba(59, 130, 246, 0.5)" : undefined
            }}
            transition={{ duration: reducedMotion ? 0 : 0.35, ease: moodAnimation.ease, delay: reducedMotion ? 0 : (index ? index * 0.05 : 0) }}
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
                {(isAutoNew || isHighlighted) && (
                    <div className="absolute top-2 right-2">
                        <motion.div
                            initial={reducedMotion ? { scale: 1 } : { scale: 0 }}
                            animate={reducedMotion ? undefined : { scale: 1 }}
                            className={cn(
                                "text-xs px-2 py-0.5 rounded-full font-medium font-ui",
                                isHighlighted ? "bg-blue-500 text-white" : "bg-accent-teal text-background-dark"
                            )}
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
                                    alt={`Mood emoji for ${moodText}`}
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
                        {`Anonymous ${rant.anonymous_user_id?.slice(-3).toUpperCase() || "🫣"}`}
                    </div>

                </div>

                {/* Accessible label for mood (screen reader only) */}
                <span className="sr-only">{`Mood is ${moodText}`}</span>

                {/* Rant content with search term highlighting and accessible font size */}
                <div
                    className={`${getFontSizeClass()} text-text-primary leading-relaxed mb-4 font-body break-words flex-grow`}
                    aria-label={`Rant content`}
                >
                    {highlightText(rant.content, searchTerm)}
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
                                        className={cn(
                                            "hover:scale-110 transition-transform flex items-center gap-1",
                                            isLiked ? "text-[#D84D72]" : "hover:text-[#D84D72] text-text-muted"
                                        )}
                                    >
                                        {isLiked ? (
                                            <HeartFilledIcon className="w-4 h-4" aria-hidden="true" />
                                        ) : (
                                            <HeartIcon className="w-4 h-4" aria-hidden="true" />
                                        )}
                                        <span className="text-xs font-ui">
                                            {likeCount}
                                        </span>
                                    </button>
                                </Tooltip.Trigger>
                                <Tooltip.Content>
                                    <motion.div
                                        initial={reducedMotion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: moodAnimation.y, scale: moodAnimation.scale }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ ease: moodAnimation.ease, duration: 0.5 }}
                                        className="bg-background-dark text-xs px-2 py-1 rounded-md text-text-primary font-ui"
                                    >
                                        {`Like`}
                                        <Tooltip.Arrow className="fill-background-dark" />
                                    </motion.div>
                                </Tooltip.Content>
                            </Tooltip.Root>
                        </Tooltip.Provider>

                        {/* Comment button */}
                        <Tooltip.Provider delayDuration={100}>
                            <Tooltip.Root>
                                <Tooltip.Trigger asChild>
                                    <button
                                        onClick={(e) => e.stopPropagation()}
                                        aria-label={`Comment on rant`}
                                        className={cn(
                                            "hover:scale-110 transition-transform flex items-center gap-1",
                                            rant.comments > 0 ? "text-[#4A90E2]" : "hover:text-[#4A90E2] text-text-muted"
                                        )}
                                    >
                                        <ChatBubbleIcon className="w-4 h-4" aria-hidden="true" />
                                        <span className="text-xs font-ui">
                                            {rant.comments || 0}
                                        </span>
                                    </button>
                                </Tooltip.Trigger>
                                <Tooltip.Content>
                                    <motion.div
                                        className="bg-background-dark text-xs px-2 py-1 rounded-md text-text-primary font-ui"
                                        initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -4 }}
                                        animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                                        transition={{ duration: reducedMotion ? 0 : 0.2 }}
                                    >
                                        {`Comment`}
                                        <Tooltip.Arrow className="fill-background-dark" />
                                    </motion.div>
                                </Tooltip.Content>
                            </Tooltip.Root>
                        </Tooltip.Provider>

                        {/* Bookmark button */}
                        <Tooltip.Provider delayDuration={100}>
                            <Tooltip.Root>
                                <Tooltip.Trigger asChild>
                                    <button
                                        onClick={handleBookmarkClick}
                                        aria-label={isBookmarked
                                            ? `Remove Bookmark`
                                            : `Bookmark`
                                        }
                                        className={cn(
                                            "hover:scale-110 transition-transform",
                                            isBookmarked ? "text-[#F4C542]" : "hover:text-[#F4C542] text-text-muted"
                                        )}
                                        aria-pressed={isBookmarked}
                                    >
                                        {isBookmarked ? (
                                            <BookmarkFilledIcon className="w-4 h-4" aria-hidden="true" />
                                        ) : (
                                            <BookmarkIcon className="w-4 h-4" aria-hidden="true" />
                                        )}
                                    </button>
                                </Tooltip.Trigger>
                                <Tooltip.Content>
                                    <motion.div
                                        className="bg-background-dark text-xs px-2 py-1 rounded-md text-text-primary font-ui"
                                        initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -4 }}
                                        animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                                        transition={{ duration: reducedMotion ? 0 : 0.2 }}
                                    >
                                        {isBookmarked ? `Remove Bookmark` : `Bookmark`}
                                        <Tooltip.Arrow className="fill-background-dark" />
                                    </motion.div>
                                </Tooltip.Content>
                            </Tooltip.Root>
                        </Tooltip.Provider>

                        {/* Share button */}
                        <Tooltip.Provider delayDuration={100}>
                            <Tooltip.Root>
                                <Tooltip.Trigger asChild>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const shareText = `${rant.content.substring(0, 50)}${rant.content.length > 50 ? "..." : ""}`;
                                            navigator.clipboard.writeText(shareText);
                                            toast({
                                                title: 'Copied to Clipboard',
                                                description: 'Share link has been copied to clipboard.',
                                            });
                                        }}
                                        aria-label={`Share this rant`}
                                        className="hover:scale-110 transition-transform text-text-muted hover:text-[#6DD19F]"
                                    >
                                        <Share1Icon className="w-4 h-4" aria-hidden="true" />
                                    </button>
                                </Tooltip.Trigger>
                                <Tooltip.Content>
                                    <motion.div
                                        className="bg-background-dark text-xs px-2 py-1 rounded-md text-text-primary font-ui"
                                        initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -4 }}
                                        animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                                        transition={{ duration: reducedMotion ? 0 : 0.2 }}
                                    >
                                        {`Share`}
                                        <Tooltip.Arrow className="fill-background-dark" />
                                    </motion.div>
                                </Tooltip.Content>
                            </Tooltip.Root>
                        </Tooltip.Provider>

                        {/* Remove button */}

                        <Tooltip.Provider delayDuration={100}>
                            <Tooltip.Root>
                                <Tooltip.Trigger asChild>
                                    <button
                                        onClick={handleRemoveClick}
                                        aria-label="Remove this rant"
                                        className="hover:scale-110 transition-transform text-text-muted hover:text-red-500"
                                        data-owner-status={`isOwner:${isOwner}, isAnonymousOwner:${isAnonymousOwner}`}
                                    >
                                        <TrashIcon className="w-4 h-4" aria-hidden="true" />
                                    </button>
                                </Tooltip.Trigger>
                                <Tooltip.Content>
                                    <motion.div
                                        className="bg-background-dark text-xs px-2 py-1 rounded-md text-text-primary font-ui"
                                        initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -4 }}
                                        animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                                        transition={{ duration: reducedMotion ? 0 : 0.2 }}
                                    >
                                        Remove
                                        <Tooltip.Arrow className="fill-background-dark" />
                                    </motion.div>
                                </Tooltip.Content>
                            </Tooltip.Root>
                        </Tooltip.Provider>
                    </div>
                </div>
            </div>

            {/* Highlight pulse animation for new rants */}
            {isHighlighted && (
                <motion.div
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    initial={{ opacity: 0.5, boxShadow: "0 0 0 0 rgba(59, 130, 246, 0.7)" }}
                    animate={{
                        opacity: 0,
                        boxShadow: "0 0 0 10px rgba(59, 130, 246, 0)",
                    }}
                    transition={{
                        repeat: 2,
                        duration: 1.5,
                        ease: "easeOut"
                    }}
                />
            )}
        </motion.div>
    );
};

export default React.memo(RantCard, arePropsEqual);
