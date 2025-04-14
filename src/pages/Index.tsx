import React, { useEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import IntroSection from "@/components/IntroSection";
import RantForm from "@/components/RantForm";
import SortingBar from "@/components/SortingBar";
import Footer from "@/components/Footer";
import { rants as initialRants } from "@/lib/data/rants";
import { Rant } from "@/lib/types/rant";
import { MoodType, generateAlias } from "@/lib/utils/mood";
import { toast } from "sonner";
import RantList from "@/components/RantList";
import RantSkeleton from "@/components/RantSkeleton"; // NEW

type SortOption = "latest" | "popular" | "filter";

const Index: React.FC = () => {
    const [rantList, setRantList] = useState<Rant[]>(initialRants);
    const [sortOption, setSortOption] = useState<SortOption>("latest");
    const [loading, setLoading] = useState(true); // NEW
    const rantFormRef = useRef<HTMLDivElement>(null);
    const rantsListRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setLoading(false);
        }, 1200); // Simulated fetch delay
        return () => clearTimeout(timeout);
    }, []);

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
        toast.success("Your rant has been posted anonymously!");
    };

    const scrollToRantForm = () => {
        rantFormRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const scrollToRantsList = () => {
        rantsListRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSortChange = (option: SortOption) => {
        setSortOption(option);
        let sorted = [...rantList];

        if (option === "latest") {
            sorted.sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
        } else if (option === "popular") {
            sorted.sort((a, b) => b.likes - a.likes);
        }

        setRantList(sorted);
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />

            <main className="container max-w-7xl px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start w-full">
                    <div className="w-full">
                        <IntroSection
                            onStartRanting={scrollToRantForm}
                            onExploreRants={scrollToRantsList}
                        />
                    </div>

                    <div className="w-full" ref={rantFormRef}>
                        <RantForm onSubmit={handleRantSubmit} />
                    </div>
                </div>

                <div className="mt-16 w-full" ref={rantsListRef}>
                    <SortingBar
                        activeOption={sortOption}
                        onOptionChange={handleSortChange}
                    />

                    {/* Loader or Rant List */}
                    {loading ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-10">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <RantSkeleton key={i} />
                            ))}
                        </div>
                    ) : (
                        <RantList rants={rantList} />
                    )}
                </div>

            </main>

            <Footer />
        </div>
    );
};

export default Index;
