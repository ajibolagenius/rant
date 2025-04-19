import React, { useState, useEffect, useRef, useMemo } from "react";
import { Rant } from "@/lib/types/rant";
import { generateAlias, MoodType } from "@/lib/utils/mood";
import RantForm from "@/components/RantForm";
import SortingBar from "@/components/SortingBar";
import MasonryGrid from "@/components/MasonryGrid";
import IntroSection from "@/components/IntroSection";
import { toast } from "@/hooks/use-toast";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createFuzzySearcher, performFuzzySearch } from "@/lib/utils/fuzzySearch";
import { parseSearchQuery } from "@/utils/searchParser";
import { supabase, fetchRants, addRant, likeRant } from "@/lib/supabase";
import { getAuthorId } from "@/utils/authorId";
import { useRants } from '@/components/RantContext';
import RantCard from "@/components/RantCard";
import { motion, AnimatePresence } from "framer-motion";
import { getMoodAnimation, getMoodLabel } from "@/lib/utils/mood";
import RantSkeleton from "@/components/RantSkeleton";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import EmptyState from "@/components/EmptyState";
import Confetti from "@/components/Confetti";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import KeyboardShortcutsDialog from "@/components/KeyboardShortcutsDialog";
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import {
    getUrlParams,
    parseMoodFilters,
    parseSearchParams,
    getSortOption,
    updateUrlParams,
    isHashBasedRouting
} from '@/utils/urlUtils';
import { useMoodKeyboardShortcuts } from '@/hooks/useMoodKeyboardShortcuts';

type SortOption = "latest" | "popular" | "filter" | "search";

// Error boundary component for catching rendering errors
class RantErrorBoundary extends React.Component<
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
        console.error("Error caught by RantErrorBoundary:", error, errorInfo);
    }

    render() {
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
                        onClick={() => this.setState({ hasError: false, error: null })}
                    >
                        <RefreshCw className="mr-2 h-4 w-4" /> Try again
                    </Button>
                </Alert>
            );
        }
        return this.props.children;
    }
}

