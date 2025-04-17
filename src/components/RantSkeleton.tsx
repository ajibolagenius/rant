import React from "react";
import { motion } from "framer-motion";

interface RantSkeletonProps {
    index?: number;
}

const RantSkeleton: React.FC<RantSkeletonProps> = ({ index = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className="rounded-2xl p-6 relative backdrop-blur-sm overflow-hidden h-full"
            style={{
                backgroundColor: "rgba(26, 26, 46, 0.25)",
                borderStyle: "solid",
                borderColor: "#333",
                borderWidth: "1px 1px 5px 1px",
            }}
        >
            {/* Mood Tag Skeleton */}
            <div className="w-9 h-9 rounded-md mb-4 animate-pulse bg-gray-700" />

            {/* Content Skeleton */}
            <div className="space-y-3">
                <div className="h-4 bg-gray-700 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-gray-700 rounded animate-pulse w-full" />
                <div className="h-4 bg-gray-700 rounded animate-pulse w-5/6" />
                <div className="h-4 bg-gray-700 rounded animate-pulse w-2/3" />
            </div>

            {/* Divider */}
            <div className="h-px w-full bg-[#2e2e2e] my-4" />

            {/* Footer Skeleton */}
            <div className="flex items-center justify-between text-xs">
                <div className="h-3 bg-gray-700 rounded animate-pulse w-24" />
                <div className="flex gap-4 items-center">
                    <div className="h-3 bg-gray-700 rounded animate-pulse w-12" />
                    <div className="h-3 bg-gray-700 rounded animate-pulse w-4" />
                    <div className="h-3 bg-gray-700 rounded animate-pulse w-4" />
                </div>
            </div>
        </motion.div>
    );
};

export default RantSkeleton;
