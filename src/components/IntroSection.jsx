import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../supabaseClient';
import '../pages/Rant.css';


const IntroSection = () => {
    const [rantCount, setRantCount] = useState(0);
    const [loadingCount, setLoadingCount] = useState(true);

    useEffect(() => {
        const fetchCount = async () => {
            setLoadingCount(true);
            // Fetch count using Supabase head request for efficiency
            const { count, error } = await supabase
                .from('rants')
                .select('*', { count: 'exact', head: true });

            if (error) {
                // console.error('Error fetching rant count:', error); // Debugging line
            } else {
                setRantCount(count || 0);
            }
            setLoadingCount(false);
        };

        fetchCount();

        // Set up real-time subscription for count updates
        const subscription = supabase
            .channel('rants-count-channel')
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'rants' },
                () => {
                    // Increment the count when a new rant is added
                    setRantCount(prevCount => prevCount + 1);
                }
            )
            .on('postgres_changes',
                { event: 'DELETE', schema: 'public', table: 'rants' },
                () => {
                    // Decrement the count when a rant is deleted
                    setRantCount(prevCount => Math.max(0, prevCount - 1));
                }
            )
            .subscribe();

        // Cleanup subscription on component unmount
        return () => {
            subscription.unsubscribe();
        };
    }, []); // Empty dependency array means run once on mount

    const scrollToRants = () => {
        const rantsSection = document.querySelector('.rants-section-container');
        if (rantsSection) {
            rantsSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // --- Framer Motion Variants ---
    const containerVariants = { /* ... */ };
    const itemVariants = { /* ... */ };

    // Pulsating animation for the rant count indicator
    const pulsateVariants = {
        pulse: {
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    return (
        <motion.div
            className="intro-container"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div className="intro-header-badge" variants={itemVariants}>
                {/* ... badge content ... */}
                <span className="intro-header-badge-text">Let it all out</span>
                <img
                    className="intro-header-badge-emoji"
                    src="/assets/images/_emoji_speaking_head.svg"
                    alt="speaking head emoji"
                />
            </motion.div>

            <motion.div className="intro-text-container" variants={itemVariants}>
                <span className="intro-title gradient-text-brand">
                    RANT ABOUT ANYTHING!
                </span>
                <span className="intro-description">
                    This is a safe place where your unfiltered thoughts meet the void.
                    No judgment, just pure catharsis.
                </span>
            </motion.div>

            <motion.div className="button-section-container" variants={itemVariants}>
                <div className="button-group">
                    <motion.button
                        className="button button-primary"
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            const form = document.querySelector('.form-container');
                            if (form) form.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }}
                    >
                        <span className="button-text">Start Ranting</span>
                    </motion.button>
                    <motion.button
                        className="button button-secondary"
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={scrollToRants}
                    >
                        <span className="button-text">Explore Rants</span>
                    </motion.button>
                </div>
                {/* Dynamic Rant Count Display */}
                <div className="rant-count-container">
                    <motion.div
                        className="rant-count-indicator"
                        variants={pulsateVariants}
                        animate="pulse"
                    ></motion.div>
                    <span className="rant-count-text">
                        {loadingCount
                            ? "Counting rants..."
                            : `${rantCount} people have ranted so far!`}
                    </span>
                </div>
            </motion.div>
        </motion.div>
    );
};

IntroSection.defaultProps = {
    containerVariants: {
        hidden: { opacity: 0, x: -50 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut", when: "beforeChildren", staggerChildren: 0.1 } }
    },
    itemVariants: {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
    }
};


export default IntroSection;
