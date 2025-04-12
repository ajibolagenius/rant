import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import Logo from "../components/Logo";
import IntroSection from "../components/IntroSection";
import RantForm from "../components/RantForm";
import RantList from "../components/RantList";
import Footer from "../components/Footer";
import { motion, AnimatePresence } from 'framer-motion';
import "./Rant.css";

const Rant = () => {
    const [newRant, setNewRant] = useState(null);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [showScrollDown, setShowScrollDown] = useState(true);
    const footerRef = useRef(null);

    const handleRantSubmitted = (rant) => {
        setNewRant(rant);
    };

    // Control visibility of scroll buttons
    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300);

            // Hide the scroll down button when near the bottom
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const scrollPosition = window.scrollY + windowHeight;

            // Hide when within 200px of the bottom
            setShowScrollDown(scrollPosition < documentHeight - 200);
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const scrollToFooter = () => {
        // Instead of scrolling to the footer element, scroll to the bottom of the page
        window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: 'smooth'
        });
    };

    return (
        <div className="rant-page-container">
            {/* <Navbar /> */}
            <main className="main-container">
                <Logo />
                <section className="content-container">
                    <header className="header-section">
                        <IntroSection />
                        <RantForm onRantSubmitted={handleRantSubmitted} />
                    </header>
                    <RantList newRant={newRant} />
                    <div ref={footerRef}>
                        <Footer />
                    </div>
                </section>
            </main>

            {/* Scroll to top button */}
            <AnimatePresence>
                {showScrollTop && (
                    <motion.button
                        className="scroll-top-button"
                        onClick={scrollToTop}
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 19V5M5 12l7-7 7 7" />
                        </svg>
                        <span>Go Up</span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Scroll to bottom button */}
            <AnimatePresence>
                {showScrollDown && (
                    <motion.button
                        className="scroll-down-button"
                        onClick={scrollToFooter}
                        initial={{ opacity: 0, scale: 0.8, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -20 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 5v14M5 12l7 7 7-7" />
                        </svg>
                        <span>Go Down</span>
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Rant;
