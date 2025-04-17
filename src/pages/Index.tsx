import React, { useState, useEffect, useRef, useMemo } from "react";
import { Rant } from "@/lib/types/rant";
import { generateAlias, MoodType } from "@/lib/utils/mood";
import RantForm from "@/components/RantForm";
import SortingBar from "@/components/SortingBar";
import MasonryGrid from "@/components/MasonryGrid";
import IntroSection from "@/components/IntroSection";
import { toast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createFuzzySearcher, performFuzzySearch } from "@/lib/utils/fuzzySearch";
import { parseSearchQuery } from "@/utils/searchParser";
import { supabase, fetchRants, addRant, likeRant } from "@/lib/supabase";
import { getAuthorId } from "@/utils/authorId";
import { useRants } from '@/components/RantContext';
import RantCard from "@/components/RantCard";
import { motion, AnimatePresence } from "framer-motion";
import { getMoodAnimation } from "@/lib/utils/mood";
import RantSkeleton from "@/components/RantSkeleton";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import EmptyState from "@/components/EmptyState";
import Confetti from "@/components/Confetti";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import KeyboardShortcutsDialog from "@/components/KeyboardShortcutsDialog";
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";

type SortOption = "latest" | "popular" | "filter" | "search";

const Index: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
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

    // Increase the limit to load more rants at once
    const LIMIT = 50;
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

    // Define keyboard shortcuts
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
    ]);

    // Initialize from URL params on load
    useEffect(() => {
        const query = searchParams.get('q');
        const mood = searchParams.get('mood') as MoodType | null;
        const moodsParam = searchParams.get('moods');
        const moods = moodsParam ? moodsParam.split(',').filter(Boolean) : [];
        const sort = searchParams.get('sort') as SortOption;

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
    }, [searchParams]);

    // Function to load rants from Supabase
    const loadRants = async (reset = false) => {
        if (loading && !reset) return;

        setLoading(true);
        setError(null);

        try {
            const offset = reset ? 0 : page * LIMIT;

            const options = {
                limit: LIMIT,
                offset,
                sortBy: sortOption === "popular" ? "popular" : "latest",
                moods: sortOption === "filter" ? selectedMoods : [],
                searchQuery: sortOption === "search" ? searchQuery : "",
                searchMood: sortOption === "search" ? searchMood : null
            };

            // console.log("Fetching rants with options:", options);
            const data = await fetchRants(options);
            // console.log("Fetched rants:", data);

            if (data.length < LIMIT) {
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
        } catch (err) {
            console.error("Failed to fetch rants:", err);
            setError("Failed to load rants. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    // Load more rants when user scrolls to bottom
    const loadMoreRants = async () => {
        if (!loading && hasMore) {
            await loadRants();
        }
    };

    // Update URL when filters or search change
    useEffect(() => {
        const params = new URLSearchParams();

        // Add search params if in search mode
        if (sortOption === "search") {
            if (searchQuery) {
                params.set('q', searchQuery);
            }

            if (searchMood) {
                params.set('mood', searchMood);
            }
        }

        // Add mood filters if in filter mode
        if (sortOption === "filter" && selectedMoods.length > 0) {
            params.set('moods', selectedMoods.join(','));
        }

        // Only include sort option if it's not the default or if other params exist
        if (sortOption !== "latest" || params.toString()) {
            params.set('sort', sortOption);
        }

        // Update URL without reloading the page
        setSearchParams(params, { replace: true });
    }, [sortOption, selectedMoods, searchQuery, searchMood, setSearchParams]);

    // Set up real-time subscription for new rants
    useEffect(() => {
        // console.log("Setting up real-time subscription");
        const subscription = supabase
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

        return () => {
            console.log("Unsubscribing from real-time updates");
            subscription.unsubscribe();
        };
    }, [sortOption, selectedMoods]);

    const handleRantSubmit = async (content: string, mood: MoodType) => {
        try {
            const authorId = getAuthorId();

            // Generate a unique ID for the rant to prevent duplicates
            const rantId = crypto.randomUUID();

            // Add to tracking set to prevent duplicate display from real-time subscription
            submittedRantIds.current.add(rantId);

            // Create optimistic rant for immediate UI update
            const optimisticRant: Rant = {
                id: rantId,
                content,
                mood,
                author_id: authorId,
                likes: 0,
                created_at: new Date().toISOString(),
                // Add any other required fields with default values
            };

            // Optimistically add to the list to improve perceived performance
            setRantList(prev => [optimisticRant, ...prev]);

            console.log("Submitting rant:", { content, mood, authorId, rantId });

            // Show confetti animation
            setShowConfetti(true);

            // Actually submit the rant
            const newRant = await addRant({
                id: rantId,
                content,
                mood,
                author_id: authorId
            });

            console.log("Rant submitted successfully:", newRant);

            // Share the rant with the context if it exists
            if (rantContext && rantContext.addRant) {
                rantContext.addRant(newRant);
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

            toast({
                title: "Error",
                description: "Failed to post your rant. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleLikeRant = async (rantId: string) => {
        try {
            const authorId = getAuthorId();
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
                rantContext.likeRant(rantId);
            }
        } catch (error) {
            console.error("Error liking rant:", error);

            // Revert the optimistic update if there was an error
            setRantList(prev =>
                prev.map(rant =>
                    rant.id === rantId
                        ? { ...rant, likes: rant.likes - 1 }
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

    const scrollToRantForm = () => {
        rantFormRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const scrollToRantsList = () => {
        rantsListRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Handle filter change
    const handleFilterChange = (moods: string[]) => {
        setSelectedMoods(moods);
        // Reset will happen via the URL params effect
    };

    // Handle sort change
    const handleSortChange = (option: SortOption) => {
        setSortOption(option);
        // Reset will happen via the URL params effect
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
        // Reset will happen via the URL params effect
    };

    // Custom render function for MasonryGrid
    const renderRantItem = (rant: Rant, index: number) => {
        const moodAnim = getMoodAnimation(rant.mood);

        return (
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

    // console.log("Current rant list:", rantList);

    return (
        <div className="min-h-screen bg-[#09090B]">
            <Navbar />

            {/* Confetti animation when posting a rant */}
            <Confetti active={showConfetti} duration={3000} />

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
                        <RantForm onSubmit={handleRantSubmit} />
                    </div>
                </div>

                <div ref={rantsListRef} className="mt-16">
                    <div className="flex items-center justify-between mb-4">
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

                    {error && (
                        <div className="text-red-500 text-center py-4">
                            {error}
                        </div>
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
                                    <MasonryGrid
                                        rants={rantList}
                                        gap={24}
                                        searchTerm={sortOption === "search" ? searchQuery : ""}
                                        onLike={handleLikeRant}
                                        onLoadMore={loadMoreRants}
                                        renderItem={renderRantItem}
                                    />
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
                                        sortOption === "search"
                                            ? "No rants found matching your search"
                                            : sortOption === "filter"
                                                ? "No rants found with selected moods"
                                                : "No rants found"
                                    }
                                    description={
                                        sortOption === "search" || sortOption === "filter"
                                            ? "Try adjusting your filters or search terms"
                                            : "Be the first to post a rant!"
                                    }
                                    action={scrollToRantForm}
                                    actionLabel="Start Ranting"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {loading && page > 0 && (
                        <div className="flex justify-center py-6">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
                        </div>
                    )}

                    {!loading && hasMore && rantList.length > 0 && (
                        <div className="flex justify-center py-6 mt-4">
                            <button
                                onClick={() => loadMoreRants()}
                                className="px-6 py-2 bg-cyan-700 hover:bg-cyan-600 text-white rounded-md transition-colors"
                            >
                                Load More Rants
                            </button>
                        </div>
                    )}

                    {!loading && !hasMore && rantList.length > 0 && (
                        <div className="text-center text-gray-400 py-6">
                            No more rants to load
                        </div>
                    )}
                </div>
            </div>

            {/* Scroll to top button */}
            <ScrollToTopButton />

            <Footer />
        </div>
    );
};

export default Index;
