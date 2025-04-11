import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Logo from './Logo';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);

    // Track scroll position to add background when scrolled
    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 50;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [scrolled]);

    const scrollToFooter = () => {
        const footer = document.getElementById('footer');
        if (footer) {
            footer.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <motion.nav
            className="navbar"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
                backgroundColor: scrolled ? 'rgba(15, 15, 25, 0.9)' : 'transparent',
                backdropFilter: scrolled ? 'blur(8px)' : 'none',
            }}
        >
            <div className="navbar-container">
                <div className="logo-container">
                    <div className="logo-text-wrapper">
                        <h1 className="logo-text gradient-text-brand">rant</h1>
                    </div>
                    {/* <img className="logo-emoji" src="/assets/images/angry.gif" alt="Rant Logo" /> */}
                    <Logo />
                </div>

                <div className="navbar-links">
                    <motion.button
                        className="navbar-link"
                        onClick={scrollToFooter}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        About
                    </motion.button>
                </div>
            </div>
        </motion.nav>
    );
};

export default Navbar;
