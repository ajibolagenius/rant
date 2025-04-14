import React from "react";
import { Rant } from "@/lib/types/rant";
import RantCard from "@/components/RantCard";
import { MoodType, getMoodLabel } from "@/lib/utils/mood";
import { motion } from "framer-motion";

const moodTypes: MoodType[] = [
    'sad', 'crying', 'angry', 'eyeRoll', 'heartbroken', 'mindBlown', 'speechless',
    'confused', 'tired', 'nervous', 'smiling', 'laughing', 'celebratory',
    'confident', 'loved'
];

const TestMoodAnimations: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#09090B] px-4 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
            {moodTypes.map((mood, i) => {
                const mockRant: Rant = {
                    id: `${i}`,
                    content: `This is a mock rant for the "${getMoodLabel(mood)}" mood.`,
                    mood,
                    createdAt: new Date().toISOString(),
                    likes: 10 + i,
                    comments: 0,
                    userAlias: "PreviewUser",
                };

                return (
                    <motion.div
                        key={mood}
                        initial={{ opacity: 0, scale: 0.8, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{
                            duration: 1.2, // 👈 slow down animation
                            delay: i * 0.1,
                            ease: "easeOut",
                        }}
                    >
                        <RantCard rant={mockRant} />
                    </motion.div>
                );
            })}
        </div>
    );
};

export default TestMoodAnimations;
