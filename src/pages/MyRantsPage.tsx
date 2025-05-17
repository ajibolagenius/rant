import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyRants, getBookmarks } from '@/utils/userStorage';
import { Rant } from '@/lib/types/rant';
import { supabase } from '@/lib/supabase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import RantCard from '@/components/RantCard';
import { ArrowLeftIcon, BookmarkIcon, PenLineIcon, InfoIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { likeRant } from '@/lib/supabase';
import { getAnonymousUserId } from '@/utils/authorId';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { useAccessibility } from '@/components/AccessibilityContext';
import AppHead from "@/components/AppHead";

const MyRantsPage: React.FC = () => {
    const navigate = useNavigate();
    const { reducedMotion } = useAccessibility();
    const [myRants, setMyRants] = useState<Rant[]>([]);
    const [bookmarkedRants, setBookmarkedRants] = useState<Rant[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('my-rants');

    useEffect(() => {
        const fetchRants = async () => {
            setLoading(true);
            try {
                // Get IDs of user's rants and bookmarks
                const myRantIds = getMyRants();
                const bookmarkIds = getBookmarks();

                if (myRantIds.length === 0 && bookmarkIds.length === 0) {
                    setLoading(false);
                    return;
                }

                // Fetch all needed rants in one query
                const allIds = [...new Set([...myRantIds, ...bookmarkIds])];

                const { data, error } = await supabase
                    .from('rants')
                    .select('*')
                    .in('id', allIds);

                if (error) {
                    throw error;
                }

                if (data) {
                    // Separate into my rants and bookmarked rants
                    const myRantsData = data.filter(rant => myRantIds.includes(rant.id));
                    const bookmarkedRantsData = data.filter(rant => bookmarkIds.includes(rant.id));

                    setMyRants(myRantsData);
                    setBookmarkedRants(bookmarkedRantsData);
                }
            } catch (error) {
                console.error('Error fetching rants:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to load your rants. Please try again.',
                    variant: 'error'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchRants();
    }, []);

    const handleLikeRant = async (rantId: string) => {
        try {
            const authorId = getAnonymousUserId();

            // Optimistically update the UI
            const updateRants = (rants: Rant[]) =>
                rants.map(rant =>
                    rant.id === rantId ? { ...rant, likes: rant.likes + 1 } : rant
                );

            setMyRants(updateRants);
            setBookmarkedRants(updateRants);

            // Perform the actual like operation
            await likeRant(rantId, getAnonymousUserId());
        } catch (error) {
            console.error('Error liking rant:', error);
            toast({
                title: 'Error',
                description: 'Failed to like this rant. You may have already liked it.',
                variant: 'destructive'
            });
        }
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15
            }
        }
    };

    // Render empty state for both tabs
    const renderEmptyState = (isMyRants: boolean) => (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-background-secondary/20 rounded-xl border border-border-subtle mt-4">
            <div className="w-16 h-16 bg-background-secondary rounded-full flex items-center justify-center mb-4">
                {isMyRants ? (
                    <PenLineIcon className="w-8 h-8 text-text-muted" />
                ) : (
                    <BookmarkIcon className="w-8 h-8 text-text-muted" />
                )}
            </div>
            <h3 className="text-xl font-heading font-semibold text-text-strong mb-2">
                {isMyRants ? "No Rants Yet" : "No Bookmarks Yet"}
            </h3>
            <p className="text-text-muted text-center mb-6 max-w-md font-body">
                {isMyRants
                    ? "When you post rants, they will appear here for you to manage."
                    : "You haven't bookmarked any rants yet. Click the bookmark icon on rants you want to save."}
            </p>
            {isMyRants && (
                <Button
                    onClick={() => navigate('/')}
                    className="bg-accent-teal hover:bg-accent-teal/90 text-background-dark font-ui font-medium"
                >
                    Create Your First Rant
                </Button>
            )}
        </div>
    );

    return (
        <>
            <AppHead
                title="My Rants & Bookmarks | Rant"
                description="View and manage your anonymous rants and bookmarks on Rant. Your rants are private and stored only in your browser."
            />
            <div className="min-h-screen bg-background-primary">
                <Navbar />

                <div className="container mx-auto px-4 py-8 max-w-6xl">
                    <motion.div
                        className="bg-background-dark border border-border-subtle rounded-xl overflow-hidden shadow-high"
                        initial={reducedMotion ? undefined : { opacity: 0, y: 20 }}
                        animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="border-b border-border-subtle bg-gradient-to-r from-background-dark to-background-secondary p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigate('/')}
                                    className="text-text-muted hover:text-text-strong hover:bg-background-secondary font-ui"
                                >
                                    <ArrowLeftIcon className="mr-2" size={16} />
                                    Back
                                </Button>
                                <h1 className="text-xl sm:text-2xl font-heading font-bold text-text-strong">My Rants</h1>
                                <div className="w-[70px]"></div> {/* Spacer for centering */}
                            </div>
                        </div>

                        <div className="p-4 sm:p-6">
                            <Tabs
                                defaultValue="my-rants"
                                value={activeTab}
                                onValueChange={setActiveTab}
                                className="w-full"
                            >
                                <TabsList className="w-full grid grid-cols-2 bg-background-secondary p-1 rounded-xl mb-6 border border-border-subtle">
                                    <TabsTrigger
                                        value="my-rants"
                                        className="data-[state=active]:bg-primary data-[state=active]:text-white py-2 font-ui font-medium"
                                    >
                                        <PenLineIcon className="mr-2" size={16} />
                                        My Rants
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="bookmarks"
                                        className="data-[state=active]:bg-primary data-[state=active]:text-white py-2 font-ui font-medium"
                                    >
                                        <BookmarkIcon className="mr-2" size={16} />
                                        Bookmarks
                                    </TabsTrigger>
                                </TabsList>

                                <div className="relative min-h-[60vh]">
                                    <TabsContent value="my-rants" className="p-0 m-0 outline-none">
                                        {loading ? (
                                            <div className="flex justify-center items-center py-16">
                                                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                                            </div>
                                        ) : myRants.length > 0 ? (
                                            <ScrollArea className="h-[60vh] pr-4">
                                                <motion.div
                                                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                                                    variants={containerVariants}
                                                    initial={reducedMotion ? undefined : "hidden"}
                                                    animate={reducedMotion ? undefined : "visible"}
                                                >
                                                    {myRants.map((rant, index) => (
                                                        <motion.div
                                                            key={rant.id}
                                                            variants={itemVariants}
                                                        >
                                                            <RantCard
                                                                rant={rant}
                                                                index={index}
                                                                onLike={() => handleLikeRant(rant.id)}
                                                            />
                                                        </motion.div>
                                                    ))}
                                                </motion.div>
                                            </ScrollArea>
                                        ) : (
                                            renderEmptyState(true)
                                        )}
                                    </TabsContent>

                                    <TabsContent value="bookmarks" className="p-0 m-0 outline-none">
                                        {loading ? (
                                            <div className="flex justify-center items-center py-16">
                                                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                                            </div>
                                        ) : bookmarkedRants.length > 0 ? (
                                            <ScrollArea className="h-[60vh] pr-4">
                                                <motion.div
                                                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                                                    variants={containerVariants}
                                                    initial={reducedMotion ? undefined : "hidden"}
                                                    animate={reducedMotion ? undefined : "visible"}
                                                >
                                                    {bookmarkedRants.map((rant, index) => (
                                                        <motion.div
                                                            key={rant.id}
                                                            variants={itemVariants}
                                                        >
                                                            <RantCard
                                                                rant={rant}
                                                                index={index}
                                                                onLike={() => handleLikeRant(rant.id)}
                                                            />
                                                        </motion.div>
                                                    ))}
                                                </motion.div>
                                            </ScrollArea>
                                        ) : (
                                            renderEmptyState(false)
                                        )}
                                    </TabsContent>
                                </div>
                            </Tabs>

                            {/* Info footer */}
                            <div className="mt-6 pt-4 border-t border-border-subtle flex items-center justify-between text-xs text-text-muted">
                                <div className="flex items-center gap-1 font-body">
                                    <InfoIcon size={12} />
                                    <span>Your rants remain anonymous - data is stored only in your browser</span>
                                </div>
                                <div className="font-ui">
                                    <Button
                                        variant="link"
                                        size="sm"
                                        className="text-xs text-primary hover:text-primary/90 p-0"
                                        onClick={() => navigate('/')}
                                    >
                                        Browse all rants
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <Footer />
        </>
    );
};

export default MyRantsPage;
