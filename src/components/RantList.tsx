import React, { useCallback } from "react";
import MasonryGrid from "./MasonryGrid";
import { Rant } from "@/lib/types/rant";
import { motion } from "framer-motion";
import { getMoodAnimation } from "@/lib/utils/mood";
import RantCard from "./RantCard";
import { useRants } from "@/components/RantContext";

interface RantListProps {
    onRantClick?: (rant: Rant) => void;
    searchTerm?: string;
}

const RantList: React.FC<RantListProps> = ({
    onRantClick,
    searchTerm = ""
}) => {
    const { rants, loading, loadMoreRants, likeRant, hasMore } = useRants();
    const isEmpty = rants.length === 0;

    // Memoize the loadMore function to prevent unnecessary re-renders
    const handleLoadMore = useCallback(async () => {
        if (!loading && hasMore) {
            try {
                await loadMoreRants();
            } catch (error) {
                console.error("Error loading more rants:", error);
            }
        }
    }, [loading, hasMore, loadMoreRants]);

    return (
        <section className="w-full px-4 sm:px-8 py-10">
            {loading && isEmpty ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="h-10 w-10 bg-gray-700 rounded-full mb-4"></div>
                        <div className="h-4 w-40 bg-gray-700 rounded mb-2"></div>
                        <div className="h-3 w-28 bg-gray-700 rounded"></div>
                    </div>
                </div>
            ) : (
                <>
                    <MasonryGrid
                        rants={rants}
                        gap={24}
                        searchTerm={searchTerm}
                        onLike={likeRant}
                        onLoadMore={handleLoadMore}
                        isLoading={loading}
                        hasMore={hasMore}
                        renderItem={(rant, index) => {
                            const moodAnim = getMoodAnimation(rant.mood);
                            return (
                                <motion.div
                                    key={rant.id}
                                    initial={{ opacity: 0, scale: moodAnim.scale, y: moodAnim.y }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{
                                        delay: Math.min(index * 0.05, 0.5), // Cap the delay to avoid too much staggering
                                        duration: 0.8,
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
                                            onLike={() => likeRant(rant.id)}
                                        />
                                    </div>
                                </motion.div>
                            );
                        }}
                    />

                    {loading && rants.length > 0 && !isEmpty && (
                        <div className="flex justify-center py-6 mt-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
                        </div>
                    )}

                    {!loading && (
                        <>
                            {!hasMore && !isEmpty && (
                                <motion.div
                                    className="text-center text-gray-400 py-6 mt-4"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.8,
                                        ease: "easeOut"
                                    }}
                                >
                                    {/* <motion.span
                                        initial={{ scale: 0.9 }}
                                        animate={{ scale: 1 }}
                                        transition={{
                                            duration: 0.5,
                                            ease: "easeInOut",
                                            repeat: 1,
                                            repeatType: "reverse"
                                        }}
                                    >
                                        No more rants to load
                                    </motion.span> */}
                                </motion.div>
                            )}

                            {isEmpty && (
                                <motion.div
                                    className="text-center text-gray-400 py-10"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{
                                        duration: 0.7,
                                        ease: "easeOut"
                                    }}
                                >
                                    <motion.span
                                        initial={{ y: 0 }}
                                        animate={{ y: [0, -5, 0] }}
                                        transition={{
                                            duration: 1.5,
                                            ease: "easeInOut",
                                            repeat: Infinity,
                                            repeatDelay: 1
                                        }}
                                        style={{ display: "inline-block" }}
                                    >
                                        No rants found. Be the first to post one!
                                    </motion.span>
                                </motion.div>
                            )}
                        </>
                    )}
                </>
            )}
        </section>
    );
};

export default React.memo(RantList);
