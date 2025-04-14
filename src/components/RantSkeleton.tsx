import React from "react";

const RantSkeleton = () => {
    return (
        <div className="rounded-2xl p-6 bg-[] border border-[#2e2e2e] border-b-4 animate-pulse space-y-4">
            {/* Mood tag */}
            <div className="w-9 h-9 rounded-md bg-[#2e2e2e]" />

            {/* Content lines */}
            <div className="h-4 bg-[#2e2e2e] rounded w-full" />
            <div className="h-4 bg-[#2e2e2e] rounded w-5/6" />
            <div className="h-4 bg-[#2e2e2e] rounded w-2/3" />

            {/* Divider */}
            <div className="h-px w-full bg-[#2e2e2e]" />

            {/* Footer */}
            <div className="flex justify-between items-center">
                <div className="h-4 w-20 bg-[#2e2e2e] rounded" />
                <div className="flex gap-4">
                    <div className="h-4 w-4 bg-[#2e2e2e] rounded-full" />
                    <div className="h-4 w-4 bg-[#2e2e2e] rounded-full" />
                    <div className="h-4 w-4 bg-[#2e2e2e] rounded-full" />
                </div>
            </div>
        </div>
    );
};

export default RantSkeleton;
