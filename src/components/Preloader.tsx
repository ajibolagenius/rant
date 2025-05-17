import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMoodEmoji, getMoodLabel, allMoods } from '../lib/utils/mood';

const preloaderVariants = {
    initial: { opacity: 1 },
    animate: { opacity: 1 },
    exit: { opacity: 0, transition: { duration: 0.6 } },
};

const GRADIENT = 'linear-gradient(90deg, #00C2FF 0%, #904FFF 100%)';

const MOOD_DISPLAY_TIME = 900; // ms per mood
const LOADING_DURATION = 5000; // 5 seconds

const LOADING_QUOTES = [
    "Loading the space for unfiltered thought...",
    "Warming up the anonymous confessions...",
    "Setting up your safe space...",
    "Letting thoughts run wild...",
    "Preparing a judgment-free zone...",
    "Opening the vault of secrets...",
    "Tuning in to your inner voice...",
    "Making room for your rants...",
    "Brewing a fresh batch of honesty...",
    "Giving your mind a megaphone...",
    "Inviting your unfiltered self...",
    "Spinning up the venting chamber...",
    "Unleashing the real you...",
    "Loading a world without filters...",
    "Getting ready for raw expression..."
];

interface PreloaderProps {
    show?: boolean;
    onDone?: () => void;
}

const Preloader: React.FC<PreloaderProps> = ({ show = true, onDone }) => {
    const [progress, setProgress] = useState(0);
    const [currentMood, setCurrentMood] = useState(allMoods[0]);
    const [moodIndex, setMoodIndex] = useState(0);
    const [quote, setQuote] = useState(LOADING_QUOTES[0]);
    const progressRef = useRef<NodeJS.Timeout | null>(null);
    const moodRef = useRef<NodeJS.Timeout | null>(null);
    const darkBg = 'linear-gradient(135deg, #09090B 0%, #181824 100%)';

    // Animate progress bar for 5 seconds
    useEffect(() => {
        if (!show) return;
        const start = Date.now();
        progressRef.current = setInterval(() => {
            const elapsed = Date.now() - start;
            const percent = Math.min(100, Math.round((elapsed / LOADING_DURATION) * 100));
            setProgress(percent);
            if (percent >= 100 && progressRef.current) {
                clearInterval(progressRef.current);
            }
        }, 30);
        return () => {
            if (progressRef.current) clearInterval(progressRef.current);
        };
    }, [show]);

    // Mood emoji/text randomizer
    useEffect(() => {
        if (!show) return;
        moodRef.current = setInterval(() => {
            const nextIndex = Math.floor(Math.random() * allMoods.length);
            setMoodIndex(nextIndex);
            setCurrentMood(allMoods[nextIndex]);
        }, MOOD_DISPLAY_TIME);
        return () => {
            if (moodRef.current) clearInterval(moodRef.current);
        };
    }, [show]);

    // Pick a random quote on mount
    useEffect(() => {
        setQuote(LOADING_QUOTES[Math.floor(Math.random() * LOADING_QUOTES.length)]);
    }, []);

    // Call onDone after 5 seconds
    useEffect(() => {
        if (progress >= 100 && onDone) {
            onDone();
        }
    }, [progress, onDone]);

    if (!show || progress >= 100) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[9999] flex items-center justify-center min-h-[100dvh] sm:min-h-screen w-full"
                style={{ background: darkBg }}
                variants={preloaderVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                role="status"
                aria-live="polite"
            >
                <motion.div className="flex flex-col items-center justify-center w-full h-full gap-8 px-4">
                    {/* Loading quote */}
                    <div className="mb-2 text-center w-full max-w-lg">
                        <span className="block text-xs sm:text-sm md:text-base font-light text-cyan-100/50 tracking-wide select-none">
                            {quote}
                        </span>
                    </div>
                    {/* Indicator bar */}
                    <div className="w-full max-w-xs sm:max-w-sm md:max-w-md flex items-center gap-2">
                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full"
                                style={{
                                    width: `${progress}%`,
                                    background: GRADIENT,
                                    transition: 'width 0.2s linear',
                                }}
                            />
                        </div>
                        <span className="text-xs text-cyan-100 font-mono w-10 text-right">
                            {progress}%
                        </span>
                    </div>
                    {/* Mood emoji and text */}
                    <motion.div
                        key={currentMood}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col items-center mt-4 min-h-[56px]"
                    >
                        <span className="text-3xl md:text-4xl mb-1">
                            <img src={getMoodEmoji(currentMood)} alt={getMoodLabel(currentMood)} className="w-10 h-10 md:w-12 md:h-12 object-contain" />
                        </span>
                        <span className="text-base md:text-lg text-cyan-100 font-semibold font-ui">
                            {getMoodLabel(currentMood)}
                        </span>
                    </motion.div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default Preloader;
