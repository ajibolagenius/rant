import React, { Suspense, lazy, useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, HashRouter } from "react-router-dom";
import { AccessibilityProvider } from "@/components/AccessibilityContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { RantStoreProvider } from "@/store/RantStore";
import '@/lib/i18n';
import '@/styles/accessibility.css';
import '@/styles/fonts.css';
import '@/styles/theme.css';
import { Analytics } from "@vercel/analytics/react";
import { HelmetProvider } from 'react-helmet-async';

// Error boundary component for catching rendering errors
class ErrorBoundary extends React.Component<
    { children: React.ReactNode, fallback?: React.ReactNode },
    { hasError: boolean, error: Error | null }
> {
    constructor(props: { children: React.ReactNode, fallback?: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("Error caught by ErrorBoundary:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return (
                <div className="min-h-screen flex items-center justify-center p-4 bg-background-dark">
                    <Alert className="max-w-md border-error bg-error/10">
                        <AlertTitle className="text-error">Something went wrong</AlertTitle>
                        <AlertDescription className="text-error/80">
                            {this.state.error?.message || "An unexpected error occurred"}
                        </AlertDescription>
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => {
                                this.setState({ hasError: false, error: null });
                                window.location.reload();
                            }}
                        >
                            <RefreshCw className="mr-2 h-4 w-4" /> Reload Application
                        </Button>
                    </Alert>
                </div>
            );
        }
        return this.props.children;
    }
}

// Lazy load pages for better error isolation
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const MyRantsPage = lazy(() => import("./pages/MyRantsPage"));
const RantPage = lazy(() => import("./pages/RantPage"));

// Loading fallback component
const LoadingFallback = () => (
    <div className="min-h-screen flex items-center justify-center bg-background-dark" role="status" aria-live="polite">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" aria-hidden="true"></div>
        <span className="sr-only">Loading...</span>
    </div>
);

// Create a query client with error handling
const createQueryClient = () => {
    return new QueryClient({
        defaultOptions: {
            queries: {
                retry: 2,
                refetchOnWindowFocus: false,
                onError: (error) => {
                    console.error("Query error:", error);
                },
            },
            mutations: {
                onError: (error) => {
                    console.error("Mutation error:", error);
                },
            },
        },
    });
};

// Router component that selects between BrowserRouter and HashRouter
const AppRouter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Detect if we should use hash-based routing
    const [useHashRouter, setUseHashRouter] = useState(() => {
        return window.location.hash.startsWith('#/') ||
            localStorage.getItem('useHashRouter') === 'true';
    });

    // Effect to handle navigation errors and switch to hash router if needed
    useEffect(() => {
        // Function to handle navigation errors
        const handleNavigationError = () => {
            if (!useHashRouter && window.location.pathname !== '/') {
                console.log("Navigation error detected, switching to hash router");
                localStorage.setItem('useHashRouter', 'true');
                setUseHashRouter(true);

                // Preserve current URL parameters when switching
                const currentParams = new URLSearchParams(window.location.search);
                const paramString = currentParams.toString();
                window.location.href = `${window.location.origin}${window.location.pathname}#/${paramString ? '?' + paramString : ''}`;
            }
        };

        // Listen for popstate events which might indicate navigation issues
        window.addEventListener('popstate', handleNavigationError);

        return () => {
            window.removeEventListener('popstate', handleNavigationError);
        };
    }, [useHashRouter]);

    // Render the appropriate router with future flags to address warnings
    return useHashRouter ? (
        <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            {children}
        </HashRouter>
    ) : (
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            {children}
        </BrowserRouter>
    );
};

const App = () => {
    // Create query client with error handling
    const [queryClient] = useState(() => createQueryClient());

    // Monitor for unhandled errors
    useEffect(() => {
        const handleError = (event: ErrorEvent) => {
            // console.error("Unhandled error:", event.error);
            // We don't show UI here as the ErrorBoundary will catch render errors
        };

        window.addEventListener('error', handleError);
        return () => window.removeEventListener('error', handleError);
    }, []);

    // Monitor for unhandled promise rejections
    useEffect(() => {
        const handleRejection = (event: PromiseRejectionEvent) => {
            // console.error("Unhandled promise rejection:", event.reason);
            // We don't show UI here as it might be handled by query client
        };

        window.addEventListener('unhandledrejection', handleRejection);
        return () => window.removeEventListener('unhandledrejection', handleRejection);
    }, []);

    // Listen for system preference changes for accessibility and theme
    useEffect(() => {
        const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const reducedMotionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

        const handleDarkModeChange = (e: MediaQueryListEvent) => {
            if (localStorage.getItem('theme') === 'system') {
                document.documentElement.classList.toggle('dark', e.matches);
                // Apply our theme classes
                if (e.matches) {
                    document.documentElement.classList.remove('theme-light');
                    document.documentElement.classList.add('theme-dark');
                } else {
                    document.documentElement.classList.remove('theme-dark');
                    document.documentElement.classList.add('theme-light');
                }
            }
        };

        const handleReducedMotionChange = (e: MediaQueryListEvent) => {
            if (!localStorage.getItem('reducedMotion')) {
                document.documentElement.classList.toggle('reduce-motion', e.matches);
            }
        };

        darkModeMediaQuery.addEventListener('change', handleDarkModeChange);
        reducedMotionMediaQuery.addEventListener('change', handleReducedMotionChange);

        // Initialize theme based on saved preference or system preference
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = darkModeMediaQuery.matches;

        if (savedTheme === 'light') {
            document.documentElement.classList.remove('theme-dark');
            document.documentElement.classList.add('theme-light');
        } else if (savedTheme === 'dark' || prefersDark) {
            document.documentElement.classList.remove('theme-light');
            document.documentElement.classList.add('theme-dark');
        }

        return () => {
            darkModeMediaQuery.removeEventListener('change', handleDarkModeChange);
            reducedMotionMediaQuery.removeEventListener('change', handleReducedMotionChange);
        };
    }, []);

    return (
        <HelmetProvider>
            <ErrorBoundary>
                <AccessibilityProvider>
                    <QueryClientProvider client={queryClient}>
                        <TooltipProvider>
                            <RantStoreProvider>
                                <div className="theme-dark">
                                    <Toaster />
                                    <Sonner />
                                    <ErrorBoundary>
                                        <AppRouter>
                                            <Suspense fallback={<LoadingFallback />}>
                                                <Routes>
                                                    <Route path="/" element={
                                                        <ErrorBoundary>
                                                            <Index />
                                                        </ErrorBoundary>
                                                    } />
                                                    <Route path="/my-rants" element={
                                                        <ErrorBoundary>
                                                            <MyRantsPage />
                                                        </ErrorBoundary>
                                                    } />
                                                    <Route path="/rant/:id" element={
                                                        <ErrorBoundary>
                                                            <RantPage />
                                                        </ErrorBoundary>
                                                    } />
                                                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                                                    <Route path="*" element={
                                                        <ErrorBoundary>
                                                            <NotFound />
                                                        </ErrorBoundary>
                                                    } />
                                                </Routes>
                                            </Suspense>
                                        </AppRouter>
                                    </ErrorBoundary>
                                </div>
                            </RantStoreProvider>
                        </TooltipProvider>
                    </QueryClientProvider>
                </AccessibilityProvider>
            </ErrorBoundary>
        </HelmetProvider>
    );
    <Analytics />
};

export default App;
