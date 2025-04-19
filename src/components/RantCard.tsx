import React, { useEffect, useState } from "react";
import { Rant } from "@/lib/types/rant";
import { getMoodColor, getMoodEmoji, getMoodAnimation, getMoodUnicodeEmoji } from "@/lib/utils/mood";
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
import { getAuthorId } from "@/utils/authorId";
import { highlightText } from "@/lib/utils/highlight";
import { formatDistanceToNow } from "date-fns";
import { useLikeStatus } from "@/hooks/useLikeStatus";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
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
    const { t } = useTranslation();
    const { reducedMotion, highContrast, fontSize } = useAccessibility();
    const moodColor = getMoodColor(rant.mood);
    const moodEmojiPath = getMoodEmoji(rant.mood);
    const moodUnicode = getMoodUnicodeEmoji(rant.mood);
    const moodText = t(`moods.${rant.mood}`);
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
                title: t('rant.bookmarkRemoved'),
                description: t('rant.bookmarkRemovedDesc'),
                duration: 3000,
            });
        } else {
            // Add to bookmarks
            const updatedBookmarks = [...bookmarks, rant.id];
            saveBookmarks(updatedBookmarks);
            setIsBookmarked(true);
            toast({
                title: t('rant.bookmarkAdded'),
                description: t('rant.bookmarkAddedDesc'),
                duration: 3000,
            });
        }
    };

    // Handle keyboard interaction for card and internal elements
    // const handleCardKeyDown = (e: React.KeyboardEvent) => {
    //     if (e.key === 'Enter' || e.key === ' ') {
    //         e.preventDefault();
    //         onClick?.();
    //     }
    // };

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

    return (
        <motion.div
            onClick={onClick}
            role="article"
            aria-label={`${t('rant.by')} Anonymous #${rant.author_id?.slice(-3).toUpperCase() || "???"}, ${moodText} ${t('rant.mood')}, ${formattedTime}`}
            id={`rant-${rant.id}`}
            className={cn(
                "rounded-2xl p-4 sm:p-6 cursor-pointer relative backdrop-blur-sm overflow-hidden flex flex-col h-full",
                isOptimistic ? "border-2 border-cyan-500/50" : "",
                highContrast ? "high-contrast-card" : ""
                // No focus-related classes
            )}
            style={{
                backgroundColor: cardBackground,
                borderStyle: "solid",
                borderColor: moodColor,
                borderWidth: borderWidth,
                boxShadow: highContrast ? `0 0 0 2px ${moodColor}` : `0 2px 10px ${moodColor}20`
                // No focus-related styles
            }}
            initial={reducedMotion ? undefined : moodAnimation.initial}
            animate={reducedMotion ? undefined : moodAnimation.animate}
            transition={{ duration: reducedMotion ? 0 : 0.35, delay: reducedMotion ? 0 : (index ? index * 0.05 : 0) }}
            whileHover={reducedMotion ? undefined : {
                boxShadow: `0 5px 20px ${moodColor}40`,
                border: `2px solid ${moodColor}`,
                transformOrigin: "center bottom",
            }}
        >
            {/* New indicator with proper live region for screen readers */}
            {isNew && (
                <div className="absolute top-2 right-2">
                    <motion.div
                        initial={reducedMotion ? { scale: 1 } : { scale: 0 }}
                        animate={reducedMotion ? undefined : { scale: 1 }}
                        className="bg-cyan-500 text-xs px-2 py-0.5 rounded-full text-white font-medium"
                        aria-live="polite"
                    >
                        {t('rant.new')}
                    </motion.div>
                </div>
            )}

            {/* Mood Tag with dynamic outline - smaller on mobile */}
            <div
                className={`${isMobile ? 'w-7 h-7' : 'w-9 h-9'} flex items-center justify-center rounded-md mb-4 text-sm overflow-hidden`}
                style={{
                    backgroundColor: moodColor,
                    outline: `1px solid ${moodColor}`,
                    outlineOffset: "2px",
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

            {/* Accessible label for mood (screen reader only) */}
            <span className="sr-only">{t('rant.moodIs', { mood: moodText })}</span>

            {/* Rant content with search term highlighting and accessible font size */}
            <div
                className={`${getFontSizeClass()} text-[${cardTextColor}] leading-relaxed mb-4 font-inter break-words flex-grow`}
                aria-label={t('rant.content')}
            >
                {searchTerm ? (
                    <div dangerouslySetInnerHTML={{
                        __html: highlightText(rant.content, searchTerm)
                    }} />
                ) : (
                    rant.content
                )}
            </div>

            {/* Divider */}
            <div
                className="h-px w-full bg-[#2e2e2e] my-3 sm:my-4"
                aria-hidden="true"
            />

            {/* Footer - responsive layout */}
            <div className={`flex items-center justify-between ${getFontSizeClass()} text-[${secondaryTextColor}] font-urbanist mt-auto`}>
                <div className="flex flex-col">
                    <span className="flex items-center gap-1">
                        {/* Display Anonymous with the last 3 characters of authorId */}
                        {t('rant.anonymousAuthor')} #{rant.author_id?.slice(-3).toUpperCase() || "???"}
                    </span>
                    <span className="text-gray-500 text-[10px] sm:text-xs mt-1" aria-label={t('rant.postedTime')}>
                        {formattedTime}
                    </span>
                </div>

                <div className="flex gap-2 sm:gap-4 items-center">
                    {/* Like button with accessible labels */}
                    <Tooltip.Provider delayDuration={100}>
                        <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                                <button
                                    onClick={handleLikeClick}
                                    aria-label={isLiked
                                        ? t('rant.alreadyLiked', { count: likeCount })
                                        : t('rant.likeAction', { count: likeCount })
                                    }
                                    className="hover:scale-110 transition-transform flex items-center gap-1"
                                    disabled={isLiked || isLoading}
                                    aria-pressed={isLiked}
                                >
                                    {isLiked ? (
                                        <HeartFilledIcon className="text-[#FF66B2] hover:text-[#FF87C1] w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />
                                    ) : (
                                        <HeartIcon className="text-[#FF66B2] hover:text-[#FF87C1] w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />
                                    )}
                                    <span>{likeCount}</span>
                                </button>
                            </Tooltip.Trigger>
                            <Tooltip.Content asChild side="top" sideOffset={5}>
                                <motion.div
                                    className="text-xs bg-[#1f1f1f] text-white px-2 py-1 rounded-md shadow-md font-urbanist"
                                    initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -4 }}
                                    animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                                    transition={{ duration: reducedMotion ? 0 : 0.2 }}
                                >
                                    {isLiked ? t('rant.alreadyLiked', { count: 0 }) : t('rant.likeAction', { count: 0 })}
                                    <Tooltip.Arrow className="fill-[#1f1f1f]" />
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
                                        ? t('rant.removeBookmark', 'Remove bookmark')
                                        : t('rant.addBookmark', 'Bookmark this rant')
                                    }
                                    className="hover:scale-110 transition-transform"
                                    aria-pressed={isBookmarked}
                                >
                                    {isBookmarked ? (
                                        <BookmarkFilledIcon className="text-yellow-400 hover:text-yellow-300 w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />
                                    ) : (
                                        <BookmarkIcon className="text-[#7b7b7b] hover:text-yellow-400 w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />
                                    )}
                                </button>
                            </Tooltip.Trigger>
                            <Tooltip.Content asChild side="top" sideOffset={5}>
                                <motion.div
                                    className="text-xs bg-[#1f1f1f] text-white px-2 py-1 rounded-md shadow-md font-urbanist"
                                    initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -4 }}
                                    animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                                    transition={{ duration: reducedMotion ? 0 : 0.2 }}
                                >
                                    {isBookmarked ? t('rant.removeBookmark', 'Remove bookmark') : t('rant.addBookmark', 'Bookmark this rant')}
                                    <Tooltip.Arrow className="fill-[#1f1f1f]" />
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
                                    aria-label={t('rant.commentAction')}
                                    className="hover:scale-110 transition-transform"
                                >
                                    <ChatBubbleIcon className="text-[#7b7b7b] hover:text-[#60A5FA] w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />
                                </button>
                            </Tooltip.Trigger>
                            <Tooltip.Content asChild side="top" sideOffset={5}>
                                <motion.div
                                    className="text-xs bg-[#1f1f1f] text-white px-2 py-1 rounded-md shadow-md font-urbanist"
                                    initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -4 }}
                                    animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                                    transition={{ duration: reducedMotion ? 0 : 0.2 }}
                                >
                                    {t('rant.commentAction')}
                                    <Tooltip.Arrow className="fill-[#1f1f1f]" />
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
                                            title: t('rant.copiedToClipboard'),
                                            description: t('rant.shareLinkCopied'),
                                            duration: 3000,
                                        });
                                    }}
                                    aria-label={t('rant.shareAction')}
                                    className="hover:scale-110 transition-transform"
                                >
                                    <Share1Icon className="text-[#7b7b7b] hover:text-[#4ADE80] w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />
                                </button>
                            </Tooltip.Trigger>
                            <Tooltip.Content asChild side="top" sideOffset={5}>
                                <motion.div
                                    className="text-xs bg-[#1f1f1f] text-white px-2 py-1 rounded-md shadow-md font-urbanist"
                                    initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -4 }}
                                    animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                                    transition={{ duration: reducedMotion ? 0 : 0.2 }}
                                >
                                    {t('rant.shareAction')}
                                    <Tooltip.Arrow className="fill-[#1f1f1f]" />
                                </motion.div>
                            </Tooltip.Content>
                        </Tooltip.Root>
                    </Tooltip.Provider>
                </div>
            </div>

            {/* Optimistic update indicator with reduced motion support */}
            {isOptimistic && !reducedMotion && (
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 pointer-events-none"
                    animate={{ opacity: [0.2, 0.1, 0] }}
                    transition={{ duration: 2 }}
                    aria-hidden="true"
                />
            )}

            {/* Static indicator for optimistic updates when reduced motion is enabled */}
            {isOptimistic && reducedMotion && (
                <div
                    className="absolute inset-0 bg-cyan-500/5 pointer-events-none"
                    aria-hidden="true"
                />
            )}
        </motion.div>
    );
};

// Export the RantCard component with React.memo for performance optimization
export default React.memo(RantCard, arePropsEqual);
