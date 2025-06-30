import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import { RefreshCw } from "lucide-react";
import { Rant } from "@/lib/types/rant";
import { generateAlias, MoodType } from "@/lib/utils/mood";
import RantForm from "@/components/RantForm";
import SortingBar from "@/components/SortingBar";
import MasonryGrid from "@/components/MasonryGrid";
import IntroSection from "@/components/IntroSection";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase, fetchRants, addRant, likeRant } from "@/lib/supabase";
import { getAnonymousUserId } from "@/utils/authorId";
import RantCard from "@/components/RantCard";
import { getMoodAnimation, getMoodLabel } from "@/lib/utils/mood";
import RantSkeleton from "@/components/RantSkeleton";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import EmptyState from "@/components/EmptyState";
import Confetti from "@/components/Confetti";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import KeyboardShortcutsDialog from "@/components/KeyboardShortcutsDialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Button from "@/components/ui/button";
import { useMoodKeyboardShortcuts } from '@/hooks/useMoodKeyboardShortcuts';
import Settings from '@/components/Settings';
import { useAccessibility } from '@/components/AccessibilityContext';
import MyRants from '@/components/MyRants';
import UndoDeleteNotification from '@/components/UndoDeleteNotification';
import { addDeletedRant, addMyRant } from '@/utils/userStorage';
import {
    getUrlParams,
    parseMoodFilters,
    parseSearchParams,
    getSortOption,
    updateUrlParams,
    isHashBasedRouting,
} from '@/utils/urlUtils';
import { colors } from "@/utils/colors";
import { v4 as uuidv4 } from 'uuid';
import { useRantStore } from '@/store/useRantStore';
// Use the shared SortOption type from the store
import type { SortOption } from '@/store/RantStore';
import AppHead from "@/components/AppHead";
import ErrorBoundary from "@/components/ErrorBoundary";

