import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
    title?: string;
    description?: string;
    action?: () => void;
    actionLabel?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    title = "No rants found",
    description = "Be the first to post a rant!",
    action,
    actionLabel = "Start Ranting",
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-16 px-4 text-center"
        >
            {/* Illustration */}
            <div className="w-48 h-48 mb-6 relative">
                <svg
                    viewBox="0 0 200 200"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full"
                >
                    <motion.path
                        d="M100 180c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"
                        fill="#121218"
                        stroke="url(#paint0_linear)"
                        strokeWidth="2"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                    />
                    <motion.path
                        d="M65 95c0-8.284 6.716-15 15-15h40c8.284 0 15 6.716 15 15v30c0 8.284-6.716 15-15 15H80c-8.284 0-15-6.716-15-15V95z"
                        fill="#1A1A2E"
                        stroke="url(#paint1_linear)"
                        strokeWidth="2"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                    />
                    <motion.path
                        d="M75 80v-10c0-13.807 11.193-25 25-25s25 11.193 25 25v10"
                        stroke="url(#paint2_linear)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 1, duration: 1.5 }}
                    />
                    <motion.path
                        d="M82 110h36M82 125h24"
                        stroke="#666"
                        strokeWidth="2"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 1.5, duration: 1 }}
                    />
                    <defs>
                        <linearGradient
                            id="paint0_linear"
                            x1="20"
                            y1="40"
                            x2="180"
                            y2="160"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop stopColor="#00C2FF" />
                            <stop offset="1" stopColor="#904FFF" />
                        </linearGradient>
                        <linearGradient
                            id="paint1_linear"
                            x1="65"
                            y1="95"
                            x2="135"
                            y2="140"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop stopColor="#00C2FF" />
                            <stop offset="1" stopColor="#904FFF" />
                        </linearGradient>
                        <linearGradient
                            id="paint2_linear"
                            x1="75"
                            y1="60"
                            x2="125"
                            y2="80"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop stopColor="#00C2FF" />
                            <stop offset="1" stopColor="#904FFF" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Animated dots */}
                <motion.div
                    className="absolute bottom-10 right-12 w-2 h-2 rounded-full bg-cyan-400"
                    animate={{
                        y: [0, -10, 0],
                        opacity: [0, 1, 0],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "loop",
                        times: [0, 0.5, 1],
                        delay: 0.2,
                    }}
                />
                <motion.div
                    className="absolute bottom-14 right-8 w-2 h-2 rounded-full bg-purple-400"
                    animate={{
                        y: [0, -10, 0],
                        opacity: [0, 1, 0],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "loop",
                        times: [0, 0.5, 1],
                        delay: 0.5,
                    }}
                />
                <motion.div
                    className="absolute bottom-8 right-16 w-2 h-2 rounded-full bg-pink-400"
                    animate={{
                        y: [0, -10, 0],
                        opacity: [0, 1, 0],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "loop",
                        times: [0, 0.5, 1],
                        delay: 0.8,
                    }}
                />
            </div>

            <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
            <p className="text-gray-400 mb-6 max-w-md">{description}</p>

            {action && (
                <Button
                    onClick={action}
                    className="bg-gradient-to-r from-[#00C2FF] to-[#904FFF] hover:opacity-90 transition-all rounded-full px-6 py-5 text-base font-medium shadow-lg shadow-primary/20"
                >
                    {actionLabel}
                </Button>
            )}
        </motion.div>
    );
};

export default EmptyState;
