import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../supabaseClient';
import RantCard from './RantCard';
import '../pages/Rant.css';

const RANTS_PER_PAGE = 9;

const moodFilterOptions = [
    { label: 'Sad', emoji: '😔' },
    { label: 'Crying', emoji: '😭' },
    { label: 'Angry', emoji: '😠' },
    { label: 'Eye Roll', emoji: '🙄' },
    { label: 'Heartbroken', emoji: '💔' },
    { label: 'Mind Blown', emoji: '🤯' },
    { label: 'Laughing', emoji: '😂' },
    { label: 'Smiling', emoji: '😊' },
    { label: 'Bored', emoji: '🥱' },
    { label: 'Loved', emoji: '❤️' }
];

// Skeleton component for loading state
const RantCardSkeleton = () => {
    const randomWidth = () => `${Math.floor(Math.random() * 30) + 70}%`;

    return (
        <motion.div
            className="rant-card-container skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="rant-card-content">
                <div className="rant-card-header">
                    <div className="rant-card-emoji-wrapper skeleton-pulse"></div>
                    <div className="rant-card-likes-container">
                        <div className="skeleton-pulse" style={{ width: '40px', height: '16px', borderRadius: '4px' }}></div>
                    </div>
                </div>

                <div className="rant-card-text-container">
                    <div className="skeleton-pulse" style={{ width: randomWidth(), height: '16px', borderRadius: '4px', marginBottom: '8px' }}></div>
                    <div className="skeleton-pulse" style={{ width: randomWidth(), height: '16px', borderRadius: '4px', marginBottom: '8px' }}></div>
                    <div className="skeleton-pulse" style={{ width: randomWidth(), height: '16px', borderRadius: '4px' }}></div>
                </div>
            </div>

            <div className="rant-card-footer">
                <div className="rant-card-author-container">
                    <div className="rant-card-author-icon skeleton-pulse"></div>
                    <div className="skeleton-pulse" style={{ width: '80px', height: '16px', borderRadius: '4px' }}></div>
                </div>

                <div className="rant-card-actions-container">
                    <div className="skeleton-pulse" style={{ width: '24px', height: '24px', borderRadius: '50%', margin: '0 8px' }}></div>
                    <div className="skeleton-pulse" style={{ width: '24px', height: '24px', borderRadius: '50%', margin: '0 8px' }}></div>
                    <div className="skeleton-pulse" style={{ width: '24px', height: '24px', borderRadius: '50%', margin: '0 8px' }}></div>
                </div>
            </div>
        </motion.div>
    );
};

