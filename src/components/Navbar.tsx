import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import Settings from '@/components/Settings';
import MyRants from '@/components/MyRants';
import { AnimatePresence } from "framer-motion";
import { supabase, likeRant } from "@/lib/supabase";
import { getAuthorId } from "@/utils/authorId";
import { toast } from "@/hooks/use-toast";
import { FileTextIcon, SettingsIcon } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

const Navbar: React.FC = () => {
    const [showMyRants, setShowMyRants] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    // Function to safely get author ID with fallback
    const getSafeAuthorId = (): string => {
        try {
            const authorId = getAuthorId();
            if (!authorId) {
                console.warn("Author ID is missing, using anonymous");
                return "anonymous";
            }
            return authorId;
        } catch (error) {
            console.error("Failed to get author ID:", error);
            return "anonymous";
        }
    };

    // Handler for liking rants from "My Rants" view
    const handleLikeRant = async (rantId: string) => {
        try {
            const authorId = getSafeAuthorId();

            // Perform the like operation
            await likeRant(rantId, authorId);
            console.log("Rant liked successfully");
        } catch (error) {
            console.error("Error liking rant:", error);

            toast.error("Failed to like this rant. You may have already liked it.");
        }
    };

    return (
        <>
            <nav className="w-full py-6 px-6 flex justify-between items-center border-b border-[#222222] bg-background-dark">
                <div className="text-primary text-3xl font-bold font-outfit bg-gradient-to-r from-[#6C63FF] to-[#2DD4BF] bg-clip-text text-transparent">rant</div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 mr-4">
                        {/* Theme Toggle Button */}
                        <ThemeToggle />

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowMyRants(true)}
                            className="h-8 w-8 rounded-full text-cyan-400 hover:bg-cyan-900/20 hover:text-cyan-300"
                            aria-label="My Rants"
                            title="My Rants"
                        >
                            <FileTextIcon size={18} />
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowSettings(true)}
                            className="h-8 w-8 rounded-full text-cyan-400 hover:bg-cyan-900/20 hover:text-cyan-300"
                            aria-label="Settings"
                            title="Settings"
                        >
                            <SettingsIcon size={18} />
                        </Button>
                    </div>
                </div>
            </nav>

            {/* My Rants Modal */}
            <AnimatePresence>
                {showMyRants && (
                    <MyRants
                        onClose={() => setShowMyRants(false)}
                        onLike={handleLikeRant}
                    />
                )}
            </AnimatePresence>

            {/* Settings Modal */}
            <AnimatePresence>
                {showSettings && (
                    <Settings onClose={() => setShowSettings(false)} />
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
