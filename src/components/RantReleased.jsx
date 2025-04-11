import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './RantReleased.css'; // Styles will be updated


const RantReleased = ({ isOpen, onClose }) => {

    // Variants for the overlay fade animation
    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.3 } },
        exit: { opacity: 0, transition: { duration: 0.3, delay: 0.2 } }
    };

    // Variants for the modal content animation (scale/fade)
    const modalVariants = {
        hidden: { opacity: 0, scale: 0.8, y: "-50%", x: "-50%" },
        visible: {
            opacity: 1,
            scale: 1,
            y: "-50%",
            x: "-50%",
            transition: { duration: 0.3, ease: "easeOut", delay: 0.1 }
        },
        exit: {
            opacity: 0,
            scale: 0.8,
            transition: { duration: 0.2, ease: "easeIn" }
        }
    };

    // Variants for the spinning icon
    const iconVariants = {
        spin: {
            rotate: [0, 360],
            transition: {
                duration: 1.5,
                ease: "linear",
                repeat: Infinity,
                repeatDelay: 1
            }
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="modal-overlay" // Styles the dark background
                    variants={overlayVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onClick={onClose} // Close modal when overlay is clicked
                >
                    {/* This outer motion.div handles positioning and animation */}
                    <motion.div
                        className="modal-content-wrapper" // New wrapper for positioning
                        variants={modalVariants}
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
                    >
                        {/* Apply the user's desired structure and classes *inside* */}
                        <div className="rant-released">
                            <div className="rant-released-header">
                                <motion.span
                                    className="rant-released-icon"
                                    variants={iconVariants}
                                    animate="spin"
                                >
                                    {/* Using user's icon */}
                                    🟡
                                </motion.span>
                                <h1>Rant Released!</h1>
                            </div>
                            <p>Your frustration has been set free into the wild. Doesn't that feel better?</p>
                            <blockquote className="rant-released-quote">
                                "The truth will set you free, but first it will piss you off."<br />
                                <span>— Gloria Steinem</span>
                            </blockquote>
                            <div className="rant-released-actions">
                                {/* Button to close the modal */}
                                <motion.button
                                    className="rant-released-button"
                                    onClick={onClose} // Close action
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Return Home
                                </motion.button>
                                {/* Share button */}
                                <motion.button
                                    className="rant-released-button share"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => window.open('https://twitter.com/intent/tweet?text=I%20just%20released%20a%20rant%20anonymously!%20Feeling%20better%20already.%20%23RantApp', '_blank')}
                                >
                                    Share on X
                                </motion.button>
                            </div>
                            <footer className="rant-released-footer">
                                Remember: You're anonymous, you're valid, and you're definitely not alone.
                            </footer>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default RantReleased;
