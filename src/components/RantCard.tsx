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
    searchTerm?: string; // New prop for highlighting search terms
}

const RantCard: React.FC<RantCardProps> = ({ rant, onClick, index = 0, searchTerm = '' }) => {
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

    return (
        <motion.div
            onClick={onClick} // Added onClick to handle click events
            className="rounded-2xl p-6 cursor-pointer relative backdrop-blur-sm"
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
                borderWidth: "1px 1px 5px 1px",
                boxShadow: "0 5px 20px rgba(0, 0, 0, 0.4)",
                scale: 1.015,
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
                    />
                </div>
            </div>

            {/* Rant content with search term highlighting */}
            <p className="text-sm text-[#d0d0d0] leading-relaxed mb-4 font-inter">
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

export default RantCard;
