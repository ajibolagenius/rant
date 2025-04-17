import React, { ComponentType, useState } from "react";
import ErrorBoundary from "./ErrorBoundary";
import FetchErrorFallback from "./FetchErrorFallback";
import { showErrorToast } from "@/lib/errorHandling";

interface WithErrorHandlingProps {
    error?: string | null;
    onRetry?: () => void;
}

/**
 * Higher-order component that adds error handling to any component
 */
export function withErrorHandling<P extends object>(
    Component: ComponentType<P>,
    defaultErrorMessage: string = "An error occurred"
) {
    return function WithErrorHandling(props: P & WithErrorHandlingProps) {
        const { error, onRetry, ...componentProps } = props;

        return (
            <ErrorBoundary>
                {error ? (
                    <FetchErrorFallback
                        message={error || defaultErrorMessage}
                        onRetry={onRetry}
                    />
                ) : (
                    <Component {...(componentProps as P)} />
                )}
            </ErrorBoundary>
        );
    };
}
