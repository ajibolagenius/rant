import React, { useEffect, useState } from "react";
import { Rant } from "@/lib/types/rant";
import { AnimatePresence, motion } from "framer-motion";
import { getMoodAnimationProps } from "@/lib/utils/mood";
import RantCard from "./RantCard";

interface MasonryGridProps {
    rants?: Rant[];
    gap?: number;
    onRemove?: (id: string) => void;
    searchTerm?: string;
}

const getColumnCount = (): number => {
    const width = window.innerWidth;
    if (width < 640) return 1;
    if (width < 1024) return 2;
    if (width < 1280) return 3;
    return 4;
};

const MasonryGrid: React.FC<MasonryGridProps> = ({ rants = [], gap = 24, searchTerm = "" }) => {
    const [columns, setColumns] = useState(getColumnCount());

    useEffect(() => {
        const handleResize = () => setColumns(getColumnCount());
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const columnArrays: Rant[][] = Array.from({ length: columns }, () => []);
    rants.forEach((rant, index) => {
        const columnIndex = index % columns;
        columnArrays[columnIndex].push(rant);
    });

    if (rants.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-medium text-white mb-2">No rants found</h3>
                <p className="text-gray-400 max-w-md">
                    {searchTerm
                        ? `No rants matching "${searchTerm}" were found. Try a different search term or filter.`
                        : "No rants available. Be the first to share your thoughts!"}
                </p>
            </div>
        );
    }

    return (
        <div
            className="grid"
            style={{
                gap: `${gap}px`,
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
            }}
        >
            {columnArrays.map((column, colIndex) => (
                <div key={colIndex} className="flex flex-col gap-6">
                    <AnimatePresence mode="sync">
                        {column.map((rant, index) => {
                            const { initial, animate, transition } = getMoodAnimationProps(rant.mood, index);
                            return (
                                <motion.div
                                    key={rant.id || index}
                                    initial={initial}
                                    animate={animate}
                                    exit={{ opacity: 0, scale: 0.8, y: 20 }}
                                    transition={transition}
                                    className="mb-6" // Add margin bottom to ensure proper spacing
                                >
                                    <RantCard
                                        rant={rant}
                                        index={index}
                                        searchTerm={searchTerm}
                                    />
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );
};

export default MasonryGrid;