const Index: React.FC = () => {
    const { theme, setTheme } = useAccessibility();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const {
        rants,
        setRants,
        sortOption,
        setSortOption,
        selectedMoods,
        setSelectedMoods,
        searchQuery,
        setSearchQuery,
        searchMood,
        setSearchMood,
        loading,
        setLoading,
        error,
        setError
    } = useRantStore();
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const [shortcutsDialogOpen, setShortcutsDialogOpen] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [usingHashRouter, setUsingHashRouter] = useState(isHashBasedRouting());
    const [shortcutsCollapsed, setShortcutsCollapsed] = useState(false);
    const [optimisticRantIds, setOptimisticRantIds] = useState<Set<string>>(new Set());
    const [showMoodShortcutsHint, setShowMoodShortcutsHint] = useState(false);
    // New state for My Rants and Undo Delete functionality
    const [showMyRants, setShowMyRants] = useState(false);
    const [deletedRantId, setDeletedRantId] = useState<string | null>(null);
    const [deletedRant, setDeletedRant] = useState<Rant | null>(null);

    // State for auto-loading rants
    const [autoLoadFailed, setAutoLoadFailed] = useState(false);
    const loadMoreTriggerRef = useRef<HTMLDivElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

    // Add these new state variables for batch updates and notification count
    const [showNewRantNotification, setShowNewRantNotification] = useState(false);
    const [newRantId, setNewRantId] = useState<string | null>(null);
    const [newRantsBuffer, setNewRantsBuffer] = useState<Rant[]>([]);
    const [newRantsCount, setNewRantsCount] = useState(0);
    const bufferTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Increase the initial batch size for faster first load
    const INITIAL_LIMIT = 30; // More rants on first load
    const SUBSEQUENT_LIMIT = 20; // Fewer on subsequent loads to maintain performance

    const rantFormRef = useRef<HTMLDivElement>(null);
    const rantsListRef = useRef<HTMLDivElement>(null);
    const submittedRantIds = useRef<Set<string>>(new Set());

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
        {
            key: "m",
            action: () => setShowMyRants(true),
            description: "View My Rants",
        },
        // Mood selection shortcuts with Shift key
        {
            key: "Shift+s",
            action: () => toggleMoodSelection("sad"),
            description: "Sad Mood",
        },
        {
            key: "Shift+y",
            action: () => toggleMoodSelection("crying"),
            description: "Crying Mood",
        },
        {
            key: "Shift+a",
            action: () => toggleMoodSelection("angry"),
            description: "Angry Mood",
        },
        {
            key: "Shift+e",
            action: () => toggleMoodSelection("eyeRoll"),
            description: "Eye Roll Mood",
        },
        {
            key: "Shift+b",
            action: () => toggleMoodSelection("heartbroken"),
            description: "Heartbroken Mood",
        },
        {
            key: "Shift+m",
            action: () => toggleMoodSelection("mindBlown"),
            description: "Mind Blown Mood",
        },
        {
            key: "Shift+p",
            action: () => toggleMoodSelection("speechless"),
            description: "Speechless Mood",
        },
        {
            key: "Shift+c",
            action: () => toggleMoodSelection("confused"),
            description: "Confused Mood",
        },
        {
            key: "Shift+t",
            action: () => toggleMoodSelection("tired"),
            description: "Tired Mood",
        },
        {
            key: "Shift+n",
            action: () => toggleMoodSelection("nervous"),
            description: "Nervous Mood",
        },
        {
            key: "Shift+g",
            action: () => toggleMoodSelection("smiling"),
            description: "Smiling Mood",
        },
        {
            key: "Shift+f",
            action: () => toggleMoodSelection("laughing"),
            description: "Laughing Mood",
        },
        {
            key: "Shift+d",
            action: () => toggleMoodSelection("celebratory"),
            description: "Celebratory Mood",
        },
        {
            key: "Shift+o",
            action: () => toggleMoodSelection("confident"),
            description: "Confident Mood",
        },
        {
            key: "Shift+l",
            action: () => toggleMoodSelection("loved"),
            description: "Loved Mood",
        },
        {
            key: "Escape",
            action: () => clearAllFilters(),
            description: "Clear all filters",
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

    // Function to process the buffer and update the UI
    const processNewRantsBuffer = useCallback(() => {
        setNewRantsBuffer(prevBuffer => {
            if (prevBuffer.length === 0) return prevBuffer;

            // Filter out duplicates and apply current filters
            const filteredNewRants = prevBuffer.filter(rant => {
                // Skip if this is a rant we just submitted to prevent duplicates
                if (submittedRantIds.current.has(rant.id)) {
                    return false;
                }

                // Apply mood filters if in filter mode
                if (sortOption === "filter" && selectedMoods.length > 0) {
                    return selectedMoods.includes(rant.mood);
                }

                return true;
            });

            if (filteredNewRants.length > 0) {
                // Add filtered rants to the main list
                setRants(prevRants => {
                    // Check for duplicates in the current list
                    const existingIds = new Set(prevRants.map(rant => rant.id));
                    const uniqueNewRants = filteredNewRants.filter(rant => !existingIds.has(rant.id));

                    if (uniqueNewRants.length === 0) return prevRants;

                    // Show notification with count
                    setNewRantsCount(uniqueNewRants.length);
                    setShowNewRantNotification(true);

                    // If there's only one new rant, set it as the highlighted one
                    if (uniqueNewRants.length === 1) {
                        setNewRantId(uniqueNewRants[0].id);
                    } else {
                        setNewRantId(null); // Multiple rants, don't highlight just one
                    }

                    // Return the updated list with new rants at the top
                    return [...uniqueNewRants, ...prevRants];
                });
            }

            // Clear the buffer
            return [];
        });
    }, [sortOption, selectedMoods]);

    // Replace the existing real-time subscription with this enhanced version
    useEffect(() => {
        // Set up real-time subscription for new rants
        let subscription;

        try {
            subscription = supabase
                .channel('public:rants')
                .on(
                    'postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'rants' },
                    payload => {
                        // Add the new rant to the buffer
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

                        // Add to buffer
                        setNewRantsBuffer(prev => [...prev, newRant]);

                        // Clear any existing timeout
                        if (bufferTimeoutRef.current) {
                            clearTimeout(bufferTimeoutRef.current);
                        }

                        // Set a new timeout to process the buffer after 5 seconds
                        bufferTimeoutRef.current = setTimeout(() => {
                            processNewRantsBuffer();
                            bufferTimeoutRef.current = null;
                        }, 5000);
                    }
                )
                .on(
                    'postgres_changes',
                    { event: 'UPDATE', schema: 'public', table: 'rants' },
                    payload => {
                        // Update existing rant (e.g., when likes change)
                        const updatedRant = payload.new as Rant;
                        console.log("Rant updated:", updatedRant);
                        setRants(prev =>
                            prev.map(rant =>
                                rant.id === updatedRant.id ? updatedRant : rant
                            )
                        );
                    }
                )
                .subscribe();
        } catch (err) {
            console.error("Error setting up real-time subscription:", err);
            // Don't show error to user as this is non-critical
        }

        return () => {
            try {
                if (bufferTimeoutRef.current) {
                    clearTimeout(bufferTimeoutRef.current);
                }

                if (subscription) {
                    subscription.unsubscribe();
                }
            } catch (err) {
                console.error("Error unsubscribing from real-time updates:", err);
            }
        };
    }, [sortOption, selectedMoods, processNewRantsBuffer]);

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
            const anonymousUserId = getAnonymousUserId();
            if (!anonymousUserId) {
                console.warn("Author ID is missing, using anonymous");
                return "anonymous";
            }
            return anonymousUserId;
        } catch (error) {
            console.error("Failed to get author ID:", error);
            return "anonymous";
        }
    };

    // Function to safely handle mood values
    const getSafeMood = (mood: MoodType | null): MoodType => {
        if (mood === null) {
            return "neutral" as MoodType;
        }

        return mood;
    };

    // Function to load rants from Supabase with error handling
    const loadRants = useCallback(async (reset = false) => {
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
                .select('id, content, mood, anonymous_user_id, likes, created_at')
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
                setRants(
                    (data as Partial<Rant>[]).map((item) => ({
                        id: item.id!,
                        content: item.content!,
                        mood: item.mood!,
                        anonymous_user_id: item.anonymous_user_id!,
                        likes: item.likes ?? 0,
                        created_at: item.created_at!,
                        comments: item.comments ?? 0,
                        userAlias: item.userAlias ?? 'Anonymous',
                    }))
                );
                setPage(0);
            } else {
                setRants(prev => {
                    const existingIds = new Set(prev.map(rant => rant.id));
                    const newRants = (data as Partial<Rant>[])
                        .filter(item => !existingIds.has(item.id!))
                        .map(item => ({
                            id: item.id!,
                            content: item.content!,
                            mood: item.mood!,
                            anonymous_user_id: item.anonymous_user_id!,
                            likes: item.likes ?? 0,
                            created_at: item.created_at!,
                            comments: item.comments ?? 0,
                            userAlias: item.userAlias ?? 'Anonymous',
                        }));
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
                    variant: "error", // Updated to valid ToastVariant
                });
            }
        } finally {
            setLoading(false);
        }
    }, [page, sortOption, selectedMoods, searchQuery, searchMood, retryCount, setRants, setError, setLoading, loading]);

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
    }, [sortOption, selectedMoods, searchQuery, searchMood, setSearchParams]);

    const handleRantSubmit = async (content: string, mood: MoodType) => {
        let rantId: string; // Declare rantId at the top of the function for proper scoping

        try {
            rantId = uuidv4(); // Assign value within the try block

            const authorId = getSafeAuthorId();
            const safeMood = getSafeMood(mood);

            // Add to tracking set to prevent duplicate display from real-time subscription
            submittedRantIds.current.add(rantId);

            // Create optimistic rant for immediate UI update
            const optimisticRant: Rant = {
                id: rantId,
                content,
                mood: safeMood,
                anonymous_user_id: authorId,
                likes: 0,
                created_at: new Date().toISOString(),
                comments: 0,
                userAlias: "Anonymous",
            };

            // Optimistically add to the list to improve perceived performance
            setRants(prev => [optimisticRant, ...prev]);

            // console.log("Submitting rant:", { content, mood: safeMood, authorId, rantId });

            // Show confetti animation
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);

            // Actually submit the rant
            const newRant = await addRant({
                id: rantId,
                content,
                mood: safeMood,
                anonymous_user_id: authorId
            });

            // console.log("Rant submitted successfully:", newRant);

            // Add to user's own rants for "My Rants" feature
            if (newRant && newRant.id) {
                addMyRant(newRant.id);
            }

            toast({
                title: "Rant Posted!",
                description: "Your rant has been posted anonymously.",
                variant: "default",
            });

            return newRant;
        } catch (error) {
            console.error("Error posting rant:", error);

            // Remove the optimistic rant on error
            setRants(prev => prev.filter(rant => !submittedRantIds.current.has(rant.id)));
            submittedRantIds.current.delete(rantId);

            toast({
                title: "Error",
                description: "Failed to post your rant. Please try again.",
                variant: "error", // Updated to valid ToastVariant
            });

            throw error;
        }
    };

    const handleLikeRant = async (rantId: string) => {
        try {
            const authorId = getSafeAuthorId();
            console.log("Liking rant:", rantId, "by author:", authorId);

            // Optimistically update the UI first for better user experience
            setRants(prev =>
                prev.map(rant =>
                    rant.id === rantId
                        ? { ...rant, likes: rant.likes + 1 }
                        : rant
                )
            );

            // Then perform the actual like operation
            await likeRant(rantId, authorId);
            console.log("Rant liked successfully");
        } catch (error) {
            console.error("Error liking rant:", error);

            // Revert the optimistic update if there was an error
            setRants(prev =>
                prev.map(rant =>
                    rant.id === rantId
                        ? { ...rant, likes: Math.max(0, rant.likes - 1) }
                        : rant
                )
            );

            toast({
                title: "Error",
                description: "Failed to like this rant. You may have already liked it.",
                variant: "error", // Updated to valid ToastVariant
            });
        }
    };

    // Add the handleRemoveRant function with undo functionality
    const handleRemoveRant = (id: string) => {
        try {
            // Find the rant first
            const rantToDelete = rants.find(rant => rant.id === id);
            if (!rantToDelete) return;

            // Store the deleted rant for potential undo
            setDeletedRant(rantToDelete);
            setDeletedRantId(id);

            // Store in persistence layer
            addDeletedRant(rantToDelete);

            // Remove from local state
            setRants(prevRants => prevRants.filter(rant => rant.id !== id));

        } catch (error) {
            console.error("Error removing rant:", error);

            toast({
                title: "Error",
                description: "Failed to remove the rant. Please try again.",
                variant: "error", // Updated to valid ToastVariant
            });
        }
    };

    // Add function to handle rant restoration
    const handleUndoDelete = (rant: Rant) => {
        // Add the rant back to the list
        setRants(prev => [rant, ...prev.filter(r => r.id !== rant.id)]);

        toast({
            title: "Rant Restored",
            description: "Your rant has been restored successfully.",
            variant: "default",
        });
    };

    // Add function to close the undo notification
    const handleCloseUndoNotification = () => {
        setDeletedRantId(null);
        setDeletedRant(null);
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
    const handleRetry = useCallback(() => {
        setRetryCount(prev => prev + 1);
        setError(null);
        loadRants(true);
    }, [loadRants]); // Added setError to dependencies

    // Custom render function for MasonryGrid with error handling
    const renderRantItem = (rant: Rant, index: number) => {
        // Validate rant data to prevent rendering errors
        if (!rant || !rant.id || !rant.mood) {
            console.error("Invalid rant data:", rant);
            return null;
        }

        const moodAnim = getMoodAnimation(rant.mood);
        const isNewRant = rant.id === newRantId;

        return (
            <ErrorBoundary
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
                        ease: moodAnim.ease,
                    }}
                    className={`w-full h-full overflow-hidden ${isNewRant ? 'new-rant rant-' + rant.id : 'rant-' + rant.id}`}
                >
                    <div className="w-full h-full flex flex-col">
                        <RantCard
                            rant={rant}
                            index={index}
                            searchTerm={sortOption === "search" ? searchQuery : ""}
                            onLike={() => handleLikeRant(rant.id)}
                            onRemove={() => handleRemoveRant(rant.id)}
                            isNew={isNewRant}
                            onClick={() => { }}
                        />
                    </div>
                </motion.div>
            </ErrorBoundary>
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
    }, [error, handleRetry]); // Added 'handleRetry' to the dependency array

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

    // useEffect to handle the scroll detection
    useEffect(() => {
        const handleScroll = () => {
            // Only show the hint when the user has scrolled to the rants list
            if (rantsListRef.current) {
                const rect = rantsListRef.current.getBoundingClientRect();
                // Show when the rants list is visible in the viewport
                setShowMoodShortcutsHint(rect.top <= window.innerHeight && rect.bottom >= 0);
            }
        };

        // Initialize visibility based on initial scroll position
        handleScroll();

        // Add event listener
        window.addEventListener("scroll", handleScroll, { passive: true });

        // Clean up
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);


    const [autoCollapseTriggered, setAutoCollapseTriggered] = useState(false);
    const hintBoxRef = useRef<HTMLDivElement>(null);
    const autoCollapseTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Effect to handle auto-collapse with genie effect
    useEffect(() => {
        if (showMoodShortcutsHint && !shortcutsCollapsed && !autoCollapseTriggered) {
            // Clear any existing timer
            if (autoCollapseTimerRef.current) {
                clearTimeout(autoCollapseTimerRef.current);
            }

            // Set a timer to auto-collapse
            autoCollapseTimerRef.current = setTimeout(() => {
                setAutoCollapseTriggered(true);

                // Apply genie effect
                if (hintBoxRef.current) {
                    // First scale horizontally to create squeezing effect
                    hintBoxRef.current.style.transition = 'transform 700ms cubic-bezier(0.2, 0, 0, 1)';
                    hintBoxRef.current.style.transform = 'scaleX(0.3) scaleY(1)';

                    // Then after a short delay, add the vertical scale for complete genie effect
                    setTimeout(() => {
                        if (hintBoxRef.current) {
                            hintBoxRef.current.style.transition = 'transform 300ms cubic-bezier(0.7, 0, 0.84, 0)';
                            hintBoxRef.current.style.transform = 'scaleX(0.3) scaleY(0.1)';

                            // Finally set the state to collapsed after animation completes
                            setShortcutsCollapsed(true);

                            // Reset styles to let the component's classes take over
                            if (hintBoxRef.current) {
                                hintBoxRef.current.style.transition = '';
                                hintBoxRef.current.style.transform = '';
                            }
                        }
                    }, 700);
                } else {
                    // Fallback if ref is not available
                    setShortcutsCollapsed(true);
                }
            }, 5000); // Auto-collapse after 5 seconds

            return () => {
                if (autoCollapseTimerRef.current) {
                    clearTimeout(autoCollapseTimerRef.current);
                }
            };
        }

        // Reset the auto-collapse trigger when shortcuts are manually expanded
        if (shortcutsCollapsed === false) {
            setAutoCollapseTriggered(false);
        }
    }, [showMoodShortcutsHint, shortcutsCollapsed, autoCollapseTriggered]);

    return (
        <>
            <AppHead image={newRantId ? `/api/og-image?rantId=${newRantId}` : undefined} />
            <ErrorBoundary>
                <div className="min-h-screen bg-background-dark">
                    <div className="flex justify-between items-center w-full">
                        <Navbar />
                    </div>

                    {showConfetti && <Confetti active={showConfetti} duration={3000} />}

                    <KeyboardShortcutsDialog
                        open={shortcutsDialogOpen}
                        onOpenChange={setShortcutsDialogOpen}
                        shortcuts={shortcuts}
                    />

                    <AnimatePresence>
                        {showNewRantNotification && (
                            <motion.div
                                initial={{ y: -100, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -100, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="fixed top-0 left-0 right-0 flex justify-center z-50"
                            >
                                <div
                                    className="mt-16 bg-blue-600 text-white px-6 py-3 rounded-md shadow-lg cursor-pointer flex items-center gap-2 max-w-md mx-auto"
                                    onClick={() => {
                                        setShowNewRantNotification(false);

                                        if (newRantId && document.querySelector(`.rant-${newRantId}`)) {
                                            document.querySelector(`.rant-${newRantId}`)?.scrollIntoView({
                                                behavior: 'smooth',
                                                block: 'start'
                                            });
                                        } else if (newRantsCount > 0) {
                                            rantsListRef.current?.scrollIntoView({
                                                behavior: 'smooth',
                                                block: 'start'
                                            });
                                        }

                                        setNewRantsCount(0);
                                    }}
                                    role="alert"
                                    aria-live="assertive"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                                    </svg>
                                    {newRantsCount === 1 ? (
                                        <span>1 new rant posted!</span>
                                    ) : (
                                        <span>{newRantsCount} new rants posted!</span>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="container mx-auto px-4 py-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                            <div>
                                <IntroSection
                                    onStartRanting={scrollToRantForm}
                                    onExploreRants={scrollToRantsList}
                                />
                            </div>

                            <div ref={rantFormRef}>
                                <ErrorBoundary>
                                    <RantForm onSubmit={handleRantSubmit} />
                                </ErrorBoundary>
                            </div>
                        </div>

                        <div ref={rantsListRef} className="mt-16">
                            <div className="flex items-center justify-between mb-4">
                                <ErrorBoundary>
                                    <SortingBar
                                        activeOption={sortOption}
                                        onOptionChange={handleSortChange}
                                        onFilterChange={handleFilterChange}
                                        onSearch={handleSearch}
                                        selectedFilters={selectedMoods}
                                        searchQuery={searchQuery}
                                        searchMood={searchMood}
                                        rants={rants}
                                    />
                                </ErrorBoundary>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setShortcutsDialogOpen(true)}
                                        className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-800"
                                        aria-label="Keyboard Shortcuts"
                                        title="Keyboard Shortcuts"
                                    >
                                        <QuestionMarkCircledIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {process.env.NODE_ENV === 'development' && (
                                <div className="flex justify-end">
                                    <button
                                        onClick={toggleHashRouting}
                                        className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white text-xs"
                                        aria-label="Toggle Routing Mode"
                                    >
                                        Switch to {usingHashRouter ? 'Regular' : 'Hash-Based'} Routing
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
                                        aria-label="Try Again"
                                    >
                                        <RefreshCw className="mr-2 h-4 w-4" /> Try Again
                                    </Button>
                                </Alert>
                            )}

                            <AnimatePresence mode="wait">
                                {loading && page === 0 && location.pathname === '/' ? (
                                    <motion.div
                                        key="loading"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="w-full"
                                    >
                                        <section className="w-full px-4 sm:px-8 py-10" aria-label="Loading Rants">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                                {renderSkeletons()}
                                            </div>
                                        </section>
                                    </motion.div>
                                ) : rants.length > 0 ? (
                                    <motion.div
                                        key="content"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="w-full"
                                    >
                                        <section className="w-full px-4 sm:px-8 py-10" aria-label="Rant List">
                                            <ErrorBoundary>
                                                <MasonryGrid
                                                    rants={rants}
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
                                            </ErrorBoundary>
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
                                                error ? 'Failed to load rants' :
                                                    sortOption === "search"
                                                        ? 'No results found'
                                                        : sortOption === "filter"
                                                            ? 'No rants match your filters'
                                                            : 'No rants yet. Be the first to post one!'
                                            }
                                            description={
                                                error ? 'Please try again later' :
                                                    sortOption === "search" || sortOption === "filter"
                                                        ? 'Adjust your filters or search terms'
                                                        : 'Join the community by posting the first rant'
                                            }
                                            action={error ? handleRetry : scrollToRantForm}
                                            actionLabel={error ? 'Try Again' : 'Post the First Rant'}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {!loading && hasMore && rants.length > 0 && (
                                <div
                                    ref={loadMoreTriggerRef}
                                    className="h-20 w-full flex items-center justify-center mt-4"
                                    aria-live="polite"
                                >
                                    {autoLoadFailed && (
                                        <button
                                            onClick={() => loadMoreRants()}
                                            className="px-6 py-2 bg-cyan-700 hover:bg-cyan-600 text-white rounded-md transition-colors"
                                            aria-label="Load More Rants"
                                        >
                                            Load More Rants
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {showMoodShortcutsHint && (
                        <div
                            ref={hintBoxRef}
                            className={`fixed bottom-20 right-4 bg-background-dark rounded-lg shadow-medium text-xs transition-all duration-300 font-ui border border-border-subtle
                                ${shortcutsCollapsed
                                    ? "w-10 h-10 overflow-hidden opacity-50 hover:opacity-90 scale-y-100 origin-bottom-right"
                                    : "max-w-xs p-3 opacity-80 hover:opacity-100 scale-y-100 origin-bottom-right"
                                }`}
                            aria-label="Mood Shortcuts"
                        >
                            {shortcutsCollapsed ? (
                                <button
                                    onClick={() => setShortcutsCollapsed(false)}
                                    className="w-full h-full flex items-center justify-center text-accent-teal hover:text-primary transition-colors"
                                    aria-label="Expand Mood Shortcuts"
                                    title="Expand Mood Shortcuts"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            ) : (
                                <>
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="font-semibold font-heading text-text-strong">Mood Filters:</p>
                                        <button
                                            onClick={() => setShortcutsCollapsed(true)}
                                            className="text-text-muted hover:text-text-strong transition-colors"
                                            aria-label="Collapse Mood Shortcuts"
                                            title="Collapse Mood Shortcuts"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                                        <p className="text-text-strong">
                                            <kbd className="px-1 py-0.5 bg-background-secondary rounded border border-border-subtle">Shift+S</kbd> <span className="text-text-muted">Sad</span>
                                        </p>
                                        <p className="text-text-strong">
                                            <kbd className="px-1 py-0.5 bg-background-secondary rounded border border-border-subtle">Shift+A</kbd> <span className="text-text-muted">Angry</span>
                                        </p>
                                        <p className="text-text-strong">
                                            <kbd className="px-1 py-0.5 bg-background-secondary rounded border border-border-subtle">Shift+C</kbd> <span className="text-text-muted">Confused</span>
                                        </p>
                                        <p className="text-text-strong">
                                            <kbd className="px-1 py-0.5 bg-background-secondary rounded border border-border-subtle">Shift+G</kbd> <span className="text-text-muted">Smiling</span>
                                        </p>
                                        <p className="text-text-strong">
                                            <kbd className="px-1 py-0.5 bg-background-secondary rounded border border-border-subtle">Shift+L</kbd> <span className="text-text-muted">Loved</span>
                                        </p>
                                        <p className="text-text-strong">
                                            <kbd className="px-1 py-0.5 bg-background-secondary rounded border border-border-subtle">Shift+M</kbd> <span className="text-text-muted">Mind Blown</span>
                                        </p>
                                    </div>
                                    <p className="mt-1 text-center text-text-strong">
                                        <kbd className="px-1 py-0.5 bg-background-secondary rounded border border-border-subtle">Esc</kbd> <span className="text-text-muted">Clear Filters</span>
                                    </p>
                                    <button
                                        className="mt-2 text-accent-teal hover:text-accent-teal/80 text-xs w-full text-center font-ui"
                                        onClick={() => setShortcutsDialogOpen(true)}
                                    >
                                        View All Shortcuts
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    <ScrollToTopButton />

                    <AnimatePresence>
                        {showMyRants && (
                            <MyRants
                                onClose={() => setShowMyRants(false)}
                                onLike={handleLikeRant}
                            />
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {deletedRantId && deletedRant && (
                            <UndoDeleteNotification
                                rantId={deletedRantId}
                                onClose={handleCloseUndoNotification}
                                onUndo={handleUndoDelete}
                            />
                        )}
                    </AnimatePresence>

                    <Footer />
                </div>
            </ErrorBoundary>
        </>
    );
};

export default Index;
