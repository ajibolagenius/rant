import React, { useState, useEffect, useRef } from "react";
import { Rant } from "@/lib/types/rant";
import { generateAlias, MoodType } from "@/lib/utils/mood";
import { rants as initialRants } from "@/lib/data/rants";
import RantForm from "@/components/RantForm";
import SortingBar from "@/components/SortingBar";
import MasonryGrid from "@/components/MasonryGrid";
import IntroSection from "@/components/IntroSection";
import { toast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type SortOption = "latest" | "popular" | "filter" | "search";

const Index: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [rantList, setRantList] = useState<Rant[]>(initialRants);
    const [sortOption, setSortOption] = useState<SortOption>("latest");
    const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchMood, setSearchMood] = useState<MoodType | null>(null);
    const rantFormRef = useRef<HTMLDivElement>(null);
    const rantsListRef = useRef<HTMLDivElement>(null);

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

        // Simulate loading
        const timeout = setTimeout(() => {
            setLoading(false);
        }, 1200);

        return () => clearTimeout(timeout);
    }, [searchParams]);

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

    // Filter and sort rants based on current options
    const getFilteredRants = () => {
        let filtered = [...rantList];

        // Apply search filtering
        if (sortOption === "search") {
            if (searchQuery) {
                filtered = filtered.filter(rant =>
                    rant.content.toLowerCase().includes(searchQuery.toLowerCase())
                );
            }

            if (searchMood) {
                filtered = filtered.filter(rant => rant.mood === searchMood);
            }
        }

        // Apply mood filtering
        if (sortOption === "filter" && selectedMoods.length > 0) {
            filtered = filtered.filter(rant => selectedMoods.includes(rant.mood));
        }

        // Apply sorting
        if (sortOption === "latest" || sortOption === "search" || sortOption === "filter") {
            filtered.sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
        } else if (sortOption === "popular") {
            filtered.sort((a, b) => b.likes - a.likes);
        }

        return filtered;
    };

    const handleRantSubmit = (content: string, mood: MoodType) => {
        const newRant: Rant = {
            id: Date.now().toString(),
            content,
            mood,
            createdAt: new Date().toISOString(),
            likes: 0,
            comments: 0,
            userAlias: generateAlias(),
        };
        setRantList((prev) => [newRant, ...prev]);
        toast({
            title: "Rant Posted!",
            description: "Your rant has been posted anonymously.",
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

    // Handle search - now real-time
    const handleSearch = (query: string, mood: MoodType | null) => {
        setSearchQuery(query);
        setSearchMood(mood);
        if (query || mood) {
            setSortOption("search");
        } else if (sortOption === "search") {
            setSortOption("latest");
        }
    };

    // Get filtered rants based on current options
    const filteredRants = getFilteredRants();

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
                    />

                    {loading ? (
                        <div className="flex justify-center py-10">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
                        </div>
                    ) : (
                        <MasonryGrid
                            rants={filteredRants}
                            searchTerm={sortOption === "search" ? searchQuery : ""}
                            gap={24} // Restore the proper gap between cards
                        />
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Index;
