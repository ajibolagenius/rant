import React, { Component, ErrorInfo, ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error("Error caught by ErrorBoundary:", error, errorInfo);
    }

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <Alert className="my-4 border-red-200 bg-red-50">
                    <AlertTitle className="text-red-800">Something went wrong</AlertTitle>
                    <AlertDescription className="text-red-600">
                        {this.state.error?.message || "An unexpected error occurred"}
                    </AlertDescription>
                    <Button
                        variant="outline"
                        className="mt-2"
                        onClick={() => {
                            this.setState({ hasError: false, error: null });
                            window.location.reload();
                        }}
                    >
                        <RefreshCw className="mr-2 h-4 w-4" /> Try again
                    </Button>
                </Alert>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
