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
// Import but don't use translation hook for now
// import { useTranslation } from 'react-i18next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { likeRant } from '@/lib/supabase';
import { getAuthorId } from '@/utils/authorId';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { useAccessibility } from '@/components/AccessibilityContext';

const MyRantsPage: React.FC = () => {
    // Commented out until translation issue is fixed
    // const { t } = useTranslation();
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
                    variant: 'destructive'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchRants();
    }, []);

    const handleLikeRant = async (rantId: string) => {
        try {
            const authorId = getAuthorId();

            // Optimistically update the UI
            const updateRants = (rants: Rant[]) =>
                rants.map(rant =>
                    rant.id === rantId ? { ...rant, likes: rant.likes + 1 } : rant
                );

            setMyRants(updateRants);
            setBookmarkedRants(updateRants);

            // Perform the actual like operation
            await likeRant(rantId, authorId);
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
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-gray-900/20 rounded-xl border border-gray-800 mt-4">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                {isMyRants ? (
                    <PenLineIcon className="w-8 h-8 text-gray-400" />
                ) : (
                    <BookmarkIcon className="w-8 h-8 text-gray-400" />
                )}
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
                {isMyRants ? "No Rants Yet" : "No Bookmarks Yet"}
            </h3>
            <p className="text-gray-400 text-center mb-6 max-w-md">
                {isMyRants
                    ? "When you post rants, they will appear here for you to manage."
                    : "You haven't bookmarked any rants yet. Click the bookmark icon on rants you want to save."}
            </p>
            {isMyRants && (
                <Button
                    onClick={() => navigate('/')}
                    className="bg-cyan-700 hover:bg-cyan-600 text-white"
                >
                    Create Your First Rant
                </Button>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-[#09090B]">
            <Navbar />

            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <motion.div
                    className="bg-[#121217] border border-[#2e2e3a] rounded-xl overflow-hidden shadow-xl"
                    initial={reducedMotion ? undefined : { opacity: 0, y: 20 }}
                    animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="border-b border-[#2e2e3a] bg-gradient-to-r from-[#121217] to-[#1a1a24] p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate('/')}
                                className="text-gray-400 hover:text-white hover:bg-[#252532]"
                            >
                                <ArrowLeftIcon className="mr-2" size={16} />
                                Back
                            </Button>
                            <h1 className="text-xl sm:text-2xl font-bold text-white">My Rants</h1>
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
                            <TabsList className="w-full grid grid-cols-2 bg-[#1a1a24] p-1 rounded-xl mb-6 border border-[#2e2e3a]">
                                <TabsTrigger
                                    value="my-rants"
                                    className="data-[state=active]:bg-cyan-800/30 data-[state=active]:text-white py-2 font-medium"
                                >
                                    <PenLineIcon className="mr-2" size={16} />
                                    My Rants
                                </TabsTrigger>
                                <TabsTrigger
                                    value="bookmarks"
                                    className="data-[state=active]:bg-cyan-800/30 data-[state=active]:text-white py-2 font-medium"
                                >
                                    <BookmarkIcon className="mr-2" size={16} />
                                    Bookmarks
                                </TabsTrigger>
                            </TabsList>

                            <div className="relative min-h-[60vh]">
                                <TabsContent value="my-rants" className="p-0 m-0 outline-none">
                                    {loading ? (
                                        <div className="flex justify-center items-center py-16">
                                            <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
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
                                            <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
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
                        <div className="mt-6 pt-4 border-t border-[#2e2e3a] flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                                <InfoIcon size={12} />
                                <span>Your rants remain anonymous - data is stored only in your browser</span>
                            </div>
                            <div>
                                <Button
                                    variant="link"
                                    size="sm"
                                    className="text-xs text-cyan-400 hover:text-cyan-300 p-0"
                                    onClick={() => navigate('/')}
                                >
                                    Browse all rants
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            <Footer />
        </div>
    );
};

export default MyRantsPage;