const Index: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [rantList, setRantList] = useState<Rant[]>([]);
    const [sortOption, setSortOption] = useState<SortOption>("latest");
    const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchMood, setSearchMood] = useState<MoodType | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const [shortcutsDialogOpen, setShortcutsDialogOpen] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [usingHashRouter, setUsingHashRouter] = useState(isHashBasedRouting());
    const [optimisticRantIds, setOptimisticRantIds] = useState<Set<string>>(new Set());


    // State for auto-loading rants
    const [autoLoadFailed, setAutoLoadFailed] = useState(false);
    const loadMoreTriggerRef = useRef<HTMLDivElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

    // Increase the initial batch size for faster first load
    const INITIAL_LIMIT = 30; // More rants on first load
    const SUBSEQUENT_LIMIT = 20; // Fewer on subsequent loads to maintain performance

    const rantFormRef = useRef<HTMLDivElement>(null);
    const rantsListRef = useRef<HTMLDivElement>(null);
    const submittedRantIds = useRef<Set<string>>(new Set());

    // Get the rant context - but make it optional to avoid errors if not available
    let rantContext;
    try {
        rantContext = useRants();
    } catch (error) {
        console.warn("RantContext not available, using local state only");
    }

    // Create fuzzy searcher with memoization
    const fuzzySearcher = useMemo(() => createFuzzySearcher(rantList), [rantList]);

    // Function to safely parse URL parameters
    const safeParseUrlParams = () => {
        try {
            // Check if we should use hash-based routing
            const isHashRouting = isHashBasedRouting();
            setUsingHashRouter(isHashRouting);

            // Get parameters from either hash or search params
            const params = getUrlParams();

            // Get sort option from URL
            const sort = getSortOption(params) as SortOption;

            // Get mood filters from URL
            const moods = parseMoodFilters(params);

            // Get search parameters from URL
            const { query, mood } = parseSearchParams(params);

            return { query, mood, moods, sort, isHashRouting };
        } catch (err) {
            console.error("Error parsing URL parameters:", err);
            return {
                query: null,
                mood: null,
                moods: [],
                sort: null as SortOption | null,
                isHashRouting: false
            };
        }
    };

    // Use the mood keyboard shortcuts hook for multiple mood selection
    useMoodKeyboardShortcuts({
        onMoodToggle: (mood) => {
            toggleMoodSelection(mood as string);
        },
        onClearAll: () => clearAllFilters(),
        isEnabled: !shortcutsDialogOpen // Disable when shortcuts dialog is open
    });

    // Define keyboard shortcuts including multiple mood selection
    const shortcuts = useKeyboardShortcuts([
        {
            key: "n",
            action: () => scrollToRantForm(),
            description: "New rant",
        },
        {
            key: "e",
            action: () => scrollToRantsList(),
            description: "Explore rants",
        },
        {
            key: "l",
            action: () => handleSortChange("latest"),
            description: "Sort by latest",
        },
        {
            key: "p",
            action: () => handleSortChange("popular"),
            description: "Sort by popular",
        },
        {
            key: "f",
            action: () => handleSortChange("filter"),
            description: "Filter rants",
        },
        {
            key: "s",
            action: () => handleSortChange("search"),
            description: "Search rants",
        },
        {
            key: "?",
            action: () => setShortcutsDialogOpen(true),
            description: "Show keyboard shortcuts",
        },
        {
            key: "t",
            action: () => window.scrollTo({ top: 0, behavior: "smooth" }),
            description: "Scroll to top",
        },
        // Mood selection shortcuts with Shift key
        {
            key: "Shift+s",
            action: () => toggleMoodSelection("sad"),
            description: "Sad Mood",
            category: "Mood Filtering"
        },
        {
            key: "Shift+y",
            action: () => toggleMoodSelection("crying"),
            description: "Crying Mood",
            category: "Mood Filtering"
        },
        {
            key: "Shift+a",
            action: () => toggleMoodSelection("angry"),
            description: "Angry Mood",
            category: "Mood Filtering"
        },
        {
            key: "Shift+e",
            action: () => toggleMoodSelection("eyeRoll"),
            description: "Eye Roll Mood",
            category: "Mood Filtering"
        },
        {
            key: "Shift+b",
            action: () => toggleMoodSelection("heartbroken"),
            description: "Heartbroken Mood",
            category: "Mood Filtering"
        },
        {
            key: "Shift+m",
            action: () => toggleMoodSelection("mindBlown"),
            description: "Mind Blown Mood",
            category: "Mood Filtering"
        },
        {
            key: "Shift+p",
            action: () => toggleMoodSelection("speechless"),
            description: "Speechless Mood",
            category: "Mood Filtering"
        },
        {
            key: "Shift+c",
            action: () => toggleMoodSelection("confused"),
            description: "Confused Mood",
            category: "Mood Filtering"
        },
        {
            key: "Shift+t",
            action: () => toggleMoodSelection("tired"),
            description: "Tired Mood",
            category: "Mood Filtering"
        },
        {
            key: "Shift+n",
            action: () => toggleMoodSelection("nervous"),
            description: "Nervous Mood",
            category: "Mood Filtering"
        },
        {
            key: "Shift+g",
            action: () => toggleMoodSelection("smiling"),
            description: "Smiling Mood",
            category: "Mood Filtering"
        },
        {
            key: "Shift+f",
            action: () => toggleMoodSelection("laughing"),
            description: "Laughing Mood",
            category: "Mood Filtering"
        },
        {
            key: "Shift+d",
            action: () => toggleMoodSelection("celebratory"),
            description: "Celebratory Mood",
            category: "Mood Filtering"
        },
        {
            key: "Shift+o",
            action: () => toggleMoodSelection("confident"),
            description: "Confident Mood",
            category: "Mood Filtering"
        },
        {
            key: "Shift+l",
            action: () => toggleMoodSelection("loved"),
            description: "Loved Mood",
            category: "Mood Filtering"
        },
        {
            key: "Escape",
            action: () => clearAllFilters(),
            description: "Clear all filters",
            category: "Mood Filtering"
        },
    ]);

    // Function to toggle a mood in the selection
    const toggleMoodSelection = (mood: string) => {
        setSelectedMoods(prev => {
            // If mood is already selected, remove it
            if (prev.includes(mood)) {
                const newMoods = prev.filter(m => m !== mood);

                // If removing the last mood, switch back to latest
                if (newMoods.length === 0 && sortOption === "filter") {
                    setSortOption("latest");
                    updateUrlParams({
                        sort: null,
                        moods: null
                    }, setSearchParams);
                    return [];
                }

                // Otherwise update the moods list
                updateUrlParams({
                    moods: newMoods.length > 0 ? newMoods.join(',') : null
                }, setSearchParams);
                return newMoods;
            }
            // If mood is not selected, add it
            else {
                const newMoods = [...prev, mood];

                // If this is the first mood, switch to filter mode
                if (prev.length === 0) {
                    setSortOption("filter");
                    updateUrlParams({
                        sort: "filter",
                        moods: newMoods.join(',')
                    }, setSearchParams);
                } else {
                    updateUrlParams({
                        moods: newMoods.join(',')
                    }, setSearchParams);
                }

                return newMoods;
            }
        });

        // Show toast notification for better UX
        toast({
            title: `Mood Filter: ${getMoodLabel(mood as MoodType)}`,
            description: selectedMoods.includes(mood)
                ? `Removed ${getMoodLabel(mood as MoodType)} filter`
                : `Added ${getMoodLabel(mood as MoodType)} filter`,
            variant: "default",
        });
    };

    // Function to clear all filters
    const clearAllFilters = () => {
        setSelectedMoods([]);
        setSearchQuery("");
        setSearchMood(null);
        setSortOption("latest");
        updateUrlParams({
            sort: null,
            moods: null,
            q: null,
            mood: null
        }, setSearchParams);

        toast({
            title: "Filters Cleared",
            description: "All filters have been reset",
            variant: "default",
        });
    };

    useEffect(() => {
        // Set up real-time subscription for new rants
        const subscription = supabase
            .channel('public:rants')
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'rants' },
                (payload) => {
                    // When a new rant is inserted, add it to our state
                    const newRant = payload.new as Rant;

                    // Only add if we don't already have this rant
                    if (!submittedRantIds.current.has(newRant.id)) {
                        setRantList(prevRants => [newRant, ...prevRants]);

                        // Show visual feedback
                        setShowNewRantNotification(true);

                        // Trigger animation for the new rant
                        setNewRantId(newRant.id);
                    }
                })
            .subscribe();

        // Cleanup subscription on unmount
        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // Add these new state variables
    const [showNewRantNotification, setShowNewRantNotification] = useState(false);
    const [newRantId, setNewRantId] = useState<string | null>(null);

    // Fetch rants when the component mounts
    useEffect(() => {
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        // Create a new observer
        observerRef.current = new IntersectionObserver(
            async (entries) => {
                const [entry] = entries;
                if (entry.isIntersecting && !loading && hasMore) {
                    try {
                        setAutoLoadFailed(false);
                        await loadMoreRants();
                    } catch (error) {
                        console.error("Error auto-loading more rants:", error);
                        setAutoLoadFailed(true);
                    }
                }
            },
            {
                // Increase rootMargin to start loading even earlier
                rootMargin: '500px', // Increased from 300px to 500px
                threshold: 0.1
            }
        );

        // Start observing the trigger element
        if (loadMoreTriggerRef.current) {
            observerRef.current.observe(loadMoreTriggerRef.current);
        }

        // Clean up on unmount
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [loading, hasMore, page]); // Re-create observer when these dependencies change

    // Initialize from URL params on load and when URL changes
    useEffect(() => {
        try {
            const { query, mood, moods, sort, isHashRouting } = safeParseUrlParams();

            // Set state based on URL parameters
            if (query) {
                setSearchQuery(query);
                setSortOption("search");
            }

            if (mood) {
                setSearchMood(mood);
                setSortOption("search");
            }

            if (moods.length > 0) {
                setSelectedMoods(moods);
                setSortOption("filter");
            }

            if (sort && !query && !mood && moods.length === 0) {
                setSortOption(sort);
            }

            // Reset pagination when filters change
            setPage(0);
            setHasMore(true);

            // Load initial rants
            loadRants(true);
        } catch (err) {
            console.error("Error initializing from URL params:", err);
            setError("Failed to initialize filters. Using defaults.");
            // Fall back to default settings
            setSortOption("latest");
            setSelectedMoods([]);
            setSearchQuery("");
            setSearchMood(null);
            loadRants(true);
        }
    }, [location.search, location.hash]); // React to changes in both search params and hash

    // Load more rants when the page changes
    useEffect(() => {
        return () => {
            if (loadMoreRantsTimeoutRef.current) {
                clearTimeout(loadMoreRantsTimeoutRef.current);
            }
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, []);

    // Function to safely get author ID with fallback
    const getSafeAuthorId = (): string => {
        try {
            const authorId = getAuthorId();
            if (!authorId) {
                console.warn("Author ID is missing, using anonymous");
                return "anonymous";
            }
            return authorId;
        } catch (error) {
            console.error("Failed to get author ID:", error);
            return "anonymous";
        }
    };

    // Function to safely handle mood values
    const getSafeMood = (mood: MoodType | null): MoodType => {
        if (!mood) {
            return "neutral" as MoodType;
        }

        const validMoods = ["happy", "sad", "angry", "surprised", "neutral"];
        return validMoods.includes(mood) ? mood : "neutral" as MoodType;
    };

    // Function to load rants from Supabase with error handling
    const loadRants = async (reset = false) => {
        if (loading && !reset) return;

        setLoading(true);
        setError(null);

        try {
            const offset = reset ? 0 : page * SUBSEQUENT_LIMIT;
            const limit = reset ? INITIAL_LIMIT : SUBSEQUENT_LIMIT;
            const from = offset;
            const to = offset + limit - 1;

            let query = supabase
                .from('rants')
                .select('id, content, mood, author_id, likes, created_at')
                .range(from, to);

            // Apply filters based on sort option
            if (sortOption === "popular") {
                query = query.order('likes', { ascending: false });
            } else {
                query = query.order('created_at', { ascending: false });
            }

            // Apply mood filters if in filter mode
            if (sortOption === "filter" && selectedMoods.length > 0) {
                query = query.in('mood', selectedMoods);
            }

            // Apply search filters if in search mode
            if (sortOption === "search") {
                if (searchQuery) {
                    query = query.ilike('content', `%${searchQuery}%`);
                }

                if (searchMood) {
                    query = query.eq('mood', searchMood);
                }
            }

            const { data, error: supabaseError } = await query;

            if (supabaseError) {
                throw new Error(supabaseError.message);
            }

            if (!Array.isArray(data)) {
                throw new Error("Invalid response format from server");
            }

            if (data.length < limit) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }

            // If resetting, replace the list; otherwise append
            if (reset) {
                setRantList(data);
                setPage(0);
            } else {
                // Prevent duplicates when loading more
                setRantList(prev => {
                    const existingIds = new Set(prev.map(rant => rant.id));
                    const newRants = data.filter(rant => !existingIds.has(rant.id));
                    return [...prev, ...newRants];
                });
                setPage(prev => prev + 1);
            }

            // Reset retry count on successful fetch
            setRetryCount(0);
        } catch (err) {
            console.error("Failed to fetch rants:", err);
            setError("Failed to load rants. Please try again later.");

            // Only show toast if this is the first error
            if (retryCount === 0) {
                toast({
                    title: "Error",
                    description: "Failed to load rants. Please try again later.",
                    variant: "destructive",
                });
            }
        } finally {
            setLoading(false);
        }
    };

    // Load more rants when user scrolls to bottom with debounce
    const loadMoreRantsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const loadMoreRants = async () => {
        if (loading || !hasMore) return;

        // Clear any existing timeout
        if (loadMoreRantsTimeoutRef.current) {
            clearTimeout(loadMoreRantsTimeoutRef.current);
        }

        try {
            // Reduce debounce time for faster response
            loadMoreRantsTimeoutRef.current = setTimeout(async () => {
                await loadRants();
                setAutoLoadFailed(false); // Reset failure state on success
            }, 150); // Reduced from 300ms to 150ms
        } catch (error) {
            console.error("Failed to load more rants:", error);
            setAutoLoadFailed(true); // Set failure state to show manual button
        }
    };

    // Make sure to clean up the timeout in a useEffect
    useEffect(() => {
        return () => {
            if (loadMoreRantsTimeoutRef.current) {
                clearTimeout(loadMoreRantsTimeoutRef.current);
            }
        };
    }, []);

    // Update URL when filters or search change
    useEffect(() => {
        try {
            // Prepare parameters
            const params: Record<string, string | null> = {};

            // Add search params if in search mode
            if (sortOption === "search") {
                params.sort = sortOption;

                if (searchQuery) {
                    params.q = searchQuery;
                } else {
                    params.q = null;
                }

                if (searchMood) {
                    params.mood = searchMood;
                } else {
                    params.mood = null;
                }
            }
            // Add mood filters if in filter mode
            else if (sortOption === "filter") {
                params.sort = sortOption;

                if (selectedMoods.length > 0) {
                    params.moods = selectedMoods.join(',');
                } else {
                    params.moods = null;
                }

                // Clear search params if we're not in search mode
                params.q = null;
                params.mood = null;
            }
            // For other sort options
            else {
                // Only include sort option if it's not the default
                params.sort = sortOption !== "latest" ? sortOption : null;

                // Clear filter and search params
                params.moods = null;
                params.q = null;
                params.mood = null;
            }

            // Update URL parameters
            updateUrlParams(params, setSearchParams);
        } catch (err) {
            console.error("Error updating URL params:", err);
            // Don't set error state here to avoid UI disruption
        }
    }, [sortOption, selectedMoods, searchQuery, searchMood]);

    // Set up real-time subscription for new rants
    useEffect(() => {
        // console.log("Setting up real-time subscription");
        let subscription;

        try {
            subscription = supabase
                .channel('public:rants')
                .on('INSERT', payload => {
                    // Add the new rant to the list if it matches current filters
                    const newRant = payload.new as Rant;
                    console.log("New rant received:", newRant);

                    // Skip if this is a rant we just submitted to prevent duplicates
                    if (submittedRantIds.current.has(newRant.id)) {
                        // Remove from the set after a short delay to allow for potential
                        // network race conditions
                        setTimeout(() => {
                            submittedRantIds.current.delete(newRant.id);
                        }, 5000);
                        return;
                    }

                    // Only add if it matches current filters
                    let shouldAdd = true;

                    if (sortOption === "filter" && selectedMoods.length > 0) {
                        shouldAdd = selectedMoods.includes(newRant.mood);
                    }

                    if (shouldAdd) {
                        setRantList(prev => {
                            // Check if the rant is already in the list to prevent duplicates
                            if (prev.some(rant => rant.id === newRant.id)) {
                                return prev;
                            }
                            return [newRant, ...prev];
                        });
                    }
                })
                .on('UPDATE', payload => {
                    // Update existing rant (e.g., when likes change)
                    const updatedRant = payload.new as Rant;
                    console.log("Rant updated:", updatedRant);
                    setRantList(prev =>
                        prev.map(rant =>
                            rant.id === updatedRant.id ? updatedRant : rant
                        )
                    );
                })
                .subscribe();
        } catch (err) {
            // console.error("Error setting up real-time subscription:", err);
            // Don't show error to user as this is non-critical
        }

        return () => {
            try {
                // console.log("Unsubscribing from real-time updates");
                if (subscription) {
                    subscription.unsubscribe();
                }
            } catch (err) {
                console.error("Error unsubscribing from real-time updates:", err);
            }
        };
    }, [sortOption, selectedMoods]);

    const handleRantSubmit = async (content: string, mood: MoodType) => {
        try {
            const authorId = getSafeAuthorId();
            const safeMood = getSafeMood(mood);

            // Generate a unique ID for the rant to prevent duplicates
            const rantId = crypto.randomUUID();

            // Add to tracking set to prevent duplicate display from real-time subscription
            submittedRantIds.current.add(rantId);

            // Create optimistic rant for immediate UI update
            const optimisticRant: Rant = {
                id: rantId,
                content,
                mood: safeMood,
                author_id: authorId,
                likes: 0,
                created_at: new Date().toISOString(),
                // Add a flag to indicate this is an optimistic update
                is_optimistic: true
            };

            // Optimistically add to the list to improve perceived performance
            setRantList(prev => [optimisticRant, ...prev]);

            console.log("Submitting rant:", { content, mood: safeMood, authorId, rantId });

            // Show confetti animation
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);

            // Actually submit the rant
            const newRant = await addRant({
                id: rantId,
                content,
                mood: safeMood,
                author_id: authorId
            });

            console.log("Rant submitted successfully:", newRant);

            // Share the rant with the context if it exists
            if (rantContext && rantContext.addRant) {
                try {
                    rantContext.addRant(newRant);
                } catch (contextError) {
                    console.error("Error updating rant context:", contextError);
                    // Continue execution - this is non-critical
                }
            }

            toast({
                title: "Rant Posted!",
                description: "Your rant has been posted anonymously.",
                variant: "default",
            });
        } catch (error) {
            console.error("Error posting rant:", error);

            // Remove the optimistic rant on error
            setRantList(prev => prev.filter(rant => !submittedRantIds.current.has(rant.id)));
            submittedRantIds.current.delete(rantId);

            toast({
                title: "Error",
                description: "Failed to post your rant. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleLikeRant = async (rantId: string) => {
        try {
            const authorId = getSafeAuthorId();
            console.log("Liking rant:", rantId, "by author:", authorId);

            // Optimistically update the UI first for better user experience
            setRantList(prev =>
                prev.map(rant =>
                    rant.id === rantId
                        ? { ...rant, likes: rant.likes + 1 }
                        : rant
                )
            );

            // Then perform the actual like operation
            await likeRant(rantId, authorId);
            console.log("Rant liked successfully");

            // Update the context if it exists
            if (rantContext && rantContext.likeRant) {
                try {
                    rantContext.likeRant(rantId);
                } catch (contextError) {
                    console.error("Error updating rant context:", contextError);
                    // Continue execution - this is non-critical
                }
            }
        } catch (error) {
            console.error("Error liking rant:", error);

            // Revert the optimistic update if there was an error
            setRantList(prev =>
                prev.map(rant =>
                    rant.id === rantId
                        ? { ...rant, likes: Math.max(0, rant.likes - 1) }
                        : rant
                )
            );

            toast({
                title: "Error",
                description: "Failed to like this rant. You may have already liked it.",
                variant: "destructive",
            });
        }
    };

    // Add the handleRemoveRant function that was missing
    const handleRemoveRant = (id: string) => {
        try {
            // Remove from local state
            setRantList(prevRants => prevRants.filter(rant => rant.id !== id));

            // If using the rant context, also update it
            if (rantContext && rantContext.removeRant) {
                rantContext.removeRant(id);
            }

            toast({
                title: "Rant Removed",
                description: "The rant has been removed successfully.",
                variant: "default",
            });
        } catch (error) {
            console.error("Error removing rant:", error);

            toast({
                title: "Error",
                description: "Failed to remove the rant. Please try again.",
                variant: "destructive",
            });
        }
    };

    const scrollToRantForm = () => {
        try {
            rantFormRef.current?.scrollIntoView({ behavior: "smooth" });
        } catch (error) {
            console.error("Error scrolling to rant form:", error);
            // Fallback to regular scroll
            rantFormRef.current?.scrollIntoView();
        }
    };

    const scrollToRantsList = () => {
        try {
            rantsListRef.current?.scrollIntoView({ behavior: "smooth" });
        } catch (error) {
            console.error("Error scrolling to rants list:", error);
            // Fallback to regular scroll
            rantsListRef.current?.scrollIntoView();
        }
    };

    // Handle filter change
    const handleFilterChange = (moods: string[]) => {
        // Handle edge case where moods array might contain empty strings
        const validMoods = moods.filter(Boolean);
        setSelectedMoods(validMoods);

        if (validMoods.length > 0) {
            setSortOption("filter");
        } else if (sortOption === "filter") {
            // If no moods selected and we're in filter mode, switch to latest
            setSortOption("latest");
        }
    };

    // Handle sort change
    const handleSortChange = (option: SortOption) => {
        setSortOption(option);

        // If changing away from filter mode and no moods are selected, clear moods
        if (option !== "filter" && selectedMoods.length === 0) {
            setSelectedMoods([]);
        }

        // If changing away from search mode, clear search params
        if (option !== "search") {
            setSearchQuery("");
            setSearchMood(null);
        }

        // Reset pagination when sort changes
        setPage(0);
        setHasMore(true);
    };

    // Handle search - now with advanced search capabilities
    const handleSearch = (query: string, mood: MoodType | null) => {
        setSearchQuery(query);
        setSearchMood(mood);
        if (query || mood) {
            setSortOption("search");
        } else if (sortOption === "search") {
            setSortOption("latest");
        }

        // Reset pagination when search changes
        setPage(0);
        setHasMore(true);
    };

    // Function to handle retry when loading fails
    const handleRetry = () => {
        setRetryCount(prev => prev + 1);
        setError(null);
        loadRants(true);
    };

    // Custom render function for MasonryGrid with error handling
    const renderRantItem = (rant: Rant, index: number) => {
        // Validate rant data to prevent rendering errors
        if (!rant || !rant.id || !rant.mood) {
            console.error("Invalid rant data:", rant);
            return null;
        }

        const moodAnim = getMoodAnimation(rant.mood);

        return (
            <RantErrorBoundary
                key={rant.id}
                fallback={
                    <div className="w-full p-4 bg-gray-100 rounded-lg">
                        <p className="text-red-500">Failed to render this rant</p>
                    </div>
                }
            >
                <motion.div
                    key={rant.id}
                    initial={{ opacity: 0, scale: moodAnim.scale, y: moodAnim.y }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                        delay: index * 0.08,
                        duration: 1.2,
                        ease: moodAnim.ease as any
                    }}
                    className="w-full h-full overflow-hidden"
                >
                    <div className="w-full h-full flex flex-col">
                        <RantCard
                            rant={rant}
                            index={index}
                            searchTerm={sortOption === "search" ? searchQuery : ""}
                            onLike={() => handleLikeRant(rant.id)}
                        />
                    </div>
                </motion.div>
            </RantErrorBoundary>
        );
    };

    // Render loading skeletons
    const renderSkeletons = () => {
        return Array(8)
            .fill(0)
            .map((_, index) => (
                <div key={`skeleton-${index}`} className="w-full h-full">
                    <RantSkeleton index={index} />
                </div>
            ));
    };

    // Network status monitoring
    useEffect(() => {
        const handleOnline = () => {
            if (error) {
                toast({
                    title: "You're back online",
                    description: "Reconnecting to the server...",
                    variant: "default",
                });
                // Retry loading data when connection is restored
                handleRetry();
            }
        };

        window.addEventListener("online", handleOnline);
        return () => window.removeEventListener("online", handleOnline);
    }, [error]);

    // Function to toggle hash-based routing
    const toggleHashRouting = () => {
        if (usingHashRouter) {
            // Switch to regular routing
            localStorage.removeItem('useHashRouter');

            // Preserve current URL parameters when switching
            const hashParts = window.location.hash.split('?');
            const paramString = hashParts[1] || '';

            // Redirect to regular URL
            window.location.href = `${window.location.origin}${window.location.pathname}${paramString ? '?' + paramString : ''}`;
        } else {
            // Switch to hash-based routing
            localStorage.setItem('useHashRouter', 'true');

            // Preserve current URL parameters when switching
            const currentParams = new URLSearchParams(window.location.search);
            const paramString = currentParams.toString();

            // Redirect to hash-based URL
            window.location.href = `${window.location.origin}${window.location.pathname}#/${paramString ? '?' + paramString : ''}`;
        }
    };

    return (
        <RantErrorBoundary>
            <div className="min-h-screen bg-[#09090B]">
                <Navbar />

                {/* Confetti animation when posting a rant */}
                {showConfetti && <Confetti active={showConfetti} duration={3000} />}

                {/* Keyboard shortcuts dialog */}
                <KeyboardShortcutsDialog
                    open={shortcutsDialogOpen}
                    onOpenChange={setShortcutsDialogOpen}
                    shortcuts={shortcuts}
                />

                <div className="container mx-auto px-4 py-8">
                    {/* Hero section with RantForm side by side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        <div>
                            <IntroSection
                                onStartRanting={scrollToRantForm}
                                onExploreRants={scrollToRantsList}
                            />
                        </div>

                        <div ref={rantFormRef}>
                            <RantErrorBoundary>
                                <RantForm onSubmit={handleRantSubmit} />
                            </RantErrorBoundary>
                        </div>
                    </div>

                    <div ref={rantsListRef} className="mt-16">
                        <div className="flex items-center justify-between mb-4">
                            <RantErrorBoundary>
                                <SortingBar
                                    activeOption={sortOption}
                                    onOptionChange={handleSortChange}
                                    onFilterChange={handleFilterChange}
                                    onSearch={handleSearch}
                                    selectedFilters={selectedMoods}
                                    searchQuery={searchQuery}
                                    searchMood={searchMood}
                                    rants={rantList} // Pass rants for suggestions
                                />
                            </RantErrorBoundary>

                            {/* Keyboard shortcuts help button */}
                            <button
                                onClick={() => setShortcutsDialogOpen(true)}
                                className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-800"
                                aria-label="Keyboard shortcuts"
                                title="Keyboard shortcuts (Press ?)"
                            >
                                <QuestionMarkCircledIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* URL Routing Mode Indicator - only show in development */}
                        {process.env.NODE_ENV === 'development' && (
                            <div className="mb-4 px-4 py-2 bg-gray-800 rounded-md text-xs text-gray-300 flex items-center justify-between">
                                <div>
                                    <span className="font-semibold">URL Mode:</span> {usingHashRouter ? 'Hash-based (#/)' : 'Regular'}
                                    <span className="ml-2 text-gray-400">
                                        {usingHashRouter
                                            ? 'Works without server configuration'
                                            : 'Requires server configuration for direct URLs'}
                                    </span>
                                </div>
                                <button
                                    onClick={toggleHashRouting}
                                    className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white text-xs"
                                >
                                    Switch to {usingHashRouter ? 'regular' : 'hash-based'} routing
                                </button>
                            </div>
                        )}

                        {error && (
                            <Alert className="my-4 border-red-200 bg-red-50">
                                <AlertTitle className="text-red-800">Error loading rants</AlertTitle>
                                <AlertDescription className="text-red-600">
                                    {error}
                                </AlertDescription>
                                <Button
                                    variant="outline"
                                    className="mt-2"
                                    onClick={handleRetry}
                                >
                                    <RefreshCw className="mr-2 h-4 w-4" /> Try again
                                </Button>
                            </Alert>
                        )}

                        <AnimatePresence mode="wait">
                            {loading && page === 0 ? (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="w-full"
                                >
                                    <section className="w-full px-4 sm:px-8 py-10">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                            {renderSkeletons()}
                                        </div>
                                    </section>
                                </motion.div>
                            ) : rantList.length > 0 ? (
                                <motion.div
                                    key="content"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="w-full"
                                >
                                    <section className="w-full px-4 sm:px-8 py-10">
                                        <RantErrorBoundary>
                                            <MasonryGrid
                                                rants={rantList}
                                                gap={24}
                                                searchTerm={sortOption === "search" ? searchQuery : ""}
                                                onLike={handleLikeRant}
                                                onLoadMore={loadMoreRants}
                                                renderItem={renderRantItem}
                                                isLoading={loading}
                                                hasMore={hasMore}
                                                onRemove={handleRemoveRant}
                                                newRantId={newRantId}
                                                onNewRantAppear={() => setNewRantId(null)}
                                            />
                                            {/* Toast notification for new rants */}
                                            {showNewRantNotification && (
                                                <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg cursor-pointer"
                                                    onClick={() => {
                                                        setShowNewRantNotification(false);
                                                        // If we have a newRantId, scroll to it
                                                        if (newRantId && document.querySelector(`.new-rant`)) {
                                                            document.querySelector(`.new-rant`)?.scrollIntoView({
                                                                behavior: 'smooth',
                                                                block: 'start'
                                                            });
                                                        }
                                                    }}>
                                                    New rant added! Click to view
                                                </div>
                                            )}
                                        </RantErrorBoundary>
                                    </section>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="w-full"
                                >
                                    <EmptyState
                                        title={
                                            error ? "Failed to load rants" :
                                                sortOption === "search"
                                                    ? "No rants found matching your search"
                                                    : sortOption === "filter"
                                                        ? "No rants found with selected moods"
                                                        : "No rants found"
                                        }
                                        description={
                                            error ? "Please try again or check your connection" :
                                                sortOption === "search" || sortOption === "filter"
                                                    ? "Try adjusting your filters or search terms"
                                                    : "Be the first to post a rant!"
                                        }
                                        action={error ? handleRetry : scrollToRantForm}
                                        actionLabel={error ? "Try Again" : "Start Ranting"}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* This div serves as the intersection target for infinite scrolling */}
                        {!loading && hasMore && rantList.length > 0 && (
                            <div
                                ref={loadMoreTriggerRef}
                                className="h-20 w-full flex items-center justify-center mt-4"
                            >
                                {/* Only show button if auto-loading failed */}
                                {autoLoadFailed && (
                                    <button
                                        onClick={() => loadMoreRants()}
                                        className="px-6 py-2 bg-cyan-700 hover:bg-cyan-600 text-white rounded-md transition-colors"
                                    >
                                        Load More Rants
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Mood keyboard shortcuts hint */}
                <div className="fixed bottom-20 right-4 p-3 bg-gray-800 rounded-lg shadow-lg text-xs text-gray-300 max-w-xs opacity-70 hover:opacity-100 transition-opacity">
                    <p className="font-semibold mb-1">Mood Filter Shortcuts:</p>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                        <p>
                            <kbd className="px-1 py-0.5 bg-gray-700 rounded">Shift+S</kbd> Sad
                        </p>
                        <p>
                            <kbd className="px-1 py-0.5 bg-gray-700 rounded">Shift+A</kbd> Angry
                        </p>
                        <p>
                            <kbd className="px-1 py-0.5 bg-gray-700 rounded">Shift+C</kbd> Confused
                        </p>
                        <p>
                            <kbd className="px-1 py-0.5 bg-gray-700 rounded">Shift+G</kbd> Smiling
                        </p>
                        <p>
                            <kbd className="px-1 py-0.5 bg-gray-700 rounded">Shift+L</kbd> Loved
                        </p>
                        <p>
                            <kbd className="px-1 py-0.5 bg-gray-700 rounded">Shift+M</kbd> Mind Blown
                        </p>
                    </div>
                    <p className="mt-1 text-center">
                        <kbd className="px-1 py-0.5 bg-gray-700 rounded">Esc</kbd> Clear all filters
                    </p>
                    <button
                        className="mt-2 text-cyan-400 hover:text-cyan-300 text-xs w-full text-center"
                        onClick={() => setShortcutsDialogOpen(true)}
                    >
                        View all shortcuts
                    </button>
                </div>

                {/* Scroll to top button */}
                <ScrollToTopButton />

                <Footer />
            </div>
        </RantErrorBoundary >
    );
};

export default Index;
