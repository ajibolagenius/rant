import React, { useState, useEffect, useMemo } from 'react';
import Button from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { headingContents, colorSchemes } from '@/utils/introContent';
import TypewriterText from '@/components/TypewriterText';
import { cn } from '@/lib/utils';
import { useRantCount } from '@/hooks/useRantCount';
import { colors } from '@/utils/colors';

// Constants for animation and display values
const ANIMATION = {
    HEADING_ROTATION: 8000,
    CONTENT_TRANSITION: 500,
    TYPEWRITER_SPEED: 30,
    SUBTEXT_TYPEWRITER_SPEED: 10,
    CARET_BLINK_DURATION: 0.8,
    BUTTON_SPRING_STIFFNESS: 400,
    BUTTON_SPRING_DAMPING: 10,
    ITEM_SPRING_STIFFNESS: 100,
    ITEM_SPRING_DAMPING: 10,
    ONLINE_INDICATOR_DURATION: 2
};

// Animation variants defined outside the component
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
            delayChildren: 0.3,
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
            stiffness: ANIMATION.ITEM_SPRING_STIFFNESS,
            damping: ANIMATION.ITEM_SPRING_DAMPING
        }
    }
};

const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.5 } }
};

const buttonVariants = {
    hover: {
        scale: 1.05,
        transition: {
            type: "spring",
            stiffness: ANIMATION.BUTTON_SPRING_STIFFNESS,
            damping: ANIMATION.BUTTON_SPRING_DAMPING
        }
    },
    tap: { scale: 0.95 }
};

// Function to get a random index for headingContents
const getRandomHeadingIndex = () => {
    return Math.floor(Math.random() * headingContents.length);
};

// Function to get a random index for colorSchemes
const getRandomColorIndex = () => {
    return Math.floor(Math.random() * colorSchemes.length);
};

interface IntroSectionProps {
    onStartRanting: () => void;
    onExploreRants: () => void;
}

