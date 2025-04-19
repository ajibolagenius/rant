import React, { useCallback, useEffect } from "react";
import MasonryGrid from "./MasonryGrid";
import { Rant } from "@/lib/types/rant";
import { motion } from "framer-motion";
import { getMoodAnimation } from "@/lib/utils/mood";
import RantCard from "./RantCard";
import { useRants } from "@/components/RantContext";
import { useSearchParams, useLocation } from "react-router-dom";

interface RantListProps {
    onRantClick?: (rant: Rant) => void;
    searchTerm?: string;
}

const RantList: React.FC<RantListProps> = ({
    onRantClick,
    searchTerm = ""
}) => {
    const { rants, loading, loadMoreRants, likeRant, hasMore, filterByMoods, sortBy, searchRants } = useRants();
    const isEmpty = rants.length === 0;
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();

    // Parse URL parameters on component mount
    useEffect(() => {
        // Get parameters from URL
        const query = searchParams.get('q');
        const mood = searchParams.get('mood');
        const moodsParam = searchParams.get('moods');
        const sort = searchParams.get('sort');

        // Apply filters based on URL parameters
        if (moodsParam) {
            const moods = moodsParam.split(',').filter(Boolean);
            if (moods.length > 0 && filterByMoods) {
                filterByMoods(moods);
            }
        }

        if (sort && sortBy) {
            sortBy(sort);
        }

        if ((query || mood) && searchRants) {
            searchRants(query || '', mood || null);
        }
    }, [searchParams, filterByMoods, sortBy, searchRants]);

    // Update URL when filters change
    const updateUrlParams = useCallback((params: Record<string, string | null>) => {
        const newParams = new URLSearchParams(searchParams);

        // Update or remove each parameter
        Object.entries(params).forEach(([key, value]) => {
            if (value === null) {
                newParams.delete(key);
            } else {
                newParams.set(key, value);
            }
        });

        // Update URL without page reload
        setSearchParams(newParams, { replace: true });

        // For better SEO and sharing, also update the browser history
        const newUrl = `${window.location.pathname}${newParams.toString() ? '?' + newParams.toString() : ''}`;
        window.history.replaceState(null, '', newUrl);
    }, [searchParams, setSearchParams]);

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

    // Handle like with URL parameter preservation
    const handleLike = useCallback((rantId: string) => {
        likeRant(rantId);
    }, [likeRant]);

    return (
        <section className="w-full px-2 sm:px-4 md:px-8 py-6 sm:py-10">
            {loading && isEmpty ? (
                <div className="flex justify-center items-center py-12 sm:py-20">
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gray-700 rounded-full mb-4"></div>
                        <div className="h-3 sm:h-4 w-32 sm:w-40 bg-gray-700 rounded mb-2"></div>
                        <div className="h-2 sm:h-3 w-24 sm:w-28 bg-gray-700 rounded"></div>
                    </div>
                </div>
            ) : (
                <>
                    <MasonryGrid
                        rants={rants}
                        gap={16}
                        searchTerm={searchTerm}
                        onLike={handleLike}
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
                                            onLike={() => handleLike(rant.id)}
                                        />
                                    </div>
                                </motion.div>
                            );
                        }}
                    />

                    {loading && rants.length > 0 && !isEmpty && (
                        <div className="flex justify-center py-4 sm:py-6 mt-2 sm:mt-4">
                            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-t-2 border-b-2 border-cyan-500"></div>
                        </div>
                    )}

                    {!loading && (
                        <>
                            {!hasMore && !isEmpty && (
                                <motion.div
                                    className="text-center text-gray-400 py-4 sm:py-6 mt-2 sm:mt-4 text-sm sm:text-base"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.8,
                                        ease: "easeOut"
                                    }}
                                >
                                    You've reached the end of the rants! Come back later for more.
                                </motion.div>
                            )}

                            {isEmpty && (
                                <motion.div
                                    className="text-center text-gray-400 py-8 sm:py-10"
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
                                        className="text-sm sm:text-base"
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
