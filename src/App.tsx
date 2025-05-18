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
import Preloader from './components/Preloader';

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

// Create a query client with error handling
const createQueryClient = () => {
    return new QueryClient({
        defaultOptions: {
            queries: {
                retry: 2,
                refetchOnWindowFocus: false,
            },
            mutations: {
            },
        },
    });
};

// Router component that selects between BrowserRouter and HashRouter
const AppRouter: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
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

    const RouterComponent = useHashRouter ? HashRouter : BrowserRouter;

    return (
        <RouterComponent future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
                <Route path="/" element={
                    <ErrorBoundary>
                        <PreloaderRouteWrapper>
                            <Index />
                        </PreloaderRouteWrapper>
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
                <Route path="*" element={
                    <ErrorBoundary>
                        <NotFound />
                    </ErrorBoundary>
                } />
            </Routes>
            {children}
        </RouterComponent>
    );
};

// PreloaderRouteWrapper: Only show Preloader for the root route
const PreloaderRouteWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [showPreloader, setShowPreloader] = useState(true);
    const [preloaderDone, setPreloaderDone] = useState(false);
    const handlePreloaderDone = () => setPreloaderDone(true);
    useEffect(() => {
        if (preloaderDone) setShowPreloader(false);
    }, [preloaderDone]);
    return showPreloader ? (
        <Preloader show onDone={handlePreloaderDone} />
    ) : (
        <>{children}</>
    );
};

const App = () => {
    // Create query client with error handling
    const [queryClient] = useState(() => createQueryClient());

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
                                        <AppRouter />
                                    </ErrorBoundary>
                                </div>
                            </RantStoreProvider>
                        </TooltipProvider>
                    </QueryClientProvider>
                </AccessibilityProvider>
            </ErrorBoundary>
        </HelmetProvider>
    );
    // <Analytics />
};

export default App;