const IntroSection: React.FC<IntroSectionProps> = ({ onStartRanting, onExploreRants }) => {
    // Initialize with random indices on page load
    const [currentIndex, setCurrentIndex] = useState(() => getRandomHeadingIndex());
    const [currentColorScheme, setCurrentColorScheme] = useState(() => getRandomColorIndex());
    const [showContent, setShowContent] = useState(true);
    const [contentHeight, setContentHeight] = useState(240); // Default height
    const [typingComplete, setTypingComplete] = useState(false);
    const { count: activeUsers, loading: countLoading } = useRantCount();

    // Memoize the hasSubheading value
    const hasSubheading = useMemo(() =>
        Boolean(headingContents[currentIndex].subheading),
        [currentIndex]
    );

    // Calculate estimated content height based on text length
    useEffect(() => {
        const currentHeading = headingContents[currentIndex];
        const totalTextLength =
            currentHeading.heading.length +
            (currentHeading.subheading?.length || 0) +
            currentHeading.subtext.length;

        // Base height plus additional height for longer content
        const estimatedHeight = Math.max(
            240, // Minimum height
            240 + Math.floor(totalTextLength / 50) * 30 // Add 30px for every 50 chars
        );

        setContentHeight(estimatedHeight);
        setTypingComplete(false);
    }, [currentIndex]);

    // Function to handle when typing is complete
    const handleTypingComplete = () => {
        setTypingComplete(true);
    };

    // Rotate through headings
    useEffect(() => {
        let contentChangeTimeout: NodeJS.Timeout;

        const contentInterval = setInterval(() => {
            setShowContent(false);

            // Wait for exit animation to complete before changing content
            contentChangeTimeout = setTimeout(() => {
                setCurrentIndex((prevIndex) => {
                    // Get a new random index that's different from the current one
                    let newIndex;
                    do {
                        newIndex = getRandomHeadingIndex();
                    } while (newIndex === prevIndex && headingContents.length > 1);
                    return newIndex;
                });
                setCurrentColorScheme(getRandomColorIndex());
                setShowContent(true);
            }, ANIMATION.CONTENT_TRANSITION);
        }, ANIMATION.HEADING_ROTATION);

        return () => {
            clearInterval(contentInterval);
            clearTimeout(contentChangeTimeout);
        };
    }, []);

    return (
        <motion.div
            className="max-w-3xl w-full"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div
                className="flex items-center gap-2 mb-6"
                variants={itemVariants}
            >
                <motion.div
                    className="bg-background-dark text-primary border border-border-subtle px-4 py-1.5 rounded-full text-sm font-medium flex items-center backdrop-blur-sm shadow-medium font-ui"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}

                    drag
                    dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                    dragElastic={0.1} // the higher the value, the more "bouncy" the drag
                >
                    <span>Let it all out</span>
                    <motion.span
                        className="inline-block w-2 h-2 ml-2 bg-accent-teal rounded-full"
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [1, 0.8, 1]
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                </motion.div>
            </motion.div>

            {/* Animated heading section with typewriter effect - dynamic height */}
            <div
                className="mb-12 sm:mb-16 md:mb-24"
                style={{
                    minHeight: `${contentHeight}px`,
                    transition: "min-height 0.5s ease-in-out"
                }}
            >
                <AnimatePresence mode="wait">
                    {showContent && (
                        <motion.div
                            key={currentIndex}
                            variants={contentVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="h-full"
                        >
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight font-heading">
                                <span className={colorSchemes[currentColorScheme].heading}>
                                    <TypewriterText
                                        text={headingContents[currentIndex].heading}
                                        showCaret={!hasSubheading}
                                        speed={ANIMATION.TYPEWRITER_SPEED}
                                        onComplete={hasSubheading ? undefined : handleTypingComplete}
                                    />
                                </span>
                            </h1>

                            <div className="text-base sm:text-lg md:text-xl text-text-muted mt-4 sm:mt-6 max-w-xl leading-relaxed font-body">
                                <TypewriterText
                                    text={headingContents[currentIndex].subtext}
                                    delay={(headingContents[currentIndex].heading.length +
                                        (headingContents[currentIndex].subheading?.length || 0)) * ANIMATION.TYPEWRITER_SPEED + 400}
                                    speed={ANIMATION.SUBTEXT_TYPEWRITER_SPEED}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <motion.div
                className="flex flex-col sm:flex-row w-full justify-center sm:justify-start flex-wrap gap-5 mb-10"
                variants={itemVariants}
                initial={{ opacity: 0 }}
                animate={{
                    opacity: typingComplete ? 1 : 0.7,
                    y: 0
                }}
                transition={{ duration: 0.5 }}
            >
                <motion.div
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="w-full sm:w-auto"
                >
                    <Button
                        onClick={onStartRanting}
                        className="w-full bg-gradient-to-r from-primary to-accent-teal hover:opacity-90 transition-all rounded-full px-8 py-6 text-base font-medium shadow-medium shadow-primary/20 font-ui"
                    >
                        Start Ranting
                    </Button>
                </motion.div>

                <motion.div
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="w-full sm:w-auto"
                >
                    <Button
                        onClick={onExploreRants}
                        variant="outline"
                        className="w-full border-border-subtle bg-background-dark hover:bg-background-secondary text-text-strong rounded-full px-8 py-6 text-base font-medium backdrop-blur-sm font-ui"
                    >
                        Explore Rants
                    </Button>
                </motion.div>
            </motion.div>

            <motion.div
                className="flex items-center text-sm text-text-muted gap-3"
                variants={itemVariants}
            >
                <motion.div
                    className="flex items-center justify-center w-6 h-6 rounded-full bg-background-dark/30 border border-utility-success/30"
                    animate={{ borderColor: ['rgba(52, 211, 153, 0.3)', 'rgba(52, 211, 153, 0.8)', 'rgba(52, 211, 153, 0.3)'] }}
                    transition={{ duration: ANIMATION.ONLINE_INDICATOR_DURATION, repeat: Infinity }}
                >
                    <div className="w-2 h-2 bg-utility-success rounded-full" />
                </motion.div>
                <span className="font-ui">
                    <span className="text-utility-success font-medium">
                        {countLoading ? '...' : activeUsers}
                    </span> people ranting now
                </span>
            </motion.div>
        </motion.div >
    );
};

export default IntroSection;
