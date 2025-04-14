import React from "react";
import MasonryGrid from "./MasonryGrid";
import { Rant } from "@/lib/types/rant";
import { motion } from "framer-motion";
import { getMoodAnimation } from "@/lib/utils/mood";
import RantCard from "./RantCard";

interface RantListProps {
    rants: Rant[];
    onRantClick?: (rant: Rant) => void;
}

const RantList: React.FC<RantListProps> = ({ rants, onRantClick }) => {
    return (
        <section className="w-full px-4 sm:px-8 py-10">
            <MasonryGrid
                rants={rants}
                gap={24}
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
                        >
                            {/* If your RantCard expects an index prop */}
                            <RantCard rant={rant} index={index} />
                        </motion.div>
                    );
                }}
            />
        </section>
    );
};

export default RantList;
