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
import { RantProvider } from '@/components/RantContext';

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
    // Increase the limit to load more rants at once
    const LIMIT = 50;
    const rantFormRef = useRef<HTMLDivElement>(null);
    const rantsListRef = useRef<HTMLDivElement>(null);

    // Create fuzzy searcher with memoization
    const fuzzySearcher = useMemo(() => createFuzzySearcher(rantList), [rantList]);

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

            const data = await fetchRants(options);

            if (data.length < LIMIT) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }

            setRantList(prev => reset ? data : [...prev, ...data]);

            if (reset) {
                setPage(0);
            } else {
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
    const loadMoreRants = () => {
        if (!loading && hasMore) {
            loadRants();
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
        const subscription = supabase
            .channel('public:rants')
            .on('INSERT', payload => {
                // Add the new rant to the list if it matches current filters
                const newRant = payload.new as Rant;

                // Only add if it matches current filters
                let shouldAdd = true;

                if (sortOption === "filter" && selectedMoods.length > 0) {
                    shouldAdd = selectedMoods.includes(newRant.mood);
                }

                if (shouldAdd) {
                    setRantList(prev => [newRant, ...prev]);
                }
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [sortOption, selectedMoods]);

    const handleRantSubmit = async (content: string, mood: MoodType) => {
        try {
            const authorId = getAuthorId();
            const newRant = await addRant({
                content,
                mood,
                author_id: authorId
            });

            // No need to manually update state as the real-time subscription will handle it

            toast({
                title: "Rant Posted!",
                description: "Your rant has been posted anonymously.",
                variant: "default",
            });
        } catch (error) {
            console.error("Error posting rant:", error);
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
            await likeRant(rantId, authorId);

            // Update the local state to reflect the like
            setRantList(prev =>
                prev.map(rant =>
                    rant.id === rantId
                        ? { ...rant, likes: rant.likes + 1 }
                        : rant
                )
            );
        } catch (error) {
            console.error("Error liking rant:", error);
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

    return (
        <RantProvider>
            <div className="min-h-screen bg-[#09090B]">
                <Navbar />

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

                        {error && (
                            <div className="text-red-500 text-center py-4">
                                {error}
                            </div>
                        )}

                        {loading && page === 0 ? (
                            <div className="flex justify-center py-10">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
                            </div>
                        ) : (
                            <>
                                <MasonryGrid
                                    rants={rantList}
                                    searchTerm={sortOption === "search" ? searchQuery : ""}
                                    gap={24}
                                    onLike={handleLikeRant}
                                    onLoadMore={loadMoreRants}
                                />

                                {loading && page > 0 && (
                                    <div className="flex justify-center py-6">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
                                    </div>
                                )}

                                {!loading && hasMore && (
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

                                {!loading && rantList.length === 0 && (
                                    <div className="text-center text-gray-400 py-10">
                                        No rants found. Be the first to post one!
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <Footer />
            </div>
            );
        </RantProvider>
    );
}


export default Index;
