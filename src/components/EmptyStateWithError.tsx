import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle, FileQuestion } from "lucide-react";

interface EmptyStateWithErrorProps {
    message?: string;
    isError?: boolean;
    onRetry?: () => void;
    icon?: React.ReactNode;
    actionText?: string;
    secondaryAction?: () => void;
    secondaryActionText?: string;
}

const EmptyStateWithError: React.FC<EmptyStateWithErrorProps> = ({
    message = "No items found",
    isError = false,
    onRetry,
    icon,
    actionText = "Try Again",
    secondaryAction,
    secondaryActionText,
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="mb-4 rounded-full bg-gray-100 p-3">
                {icon || (isError ? (
                    <AlertCircle className="h-8 w-8 text-red-500" />
                ) : (
                    <FileQuestion className="h-8 w-8 text-gray-400" />
                ))}
            </div>

            <h3 className={`text-lg font-medium ${isError ? "text-red-700" : "text-gray-700"}`}>
                {isError ? "Something went wrong" : "Nothing to show"}
            </h3>

            <p className={`mt-2 max-w-md text-sm ${isError ? "text-red-600" : "text-gray-500"}`}>
                {message}
            </p>

            <div className="mt-6 flex space-x-3">
                {onRetry && (
                    <Button
                        variant={isError ? "default" : "outline"}
                        onClick={onRetry}
                        className={isError ? "bg-red-600 hover:bg-red-700" : ""}
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        {actionText}
                    </Button>
                )}

                {secondaryAction && secondaryActionText && (
                    <Button variant="outline" onClick={secondaryAction}>
                        {secondaryActionText}
                    </Button>
                )}
            </div>
        </div>
    );
};

export default EmptyStateWithError;
