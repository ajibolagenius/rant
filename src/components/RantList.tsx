import React, { useEffect, useRef } from "react";
import MasonryGrid from "./MasonryGrid";
import { Rant } from "@/lib/types/rant";
import { motion } from "framer-motion";
import { getMoodAnimation } from "@/lib/utils/mood";
import RantCard from "./RantCard";
import { useRants } from "@/contexts/RantContext";

interface RantListProps {
    onRantClick?: (rant: Rant) => void;
    searchTerm?: string;
}

const RantList: React.FC<RantListProps> = ({
    onRantClick,
    searchTerm = ""
}) => {
    const { rants, loading, loadMoreRants, likeRant } = useRants();
    const loadingRef = useRef(loading);

    // Update ref when loading changes
    useEffect(() => {
        loadingRef.current = loading;
    }, [loading]);

    // Handle like action
    const handleLike = (id: string) => {
        likeRant(id);
    };

    return (
        <section className="w-full px-4 sm:px-8 py-10">
            {loading && rants.length === 0 ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="h-10 w-10 bg-gray-700 rounded-full mb-4"></div>
                        <div className="h-4 w-40 bg-gray-700 rounded mb-2"></div>
                        <div className="h-3 w-28 bg-gray-700 rounded"></div>
                    </div>
                </div>
            ) : (
                <MasonryGrid
                    rants={rants}
                    gap={24}
                    searchTerm={searchTerm}
                    onLike={handleLike}
                    onLoadMore={loadMoreRants}
                    renderItem={(rant, index) => {
                        const moodAnim = getMoodAnimation(rant.mood);
                        return (
                            <motion.div
                                key={rant.id}
                                initial={{ opacity: 0, scale: moodAnim.scale, y: moodAnim.y }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{
                                    delay: index * 0.08,
                                    duration: 1.2,
                                    ease: moodAnim.ease as any
                                }}
                                onClick={() => onRantClick?.(rant)}
                                className={`w-full overflow-hidden ${onRantClick ? "cursor-pointer" : ""}`}
                            >
                                <div className="w-full max-w-full overflow-hidden">
                                    <RantCard
                                        rant={rant}
                                        index={index}
                                        searchTerm={searchTerm}
                                        onLike={handleLike ? () => handleLike(rant.id) : undefined}
                                    />
                                </div>
                            </motion.div>
                        );
                    }}
                />
            )}
        </section>
    );
};

export default RantList;
