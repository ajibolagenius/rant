import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { headingContents, colorSchemes } from '@/utils/introContent';
import TypewriterText from '@/components/TypewriterText';
import { cn } from '@/lib/utils';

// Constants for animation and display values
const ANIMATION = {
    HEADING_ROTATION: 8000,
    CONTENT_TRANSITION: 500,
    TYPEWRITER_SPEED: 30,
    SUBTEXT_TYPEWRITER_SPEED: 15,
    CARET_BLINK_DURATION: 0.8,
    BUTTON_SPRING_STIFFNESS: 400,
    BUTTON_SPRING_DAMPING: 10,
    ITEM_SPRING_STIFFNESS: 100,
    ITEM_SPRING_DAMPING: 10,
    ONLINE_INDICATOR_DURATION: 2
};

const MOCK_DATA = {
    ACTIVE_USERS: 126
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
        // These values can be adjusted based on your specific design
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
            className="max-w-3xl"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div
                className="flex items-center gap-2 mb-6"
                variants={itemVariants}
            >
                <div className="bg-[#1A1A1A] text-primary border border-primary/30 px-4 py-1.5 rounded-full text-sm font-medium flex items-center backdrop-blur-sm shadow-lg">
                    <span>Let it all out</span>
                    <motion.span
                        className="inline-block w-2 h-2 ml-2 bg-primary rounded-full"
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
                </div>
            </motion.div>

            {/* Animated heading section with typewriter effect - dynamic height */}
            <div
                className="mb-24"
                style={{
                    height: `${contentHeight}px`,
                    transition: "height 0.5s ease-in-out"
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
                            <h1 className="text-6xl font-bold leading-tight">
                                <span className={colorSchemes[currentColorScheme].heading}>
                                    <TypewriterText
                                        text={headingContents[currentIndex].heading}
                                        showCaret={!hasSubheading}
                                        speed={ANIMATION.TYPEWRITER_SPEED}
                                        onComplete={hasSubheading ? undefined : handleTypingComplete}
                                    />
                                </span>

                                {hasSubheading && (
                                    <>
                                        {" "}
                                        <span className={colorSchemes[currentColorScheme].subheading}>
                                            <TypewriterText
                                                text={headingContents[currentIndex].subheading || ""}
                                                delay={headingContents[currentIndex].heading.length * ANIMATION.TYPEWRITER_SPEED + 200}
                                                showCaret={true}
                                                speed={ANIMATION.TYPEWRITER_SPEED}
                                                onComplete={handleTypingComplete}
                                            />
                                        </span>
                                    </>
                                )}
                            </h1>

                            <div className="text-xl text-gray-300 mt-6 max-w-xl leading-relaxed">
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
                className="flex flex-wrap gap-5 mb-10"
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
                >
                    <Button
                        onClick={onStartRanting}
                        className="bg-gradient-to-r from-[#00C2FF] to-[#904FFF] hover:opacity-90 transition-all rounded-full px-8 py-6 text-base font-medium shadow-lg shadow-primary/20"
                    >
                        Start Ranting
                    </Button>
                </motion.div>

                <motion.div
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                >
                    <Button
                        onClick={onExploreRants}
                        variant="outline"
                        className="border-[#333] bg-[#121212] hover:bg-[#1A1A1A] text-white rounded-full px-8 py-6 text-base font-medium backdrop-blur-sm"
                    >
                        Explore Rants
                    </Button>
                </motion.div>
            </motion.div>

            <motion.div
                className="flex items-center text-sm text-gray-400 gap-3"
                variants={itemVariants}
            >
                <motion.div
                    className="flex items-center justify-center w-6 h-6 rounded-full bg-black/30 border border-green-500/30"
                    animate={{ borderColor: ['rgba(34, 197, 94, 0.3)', 'rgba(34, 197, 94, 0.8)', 'rgba(34, 197, 94, 0.3)'] }}
                    transition={{ duration: ANIMATION.ONLINE_INDICATOR_DURATION, repeat: Infinity }}
                >
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                </motion.div>
                <span><span className="text-green-400 font-medium">{MOCK_DATA.ACTIVE_USERS}</span> people ranting now</span>
            </motion.div>
        </motion.div>
    );
};

export default IntroSection;
