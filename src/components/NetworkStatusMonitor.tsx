import React, { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Wifi, WifiOff } from "lucide-react";

/**
 * Component that monitors network status and shows notifications
 */
const NetworkStatusMonitor: React.FC = () => {
    const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
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

    // Only render a visual indicator when offline
    if (isOnline) return null;

    return (
        <div className="fixed bottom-4 left-4 z-50 flex items-center rounded-full bg-red-100 px-3 py-1 text-sm text-red-800">
            <WifiOff className="mr-1 h-4 w-4" />
            Offline
        </div>
    );
};

export default NetworkStatusMonitor;
