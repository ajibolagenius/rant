import React, { useState, useEffect } from 'react';
import { getMyRants, getBookmarks } from '@/utils/userStorage';
import { Rant } from '@/lib/types/rant';
import { supabase } from '@/lib/supabase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import RantCard from '@/components/RantCard';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftIcon, BookmarkIcon, PenLineIcon, InfoIcon, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
// Import but don't use translation hook for now
// import { useTranslation } from 'react-i18next';
import { useAccessibility } from '@/components/AccessibilityContext';
import { useNavigate } from 'react-router-dom';

interface MyRantsProps {
    onClose: () => void;
    onLike: (rantId: string) => void;
}

const MyRants: React.FC<MyRantsProps> = ({ onClose, onLike }) => {
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
            } finally {
                setLoading(false);
            }
        };

        fetchRants();
    }, []);

    // Handle keyboard escape
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEsc);

        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
                delayChildren: 0.2
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
                    onClick={() => {
                        onClose();
                        // Small timeout to avoid UI flicker
                        setTimeout(() => {
                            const rantForm = document.getElementById('rant-form');
                            if (rantForm) {
                                rantForm.scrollIntoView({ behavior: 'smooth' });
                            }
                        }, 100);
                    }}
                    className="bg-accent-teal hover:bg-accent-teal/90 text-background-dark font-ui font-medium"
                >
                    Create Your First Rant
                </Button>
            )}
        </div>
    );

    // Handle tab change without closing the modal
    const handleTabChange = (value: string) => {
        console.log("Tab changed to:", value); // Debugging line
        setActiveTab(value);
    };

    return (
        <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => {
                // Close if clicking the backdrop
                console.log("Backdrop clicked"); // Debugging line
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <motion.div
                className="bg-background-dark border border-border-subtle rounded-xl overflow-hidden shadow-high w-full max-w-5xl max-h-[90vh] flex flex-col"
                initial={reducedMotion ? undefined : { opacity: 0, scale: 0.95 }}
                animate={reducedMotion ? undefined : { opacity: 1, scale: 1 }}
                exit={reducedMotion ? undefined : { opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="border-b border-border-subtle bg-gradient-to-r from-background-dark to-background-secondary p-4">
                    <div className="flex items-center justify-between">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="text-text-muted hover:text-text-strong hover:bg-background-secondary font-ui"
                        >
                            <ArrowLeftIcon className="mr-2" size={16} />
                            Back
                        </Button>
                        <h2 className="text-xl font-heading font-bold text-text-strong">My Rants</h2>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="text-text-muted hover:text-text-strong hover:bg-background-secondary rounded-full"
                        >
                            <XIcon size={18} />
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden p-4">
                    <Tabs
                        defaultValue="my-rants"
                        value={activeTab}
                        onValueChange={handleTabChange}
                        className="w-full flex flex-col h-full"
                    >
                        <TabsList className="w-full grid grid-cols-2 bg-background-secondary p-1 rounded-xl mb-4 border border-border-subtle">
                            <TabsTrigger
                                value="my-rants"
                                className="data-[state=active]:bg-primary/30 data-[state=active]:text-text-strong py-2 font-ui font-medium"
                            >
                                <PenLineIcon className="mr-2" size={16} />
                                My Rants
                            </TabsTrigger>
                            <TabsTrigger
                                value="bookmarks"
                                className="data-[state=active]:bg-primary/30 data-[state=active]:text-text-strong py-2 font-ui font-medium"
                            >
                                <BookmarkIcon className="mr-2" size={16} />
                                Bookmarks
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex-1 overflow-hidden">
                            <TabsContent value="my-rants" className="m-0 outline-none h-full">
                                {loading ? (
                                    <div className="flex justify-center items-center py-16">
                                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-accent-teal border-t-transparent"></div>
                                    </div>
                                ) : myRants.length > 0 ? (
                                    <ScrollArea className="h-[calc(80vh-160px)]">
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-4"
                                                variants={containerVariants}
                                                initial={reducedMotion ? undefined : "hidden"}
                                                animate={reducedMotion ? undefined : "visible"}
                                                key="my-rants-grid"
                                            >
                                                {myRants.map((rant, index) => (
                                                    <motion.div
                                                        key={rant.id}
                                                        variants={itemVariants}
                                                    >
                                                        <RantCard
                                                            rant={rant}
                                                            index={index}
                                                            onLike={() => onLike(rant.id)}
                                                        />
                                                    </motion.div>
                                                ))}
                                            </motion.div>
                                        </AnimatePresence>
                                    </ScrollArea>
                                ) : (
                                    <div className="h-full flex items-center justify-center">
                                        {renderEmptyState(true)}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="bookmarks" className="m-0 outline-none h-full">
                                {loading ? (
                                    <div className="flex justify-center items-center py-16">
                                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-accent-teal border-t-transparent"></div>
                                    </div>
                                ) : bookmarkedRants.length > 0 ? (
                                    <ScrollArea className="h-[calc(80vh-160px)]">
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-4"
                                                variants={containerVariants}
                                                initial={reducedMotion ? undefined : "hidden"}
                                                animate={reducedMotion ? undefined : "visible"}
                                                key="bookmarks-grid"
                                            >
                                                {bookmarkedRants.map((rant, index) => (
                                                    <motion.div
                                                        key={rant.id}
                                                        variants={itemVariants}
                                                    >
                                                        <RantCard
                                                            rant={rant}
                                                            index={index}
                                                            onLike={() => onLike(rant.id)}
                                                        />
                                                    </motion.div>
                                                ))}
                                            </motion.div>
                                        </AnimatePresence>
                                    </ScrollArea>
                                ) : (
                                    <div className="h-full flex items-center justify-center">
                                        {renderEmptyState(false)}
                                    </div>
                                )}
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>

                {/* Info footer */}
                <div className="p-4 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-text-muted bg-background-secondary/30">
                    <div className="flex items-center gap-1 text-center sm:text-left font-body">
                        <InfoIcon size={12} />
                        <span>Your rants remain anonymous - data is stored only in your browser</span>
                    </div>
                    <div className="flex gap-3 font-ui">
                        <Button
                            variant="link"
                            size="sm"
                            className="text-xs text-text-muted hover:text-text-strong p-0"
                            onClick={onClose}
                        >
                            Close
                        </Button>
                        <Button
                            variant="link"
                            size="sm"
                            className="text-xs text-accent-teal hover:text-accent-teal/90 p-0"
                            onClick={() => {
                                onClose();
                                navigate('/my-rants');
                            }}
                        >
                            Open full page
                        </Button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default MyRants;