const RantList = ({ newRant }) => {
    const [filter, setFilter] = useState('latest');
    const [selectedMoods, setSelectedMoods] = useState([]);
    const [rants, setRants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);
    const observer = useRef();

    const fetchRants = useCallback(async (currentPage, currentFilter, reset = false) => {
        setLoading(true);
        const from = currentPage * RANTS_PER_PAGE;
        const to = from + RANTS_PER_PAGE - 1;

        let query = supabase
            .from('rants')
            .select('*')
            .range(from, to);

        if (selectedMoods.length > 0) {
            query = query.in('mood', selectedMoods);
        }

        query = query.order(currentFilter === 'latest' ? 'created_at' : 'likes', { ascending: false });

        // Simulate network delay for demo purposes (remove in production)
        // await new Promise(resolve => setTimeout(resolve, 1500));

        const { data, error } = await query;

        if (error) {
            setHasMore(false);
        } else if (data) {
            setRants(prev => reset ? data : [...prev, ...data]);
            setHasMore(data.length === RANTS_PER_PAGE);
            setPage(currentPage + 1);
        }

        setLoading(false);
        setInitialLoading(false);
    }, [selectedMoods]);

    useEffect(() => {
        setRants([]);
        setPage(0);
        setHasMore(true);
        setInitialLoading(true);
        fetchRants(0, filter, true);
    }, [filter, selectedMoods, fetchRants]);

    useEffect(() => {
        const savedMoods = localStorage.getItem('selectedMoods');
        if (savedMoods) {
            setSelectedMoods(JSON.parse(savedMoods));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('selectedMoods', JSON.stringify(selectedMoods));
    }, [selectedMoods]);

    // Inject local new rant if passed from parent
    useEffect(() => {
        if (newRant) {
            setRants(prev => {
                if (prev.some(r => r.id === newRant.id)) return prev;
                return [newRant, ...prev];
            });
        }
    }, [newRant]);

    // Supabase real-time listener for INSERT, UPDATE (likes), DELETE
    useEffect(() => {
        const channel = supabase
            .channel('rants-realtime')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'rants' }, (payload) => {
                const newIncomingRant = payload.new;
                setRants(prev => {
                    if (prev.some(r => r.id === newIncomingRant.id)) return prev;
                    return [newIncomingRant, ...prev];
                });
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rants' }, (payload) => {
                const updatedRant = payload.new;
                setRants(prev => prev.map(r => (r.id === updatedRant.id ? { ...r, ...updatedRant } : r)));
            })
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'rants' }, (payload) => {
                const deletedId = payload.old.id;
                setRants(prev => prev.filter(r => r.id !== deletedId));
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const lastRantElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                fetchRants(page, filter);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore, page, filter, fetchRants]);

    const toggleMoodFilter = (mood) => {
        setSelectedMoods(prev =>
            prev.includes(mood) ? prev.filter(m => m !== mood) : [...prev, mood]
        );
    };

    const clearMoodFilters = () => {
        setSelectedMoods([]);
    };

    return (
        <div className="rants-section-container">
            {/* Header */}
            <div className="rants-header-container">
                <div className="rants-header">
                    <span className="rants-header-text">Hottest Rants</span>
                    <img className="rants-header-emoji" src="/assets/images/_emoji_fire.svg" alt="fire emoji" />
                </div>

                <div className="rants-filter-container">
                    <motion.button
                        className={`button rant-filter-button ${filter === 'latest' ? 'active' : ''}`}
                        onClick={() => setFilter('latest')}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={loading}
                    >
                        <span className="rant-filter-button-text">Latest</span>
                    </motion.button>
                    <motion.button
                        className={`button rant-filter-button ${filter === 'popular' ? 'active' : ''}`}
                        onClick={() => setFilter('popular')}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={loading}
                    >
                        <span className="rant-filter-button-text">Popular</span>
                    </motion.button>
                </div>
            </div>

            {/* Mood Filter Bar */}
            <div className="mood-filter-bar">
                {moodFilterOptions.map(({ label, emoji }) => (
                    <motion.button
                        key={label}
                        whileTap={{ scale: 0.92 }}
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                        onClick={() => toggleMoodFilter(label)}
                        className={`mood-filter-button ${selectedMoods.includes(label) ? 'selected' : ''}`}
                    >
                        <span>{emoji}</span>
                        <span>{label}</span>
                    </motion.button>
                ))}
                {selectedMoods.length > 0 && (
                    <motion.button onClick={clearMoodFilters} className="clear-mood-filters">
                        Clear Filters ✖
                    </motion.button>
                )}
            </div>

            {/* Mood Filter Summary */}
            {selectedMoods.length > 0 && (
                <div className="active-filter-summary">
                    <span style={{ color: '#aaa' }}>Filtering by:</span>
                    {selectedMoods.map(mood => {
                        const emoji = moodFilterOptions.find(opt => opt.label === mood)?.emoji || '';
                        return (
                            <span key={mood} className="active-filter-badge">
                                {emoji} {mood}
                            </span>
                        );
                    })}
                </div>
            )}

            {/* Rants List */}
            <motion.div className="rants-list-container" initial="hidden" animate="visible">
                <AnimatePresence>
                    {/* Show skeletons during initial loading */}
                    {initialLoading ? (
                        Array.from({ length: 6 }).map((_, index) => (
                            <RantCardSkeleton key={`skeleton-${index}`} />
                        ))
                    ) : (
                        rants.map((rant, index) => {
                            const isLast = rants.length === index + 1;
                            return (
                                <motion.div
                                    key={rant.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.4 }}
                                    ref={isLast ? lastRantElementRef : null}
                                >
                                    <RantCard
                                        id={rant.id}
                                        moodName={rant.mood}
                                        likes={rant.likes}
                                        text={rant.content}
                                        index={index}
                                    />
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Loading Skeletons for Infinite Scroll */}
            {loading && !initialLoading && (
                <div className="loading-more-skeletons">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <RantCardSkeleton key={`scroll-skeleton-${index}`} />
                    ))}
                </div>
            )}

            {/* End States */}
            {!loading && !hasMore && rants.length > 0 && (
                <p style={{ textAlign: 'center', padding: '20px', color: '#888' }}>You've reached the end!</p>
            )}
            {!loading && !initialLoading && rants.length === 0 && (
                <p style={{ textAlign: 'center', padding: '20px' }}>No rants found for selected mood(s). 🧘</p>
            )}
        </div>
    );
};

export default RantList;
