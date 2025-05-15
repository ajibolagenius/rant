import React, { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Wifi, WifiOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Component that monitors network status and shows notifications with animations
 */
const NetworkStatusMonitor: React.FC = () => {
    const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
    const [showOnlineIndicator, setShowOnlineIndicator] = useState<boolean>(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            // Show the online indicator briefly when connection is restored
            setShowOnlineIndicator(true);
            setTimeout(() => setShowOnlineIndicator(false), 3000);

            toast({
                title: "You're back online",
                description: "Your connection has been restored.",
                variant: "default",
            });
        };

        const handleOffline = () => {
            setIsOnline(false);
            toast({
                title: "You're offline",
                description: "Check your connection and try again.",
                variant: "destructive",
            });
        };

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    return (
        <AnimatePresence>
            {!isOnline && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                    className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-full bg-destructive/90 px-4 py-2 text-sm text-destructive-foreground shadow-lg backdrop-blur-sm"
                >
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    >
                        <WifiOff className="h-4 w-4" />
                    </motion.div>
                    <span className="font-medium">Offline</span>
                </motion.div>
            )}

            {showOnlineIndicator && isOnline && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                    className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-full bg-green-500/90 px-4 py-2 text-sm text-white shadow-lg backdrop-blur-sm"
                >
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1 }}
                    >
                        <Wifi className="h-4 w-4" />
                    </motion.div>
                    <span className="font-medium">Connected</span>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default NetworkStatusMonitor;
