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
    const { rants, loading, loadMoreRants, likeRant, hasMore, fetchRants } = useRants();
    const isEmpty = rants.length === 0;
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();

    // Parse URL parameters on component mount
    useEffect(() => {
        // Get parameters from URL
        const query = searchParams.get('q');
        const mood = searchParams.get('mood');
        const sort = searchParams.get('sort');

        // Only call fetchRants with reset=true when filters change
        fetchRants(true);
    }, [searchParams, fetchRants]);

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

    // Ensure RantList integrates with responsive MasonryGrid
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
                <MasonryGrid
                    rants={rants}
                    gap={16}
                    searchTerm={searchTerm}
                    onLike={handleLike}
                    onLoadMore={handleLoadMore}
                    isLoading={loading}
                    hasMore={hasMore}
                    renderItem={(rant, index) => (
                        <motion.div
                            key={rant.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                                delay: Math.min(index * 0.05, 0.5),
                                duration: 0.8,
                                ease: "easeOut"
                            }}
                            className="w-full overflow-hidden"
                        >
                            <RantCard
                                rant={rant}
                                index={index}
                                searchTerm={searchTerm}
                                onLike={() => handleLike(rant.id)}
                                onClick={() => { }}
                            />
                        </motion.div>
                    )}
                />
            )}
        </section>
    );
};

export default React.memo(RantList);
