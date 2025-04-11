import React, { useState, useEffect } from "react";
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

    const handleRantSubmitted = (rant) => {
        setNewRant(rant);
    };

    // Control visibility of scroll-to-top button
    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300);
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
                    <Footer />
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
        </div>
    );
};

export default Rant;
