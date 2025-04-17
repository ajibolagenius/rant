import React, { useEffect, useState } from "react";
import { Rant } from "@/lib/types/rant";
import { getMoodColor, getMoodEmoji, getMoodAnimation } from "@/lib/utils/mood";
import { motion } from "framer-motion";
import * as Tooltip from "@radix-ui/react-tooltip";
import {
    HeartIcon,
    HeartFilledIcon,
    ChatBubbleIcon,
    Share1Icon,
} from "@radix-ui/react-icons";
import { getAuthorId } from "@/utils/authorId";
import { highlightText } from "@/lib/utils/highlight";
import { formatDistanceToNow } from "date-fns";
import { useLikeStatus } from "@/hooks/useLikeStatus"; // Import the custom hook

// Update the RantCardProps interface to include the onClick handler and searchTerm
interface RantCardProps {
    rant: Rant;
    index: number;
    onRemove?: (id: string) => void;
    onClick?: () => void;
    searchTerm?: string;
    onLike?: () => void;
}

const RantCard: React.FC<RantCardProps> = ({
    rant,
    onClick,
    index = 0,
    searchTerm = '',
    onLike
}) => {
    const moodColor = getMoodColor(rant.mood);
    const moodEmojiPath = getMoodEmoji(rant.mood);
    const [isNew, setIsNew] = useState(false);
    const [isOptimistic, setIsOptimistic] = useState(false);

    // Use the useLikeStatus hook to manage like status
    const { isLiked, likeCount, setLikeStatus, isLoading } = useLikeStatus(rant.id);

    // Animation based on mood
    const moodAnimation = getMoodAnimation(rant.mood);

    // Check if this is a new rant (less than 1 minute old)
    useEffect(() => {
        if (rant.created_at) {
            const createdAt = new Date(rant.created_at);
            const now = new Date();
            const diffInSeconds = Math.floor((now.getTime() - createdAt.getTime()) / 1000);

            // If the rant was created less than 60 seconds ago, mark it as new
            setIsNew(diffInSeconds < 60);

            // Check if this is likely an optimistic update (created in the last 2 seconds)
            setIsOptimistic(diffInSeconds < 2);
        }
    }, [rant.created_at]);

    // Format the relative time
    const formattedTime = rant.created_at
        ? formatDistanceToNow(new Date(rant.created_at), { addSuffix: true })
        : '';

    const handleLikeClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isLiked) {
            // Update the backend to reflect the like
            await setLikeStatus(true); // Call the function to update the backend
        }
    };

    return (
        <motion.div
            onClick={onClick}
            role="article"
            aria-label={`Rant with ${rant.mood} mood`}
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    onClick?.();
                }
            }}
            className={`rounded-2xl p-6 cursor-pointer relative backdrop-blur-sm overflow-hidden flex flex-col h-full ${isOptimistic ? "border-2 border-cyan-500/50" : ""
                }`}
            style={{
                backgroundColor: "rgba(26, 26, 46, 0.25)",
                borderStyle: "solid",
                borderColor: moodColor,
                borderWidth: isOptimistic ? "2px 2px 5px 2px" : "1px 1px 5px 1px",
            }}
            initial={moodAnimation.initial}
            animate={moodAnimation.animate}
            transition={{ duration: 0.35, delay: index ? index * 0.05 : 0 }}
            whileHover={{
                boxShadow: "0 5px 20px rgba(0, 0, 0, 0.4)",
                border: `2px solid ${moodColor}`,
                transformOrigin: "center bottom",
            }}
        >
            {/* New indicator */}
            {isNew && (
                <div className="absolute top-2 right-2">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="bg-cyan-500 text-xs px-2 py-0.5 rounded-full text-white font-medium"
                    >
                        New
                    </motion.div>
                </div>
            )}

            {/* Mood Tag with dynamic outline */}
            <div
                className="w-9 h-9 flex items-center justify-center rounded-md mb-4 text-sm overflow-hidden"
                style={{
                    backgroundColor: moodColor,
                    outline: `1px solid ${moodColor}`,
                    outlineOffset: "2px",
                }}
            >
                <div className="w-6 h-6 flex items-center justify-center">
                    <img
                        src={moodEmojiPath}
                        alt={rant.mood}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                            e.currentTarget.src = "public/assets/emojis/neautral.gif"; // Fallback emoji
                        }}
                    />
                </div>
            </div>

            {/* Rant content with search term highlighting */}
            <p className="text-sm text-[#d0d0d0] leading-relaxed mb-4 font-inter break-words flex-grow">
                {searchTerm ? highlightText(rant.content, searchTerm) : rant.content}
            </p>

            {/* Divider */}
            <div className="h-px w-full bg-[#2e2e2e] my-4" />

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-[#a0a0a0] font-urbanist mt-auto">
                <div className="flex flex-col">
                    <span className="flex items-center gap-1">
                        {/* Display Anonymous with the last 3 characters of authorId */}
                        Anonymous #{rant.author_id?.slice(-3).toUpperCase() || "???"}
                    </span>
                    <span className="text-gray-500 text-xs mt-1">{formattedTime}</span>
                </div>

                <div className="flex gap-4 items-center">
                    {/* Like */}
                    <Tooltip.Provider delayDuration={100}>
                        <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                                <button
                                    onClick={handleLikeClick}
                                    aria-label={isLiked ? "Liked" : "Like"}
                                    className="hover:scale-110 transition-transform flex items-center gap-1"
                                    disabled={isLiked || isLoading}
                                >
                                    {isLiked ? (
                                        <HeartFilledIcon className="text-[#FF66B2] hover:text-[#FF87C1] w-4 h-4" />
                                    ) : (
                                        <HeartIcon className="text-[#FF66B2] hover:text-[#FF87C1] w-4 h-4" />
                                    )}
                                    <span>{likeCount}</span>
                                </button>
                            </Tooltip.Trigger>
                            <Tooltip.Content asChild side="top" sideOffset={5}>
                                <motion.div
                                    className="text-xs bg-[#1f1f1f] text-white px-2 py-1 rounded-md shadow-md font-urbanist"
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {isLiked ? "Liked" : "Like"}
                                    <Tooltip.Arrow className="fill-[#1f1f1f]" />
                                </motion.div>
                            </Tooltip.Content>
                        </Tooltip.Root>
                    </Tooltip.Provider>

                    {/* Comment */}
                    <Tooltip.Provider delayDuration={100}>
                        <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                                <button
                                    onClick={(e) => e.stopPropagation()}
                                    aria-label="Comment"
                                    className="hover:scale-110 transition-transform"
                                >
                                    <ChatBubbleIcon className="text-[#7b7b7b] hover:text-[#60A5FA] w-4 h-4" />
                                </button>
                            </Tooltip.Trigger>
                            <Tooltip.Content asChild side="top" sideOffset={5}>
                                <motion.div
                                    className="text-xs bg-[#1f1f1f] text-white px-2 py-1 rounded-md shadow-md font-urbanist"
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    Comment
                                    <Tooltip.Arrow className="fill-[#1f1f1f]" />
                                </motion.div>
                            </Tooltip.Content>
                        </Tooltip.Root>
                    </Tooltip.Provider>

                    {/* Share */}
                    <Tooltip.Provider delayDuration={100}>
                        <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Copy a shareable link to clipboard
                                        const shareText = `Check out this rant: "${rant.content.substring(0, 50)}${rant.content.length > 50 ? "..." : ""
                                            }"`;
                                        navigator.clipboard.writeText(shareText);

                                        // Show toast notification
                                        toast({
                                            title: "Copied to clipboard",
                                            description: "Share link has been copied!",
                                            duration: 3000,
                                        });
                                    }}
                                    aria-label="Share"
                                    className="hover:scale-110 transition-transform"
                                >
                                    <Share1Icon className="text-[#7b7b7b] hover:text-[#4ADE80] w-4 h-4" />
                                </button>
                            </Tooltip.Trigger>
                            <Tooltip.Content asChild side="top" sideOffset={5}>
                                <motion.div
                                    className="text-xs bg-[#1f1f1f] text-white px-2 py-1 rounded-md shadow-md font-urbanist"
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    Share
                                    <Tooltip.Arrow className="fill-[#1f1f1f]" />
                                </motion.div>
                            </Tooltip.Content>
                        </Tooltip.Root>
                    </Tooltip.Provider>
                </div>
            </div>

            {/* Optimistic update indicator */}
            {isOptimistic && (
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 pointer-events-none"
                    animate={{ opacity: [0.2, 0.1, 0] }}
                    transition={{ duration: 2 }}
                />
            )}
        </motion.div>
    );
};

// Export the RantCard component with React.memo for performance optimization
export default React.memo(RantCard);
