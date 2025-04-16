<!-- RantCard AI Version 1.0.0 -->
import React, { useState } from "react";
import { Rant } from "@/lib/types/rant";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { getMoodColor, getMoodEmoji, getMoodUnicodeEmoji } from "@/lib/utils/mood";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { HeartIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

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
    index,
    onClick,
    searchTerm = "",
    onLike
}) => {
    const [isLiked, setIsLiked] = useState(false);

    // Debug output
    console.log("RantCard rendering rant:", rant.id, rant);

    const handleLike = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isLiked && onLike) {
            setIsLiked(true);
            onLike();
        }
    };

    // Format the date
    let formattedDate;
    try {
        formattedDate = formatDistanceToNow(new Date(rant.createdAt), {
            addSuffix: true
        });
    } catch (error) {
        console.error("Date formatting error:", error);
        formattedDate = "some time ago";
    }

    // Get content with highlighted search term
    const contentWithHighlight = searchTerm && searchTerm.trim() !== ""
        ? rant.content.replace(
            new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
            '<mark class="bg-yellow-500/30 text-white">$1</mark>'
          )
        : rant.content;

    return (
        <Card
            className={`bg-[#121212] border-[#222] hover:border-[#333] transition-all overflow-hidden ${
                onClick ? "cursor-pointer" : ""
            }`}
            onClick={onClick}
        >
            <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                            style={{ backgroundColor: `${getMoodColor(rant.mood)}33` }}
                        >
                            {getMoodUnicodeEmoji(rant.mood)}
                        </div>
                        <span className="text-sm font-medium text-gray-300">
                            {rant.mood.charAt(0).toUpperCase() + rant.mood.slice(1)}
                        </span>
                    </div>
                    <span className="text-xs text-gray-500">{formattedDate}</span>
                </div>

                <div className="text-gray-200 leading-relaxed">
                    {searchTerm && searchTerm.trim() !== "" ? (
                        <p dangerouslySetInnerHTML={{ __html: contentWithHighlight }} />
                    ) : (
                        <p>{rant.content}</p>
                    )}
                </div>
            </CardContent>

            <CardFooter className="px-5 py-3 border-t border-[#222] flex justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`flex items-center gap-1 text-xs ${
                            isLiked ? "text-red-400" : "text-gray-400"
                        } hover:text-red-400 hover:bg-transparent p-0`}
                        onClick={handleLike}
                        disabled={isLiked}
                    >
                        <HeartIcon className="w-4 h-4" />
                        <span>{rant.likes + (isLiked ? 1 : 0)}</span>
                    </Button>

                    <div className="flex items-center gap-1 text-xs text-gray-400">
                        <MessageCircle className="w-4 h-4" />
                        <span>{rant.comments || 0}</span>
                    </div>
                </div>

                <div className="text-xs text-gray-500">{rant.userAlias || "Anonymous"}</div>
            </CardFooter>
        </Card>
    );
};

export default RantCard;

<!-- RantCard.tsx Old Version -->
import React, { useState, useEffect } from "react";
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
import { v4 as uuidv4 } from "uuid"; // Importing UUID generator
import { highlightText } from "@/lib/utils/highlight";

// Update the RantCardProps interface to include the onClick handler and searchTerm
interface RantCardProps {
    rant: Rant;
    index: number;
    onRemove?: (id: string) => void;
    onClick?: () => void;
    searchTerm?: string;
    onLike?: () => void;
}

const RantCard: React.FC<RantCardProps> = ({ rant, onClick, index = 0, searchTerm = '', onLike }) => {
    const moodColor = getMoodColor(rant.mood);
    const moodEmojiPath = getMoodEmoji(rant.mood);
    const [liked, setLiked] = useState(false);

    // Animation based on mood
    const moodAnimation = getMoodAnimation(rant.mood);

    // Generate authorId and store in localStorage if not present
    const [authorId, setAuthorId] = useState<string>("");

    useEffect(() => {
        // Check if authorId exists in localStorage
        let storedAuthorId = localStorage.getItem("authorId");
        if (!storedAuthorId) {
            // If not, generate and store a new UUID
            storedAuthorId = uuidv4();
            localStorage.setItem("authorId", storedAuthorId);
        }
        // Set the authorId to the state
        setAuthorId(storedAuthorId);
    }, []);

    // console.log("Rendering Rant:", rant); // Debugging line to check the rant being rendered
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
            className="rounded-2xl p-6 cursor-pointer relative backdrop-blur-sm overflow-hidden"
            style={{
                backgroundColor: "rgba(26, 26, 46, 0.25)",
                borderStyle: "solid",
                borderColor: moodColor,
                borderWidth: "1px 1px 5px 1px",
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
            <p className="text-sm text-[#d0d0d0] leading-relaxed mb-4 font-inter break-words">
                {searchTerm ? highlightText(rant.content, searchTerm) : rant.content}
            </p>

            {/* Divider */}
            <div className="h-px w-full bg-[#2e2e2e] my-4" />

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-[#a0a0a0] font-urbanist">
                <span className="flex items-center gap-1">
                    {/* Display Anonymous with the last 3 characters of authorId */}
                    Anonymous #{authorId.slice(-3).toUpperCase()}
                </span>

                <div className="flex gap-4 items-center">
                    {/* Like */}
                    <Tooltip.Provider delayDuration={100}>
                        <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setLiked(!liked);
                                        if (onLike && !liked) {
                                            onLike();
                                        }
                                    }}
                                    aria-label={liked ? "Unlike" : "Like"}
                                    className="hover:scale-110 transition-transform flex items-center gap-1"
                                >
                                    {liked ? (
                                        <HeartFilledIcon className="text-[#FF66B2] hover:text-[#FF87C1] w-4 h-4" />
                                    ) : (
                                        <HeartIcon className="text-[#FF66B2] hover:text-[#FF87C1] w-4 h-4" />
                                    )}
                                    <span>{rant.likes + (liked ? 1 : 0)}</span>
                                </button>
                            </Tooltip.Trigger>
                            <Tooltip.Content asChild side="top" sideOffset={5}>
                                <motion.div
                                    className="text-xs bg-[#1f1f1f] text-white px-2 py-1 rounded-md shadow-md font-urbanist"
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {liked ? "Liked" : "Like"}
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
                                    onClick={(e) => e.stopPropagation()}
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
        </motion.div>
    );
};

// export default RantCard; // Export the RantCard component
export default React.memo(RantCard); // Use React.memo to optimize rendering
