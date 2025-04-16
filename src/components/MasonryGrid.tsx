import React, { useEffect, useState, useRef, useCallback } from "react";
import { Rant } from "@/lib/types/rant";
import { motion } from "framer-motion";
import { getMoodAnimation } from "@/lib/utils/mood";
import RantCard from "./RantCard";

// Helper function to determine column count based on screen width
const getColumnCount = (width: number) => {
    if (width < 640) return 1; // Mobile
    if (width < 768) return 2; // Tablet
    if (width < 1280) return 3; // Small desktop
    return 4; // Large desktop
}

interface MasonryGridProps {
    rants?: Rant[];
    gap?: number;
    onRemove?: (id: string) => void;
    searchTerm?: string;
    onLike?: (id: string) => void;
    onLoadMore?: () => void;
    renderItem?: (rant: Rant, index: number) => React.ReactNode;
}

const MasonryGrid: React.FC<MasonryGridProps> = ({
    rants = [],
    gap = 24,
    searchTerm = "",
    onLike,
    onLoadMore,
    renderItem
}) => {
    const [columns, setColumns] = useState(getColumnCount(window.innerWidth));
    const containerRef = useRef<HTMLDivElement>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    // Handle window resize to adjust column count
    useEffect(() => {
        const handleResize = () => {
            setColumns(getColumnCount(window.innerWidth));
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Simple intersection observer for load more functionality
    useEffect(() => {
        if (!onLoadMore || !loadMoreRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    onLoadMore();
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(loadMoreRef.current);

        return () => {
            if (loadMoreRef.current) {
                observer.unobserve(loadMoreRef.current);
            }
        };
    }, [onLoadMore]);

    // If no rants, show a message
    if (!rants || rants.length === 0) {
        return (
            <div className="text-center text-gray-400 py-10">
                No rants found. Be the first to post one!
            </div>
        );
    }

    // Create column arrays
    const columnRants: Rant[][] = Array.from({ length: columns }, () => []);

    // Distribute rants across columns
    rants.forEach((rant, index) => {
        const columnIndex = index % columns;
        columnRants[columnIndex].push(rant);
    });

    return (
        <div ref={containerRef} className="w-full">
            <div
                className="flex"
                style={{ gap: `${gap}px` }}
            >
                {columnRants.map((columnRants, columnIndex) => (
                    <div
                        key={columnIndex}
                        className="flex-1 flex flex-col"
                        style={{ gap: `${gap}px` }}
                    >
                        {columnRants.map((rant, rantIndex) => {
                            const globalIndex = columnIndex + rantIndex * columns;

                            if (renderItem) {
                                return renderItem(rant, globalIndex);
                            }

                            const moodAnim = getMoodAnimation(rant.mood);

                            return (
                                <motion.div
                                    key={rant.id}
                                    initial={{ opacity: 0, scale: moodAnim.scale, y: moodAnim.y }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{
                                        delay: globalIndex * 0.08,
                                        duration: 1.2,
                                        ease: moodAnim.ease as any
                                    }}
                                    className="w-full overflow-hidden"
                                >
                                    <RantCard
                                        rant={rant}
                                        index={globalIndex}
                                        searchTerm={searchTerm}
                                        onLike={onLike ? () => onLike(rant.id) : undefined}
                                    />
                                </motion.div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Load more trigger element */}
            {onLoadMore && (
                <div ref={loadMoreRef} className="h-10 mt-8" />
            )}
        </div>
    );
};

export default MasonryGrid;
