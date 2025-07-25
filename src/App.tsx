import React, { Suspense, lazy, useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, HashRouter, useNavigate, BrowserRouter as DefaultBrowserRouter, HashRouter as DefaultHashRouter } from "react-router-dom";
import { AccessibilityProvider } from "@/components/AccessibilityContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Button from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import '@/lib/i18n';
import '@/styles/accessibility.css';
import '@/styles/fonts.css';
import '@/styles/theme.css';
import { Analytics } from "@vercel/analytics/react";
import { HelmetProvider } from 'react-helmet-async';
import Preloader from './components/Preloader';
import ErrorBoundary from "@/components/ErrorBoundary";

// Lazy load pages for better error isolation
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const MyRantsPage = lazy(() => import("./pages/MyRantsPage"));
const RantPage = lazy(() => import("./pages/RantPage"));
const AdminDashboard = /*#__PURE__*/ lazy(() => import("./admin/AdminDashboard"));

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

    /**
     * The app dynamically switches between BrowserRouter and HashRouter based on the environment.
     * HashRouter is used as a fallback for environments where server-side routing is not supported.
     */
    const RouterComponent = useHashRouter ? DefaultHashRouter : DefaultBrowserRouter;

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
                <Route path="/admin" element={
                    <ErrorBoundary>
                        <AdminProtectedRoute>
                            <AdminDashboard />
                        </AdminProtectedRoute>
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

// Add AdminProtectedRoute component above AppRouter or in a suitable shared location
function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAdmin = async () => {
            // Import supabase client dynamically to avoid circular deps
            const { supabase } = await import("@/lib/supabase");
            const { data: { user } } = await supabase.auth.getUser();
            if (user && user.user_metadata?.is_admin) {
                setIsAdmin(true);
            } else {
                navigate("/", { replace: true });
            }
            setIsLoading(false);
        };
        checkAdmin();
    }, [navigate]);

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen text-xl">Checking admin access...</div>;
    }
    if (!isAdmin) return null;
    return <>{children}</>;
}

const App = () => {
    // Create query client with error handling
    const [queryClient] = useState(() => createQueryClient());

    return (
        <HelmetProvider>
            <ErrorBoundary>
                <AccessibilityProvider>
                    <QueryClientProvider client={queryClient}>
                        <TooltipProvider>
                            <div className="theme-dark">
                                <Toaster />
                                <Sonner />
                                <ErrorBoundary>
                                    <AppRouter />
                                </ErrorBoundary>
                            </div>
                        </TooltipProvider>
                    </QueryClientProvider>
                </AccessibilityProvider>
            </ErrorBoundary>
        </HelmetProvider>
    );
    // <Analytics />
};

export default App;
