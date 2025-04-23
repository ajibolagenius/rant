import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import Settings from '@/components/Settings';
import MyRants from '@/components/MyRants';
import { AnimatePresence } from "framer-motion";
import { supabase, likeRant } from "@/lib/supabase";
import { getAnonymousUserId } from "@/utils/authorId";
import { toast } from "@/hooks/use-toast";
import { FileTextIcon, SettingsIcon } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Navbar: React.FC = () => {
    const [showMyRants, setShowMyRants] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const navigate = useNavigate();

    // Function to safely get author ID with fallback
    const getSafeAuthorId = (): string => {
        try {
            const anonymousUserId = getAnonymousUserId();
            if (!anonymousUserId) {
                console.warn("Author ID is missing, using anonymous");
                return "anonymous";
            }
            return anonymousUserId;
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

    // Common button style class for all icon buttons
    const iconButtonClass = "h-8 w-8 rounded-full text-primary hover:bg-primary/10 hover:text-primary focus:ring-2 focus:ring-accent-teal focus:ring-offset-1 focus:ring-offset-background-dark transition-colors";

    const handleMyRantsClick = () => {
        if (window.matchMedia('(min-width: 1024px)').matches) {
            // Navigate to /my-rants on larger screens
            navigate('/my-rants');
        } else {
            // Open modal on smaller screens
            setShowMyRants(true);
        }
    };

    const logoVariants = {
        initial: { scale: 0.9, opacity: 0 },
        animate: {
            scale: 1,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 260,
                damping: 20,
                duration: 0.7
            }
        },
        hover: {
            scale: 1.05,
            transition: {
                type: "spring",
                stiffness: 400,
                damping: 10
            }
        },
        tap: { scale: 0.95 }
    };

    return (
        <>
            <nav className="w-full py-4 px-6 flex justify-between items-center border-b border-border-subtle bg-background-dark shadow-low">
                <motion.div
                    className="text-3xl font-bold font-heading bg-gradient-to-r from-primary to-accent-teal bg-clip-text text-transparent cursor-pointer"
                    initial="initial"
                    animate="animate"
                    whileHover="hover"
                    whileTap="tap"
                    variants={logoVariants}
                    drag
                    dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                    dragElastic={0.3} // the higher the value, the more "bouncy" the drag
                >
                    rant:
                </motion.div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { }}
                            className={iconButtonClass}
                            aria-label="Toggle Theme"
                            title="Toggle Theme"
                        >
                            <ThemeToggle />
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleMyRantsClick}
                            className={iconButtonClass}
                            aria-label="My Rants"
                            title="My Rants"
                        >
                            <FileTextIcon size={16} />
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowSettings(true)}
                            className={iconButtonClass}
                            aria-label="Settings"
                            title="Settings"
                        >
                            <SettingsIcon size={16} />
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
