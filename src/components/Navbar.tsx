import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Settings from '@/components/Settings';
import MyRants from '@/components/MyRants';
import { AnimatePresence, motion } from "framer-motion";
import { supabase, likeRant } from "@/lib/supabase";
import { getAnonymousUserId } from "@/utils/authorId";
import { toast } from "@/hooks/use-toast";
import { FileTextIcon, SettingsIcon, BellIcon } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
    const [showMyRants, setShowMyRants] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [pushSupported, setPushSupported] = useState(false);
    const [pushEnabled, setPushEnabled] = useState(false);
    const navigate = useNavigate();

    // Track scroll position to determine when to make navbar sticky
    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            setIsScrolled(scrollPosition > 50); // Show sticky nav after scrolling 50px
        };

        window.addEventListener('scroll', handleScroll);

        // Initial check
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Check for push notification support
    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setPushSupported(true);
        }
    }, []);

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

            toast({
                title: 'Error',
                description: 'Failed to like this rant. You may have already liked it.',
                variant: 'error'
            });
        }
    };

    // Push Notification Subscription
    const subscribeToPush = async () => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            toast({ title: 'Push not supported', description: 'Your browser does not support push notifications.' });
            return;
        }
        try {
            const reg = await navigator.serviceWorker.ready;

            const vapidPublicKey = 'BOEt_7zXjc8BfH4RyU8NnijB2eo2W_rhx70UgAEY7i5l8hkBPCDlF7nPEk07K2ciky7vaasCdDiTuq7Wg5NPKs8';
            const subscription = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
            });

            // Send subscription to backend
            await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(subscription)
            });

            setPushEnabled(true);
            toast({ title: 'Notifications enabled', description: 'You will get notified about trending rants.' });
        } catch (err) {
            toast({ title: 'Permission denied', description: 'Push notifications were not enabled.' });
        }
    };

    function urlBase64ToUint8Array(base64String: string) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

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

    // Navbar animation variants for sticky behavior
    const navbarVariants = {
        hidden: { y: -100, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 30
            }
        }
    };

    return (
        <>
            <motion.nav
                className={`w-full py-4 px-6 flex justify-between items-center border-b border-border-subtle bg-background-dark shadow-low ${isScrolled ? 'fixed top-0 left-0 right-0 z-50' : ''
                    }`}
                initial={isScrolled ? "hidden" : "visible"}
                animate="visible"
                variants={isScrolled ? navbarVariants : undefined}
            >
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

                    {/* Push Notification Icon with Red Dot if Enabled */}
                    {pushSupported && (
                        <div className="relative">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={!pushEnabled ? subscribeToPush : undefined}
                                className={iconButtonClass}
                                aria-label={pushEnabled ? "Notifications Enabled" : "Enable Notifications"}
                                title={pushEnabled ? "Notifications Enabled" : "Enable Notifications"}
                            >
                                <BellIcon size={16} />
                            </Button>
                            {pushEnabled && (
                                <span
                                    className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 border-2 border-background-dark shadow"
                                    aria-label="Notifications enabled"
                                />
                            )}
                        </div>
                    )}
                </div>
            </motion.nav>

            {/* Add a spacer when navbar is fixed to prevent content jump */}
            {isScrolled && <div className="h-[60px]" />}

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
