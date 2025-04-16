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
import { rants as staticRants } from "@/lib/data/rants";

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
    const rantFormRef = useRef<HTMLDivElement>(null);
    const rantsListRef = useRef<HTMLDivElement>(null);

    // Create fuzzy searcher with memoization
    const fuzzySearcher = useMemo(() => createFuzzySearcher(staticRants), []);

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

        // Load rants based on filters
        loadRants();
    }, [searchParams]);

    // Function to load and filter rants from static data
    const loadRants = () => {
        setLoading(true);
        setError(null);

        try {
            // Make a copy of the static rants to avoid mutating the original
            let filteredRants = [...staticRants];

            // Apply sorting
            if (sortOption === "popular") {
                filteredRants.sort((a, b) => b.likes - a.likes);
            } else {
                // Sort by date (latest first)
                filteredRants.sort((a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
            }

            // Apply mood filtering
            if (sortOption === "filter" && selectedMoods.length > 0) {
                filteredRants = filteredRants.filter(rant =>
                    selectedMoods.includes(rant.mood)
                );
            }

            // Apply search
            if (sortOption === "search") {
                if (searchQuery) {
                    filteredRants = performFuzzySearch(fuzzySearcher, filteredRants, searchQuery);
                }

                if (searchMood) {
                    filteredRants = filteredRants.filter(rant => rant.mood === searchMood);
                }
            }

            // Set the filtered rants to state
            setRantList(filteredRants);
        } catch (err) {
            console.error("Failed to load rants:", err);
            setError("Failed to load rants. Please try again later.");
        } finally {
            setLoading(false);
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

        // Load rants with new filters
        loadRants();
    }, [sortOption, selectedMoods, searchQuery, searchMood]);

    const handleRantSubmit = (content: string, mood: MoodType) => {
        try {
            // Create a new rant with static data
            const newRant: Rant = {
                id: (Math.random() * 1000000).toString(),
                content,
                mood,
                createdAt: new Date().toISOString(),
                likes: 0,
                comments: 0,
                userAlias: 'Anonymous',
            };

            // Add to the beginning of the list
            setRantList(prev => [newRant, ...prev]);

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

    const handleLikeRant = (rantId: string) => {
        // Update the local state to reflect the like
        setRantList(prev =>
            prev.map(rant =>
                rant.id === rantId
                    ? { ...rant, likes: rant.likes + 1 }
                    : rant
            )
        );

        toast({
            title: "Liked!",
            description: "You liked this rant.",
            variant: "default",
        });
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
    };

    // Handle sort change
    const handleSortChange = (option: SortOption) => {
        setSortOption(option);
    };

    // Handle search
    const handleSearch = (query: string, mood: MoodType | null) => {
        setSearchQuery(query);
        setSearchMood(mood);
        if (query || mood) {
            setSortOption("search");
        } else if (sortOption === "search") {
            setSortOption("latest");
        }
    };

    // Debug output
    console.log("Current rants:", rantList);
    console.log("Loading state:", loading);
    console.log("Error state:", error);

    return (
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

                    {loading ? (
                        <div className="flex justify-center py-10">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
                        </div>
                    ) : (
                        <>

                            {rantList.length > 0 ? (
                                <>
                                    {/* Try with MasonryGrid first */}
                                    <MasonryGrid
                                        rants={rantList}
                                        searchTerm={sortOption === "search" ? searchQuery : ""}
                                        gap={24}
                                        onLike={handleLikeRant}
                                    />

                                    {/* Fallback display in case MasonryGrid has issues */}
                                    {false && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                                            {rantList.map(rant => (
                                                <div key={rant.id} className="bg-[#121212] p-4 rounded-lg">
                                                    <p>{rant.content}</p>
                                                    <div className="mt-2 text-sm text-gray-400">
                                                        Mood: {rant.mood} | Likes: {rant.likes}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
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
}

export default Index;
