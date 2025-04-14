import React, { useEffect, useState } from "react";
import { Rant } from "@/lib/types/rant";
import { AnimatePresence, motion } from "framer-motion";
import { getMoodAnimationProps } from "@/lib/utils/mood";
import RantCard from "./RantCard";


interface MasonryGridProps {
    rants?: Rant[];
    gap?: number;
    onRemove?: (id: string) => void;
}


const getColumnCount = (): number => {
    const width = window.innerWidth;
    if (width < 640) return 1;
    if (width < 1024) return 2;
    if (width < 1280) return 3;
    return 4;
};

const MasonryGrid: React.FC<MasonryGridProps> = ({ rants = [], gap = 6 }) => {
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
        return <div>No rants available. Be the first.</div>;
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
                                >
                                    <RantCard rant={rant} index={index} />
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
