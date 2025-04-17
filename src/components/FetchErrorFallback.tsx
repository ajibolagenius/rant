import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface FetchErrorFallbackProps {
    message?: string;
    onRetry?: () => void;
    className?: string;
}

const FetchErrorFallback: React.FC<FetchErrorFallbackProps> = ({
    message = "Failed to load data",
    onRetry,
    className,
}) => {
    return (
        <Alert className={cn("my-4 border-amber-200 bg-amber-50", className)}>
            <AlertTitle className="text-amber-800">Data Loading Error</AlertTitle>
            <AlertDescription className="text-amber-700">
                {message}
            </AlertDescription>
            {onRetry && (
                <Button
                    variant="outline"
                    className="mt-2 border-amber-300 hover:bg-amber-100"
                    onClick={onRetry}
                >
                    <RefreshCw className="mr-2 h-4 w-4" /> Retry
                </Button>
            )}
        </Alert>
    );
};

export default FetchErrorFallback;
