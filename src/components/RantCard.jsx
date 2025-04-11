import React, { useState, useEffect, forwardRef, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Heart, MessageSquare, Share2 } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import '../pages/Rant.css';
import { useSnackbar } from 'notistack';
import { isLightColor, generateAlias } from '../../utils';

const useScreenSize = () => {
    const [screenSize, setScreenSize] = useState({
        width: window.innerWidth,
        isMobile: window.innerWidth <= 480,
        isTablet: window.innerWidth <= 768 && window.innerWidth > 480,
        isDesktop: window.innerWidth > 768
    });

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setScreenSize({
                width,
                isMobile: width <= 480,
                isTablet: width <= 768 && width > 480,
                isDesktop: width > 768
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return screenSize;
};

// Mood config
const moodProperties = {
    "Sad": { emoji: "sad.gif", color: "#ef687a" },
    "Crying": { emoji: "loudlycrying.gif", color: "#71c6ec" },
    "Angry": { emoji: "angry.gif", color: "#d56c2a" },
    "Eye Roll": { emoji: "rollingeyes.gif", color: "#ac95f8" },
    "Heartbroken": { emoji: "brokenheart.gif", color: "#f086b5" },
    "Mind Blown": { emoji: "mindblown.gif", color: "#a0f8ba" },
    "Laughing": { emoji: "joy.gif", color: "#f4db67" },
    "Smiling": { emoji: "smilewithbigeyes.gif", color: "#b2f88a" },
    "Bored": { emoji: "yawn.gif", color: "#a9b2bd" },
    "Loved": { emoji: "redheart.gif", color: "#f87171" },
    "Default": { emoji: "default.gif", color: "#cccccc" }
};

const getMoodProps = (moodName) => moodProperties[moodName] || moodProperties["Default"];

// LocalStorage helpers
const LOCAL_STORAGE_KEY = 'likedRants';
const getLikedRants = () => {
    try {
        return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
    } catch {
        return [];
    }
};
const saveLikedRant = (rantId) => {
    const liked = getLikedRants();
    if (!liked.includes(rantId)) {
        liked.push(rantId);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(liked));
    }
};
const removeLikedRant = (rantId) => {
    const liked = getLikedRants().filter(id => id !== rantId);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(liked));
};

const RantCard = forwardRef(({ id, moodName, likes, text, authorInitial = "R", index = 0, onLike }, ref) => {
    const { enqueueSnackbar } = useSnackbar();
    const { isMobile, isTablet } = useScreenSize();
    const { emoji, color } = getMoodProps(moodName);

    const [isLiked, setIsLiked] = useState(false);
    const [currentLikes, setCurrentLikes] = useState(likes);
    const [isLiking, setIsLiking] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [contentHeight, setContentHeight] = useState(0);

    const cardRef = useRef(null);
    const contentRef = useRef(null);
    const textRef = useRef(null);

    const isInView = useInView(cardRef, {
        once: false,
        amount: 0.3,
        onChange: (inView) => {
            // Auto-collapse when scrolled out of view
            if (!inView && isExpanded) {
                setIsExpanded(false);
            }
        }
    });

    // Calculate appropriate text length for different screen sizes
    const MAX_VISIBLE_LENGTH = isMobile ? 100 : isTablet ? 160 : 220;
    const needsTruncation = text.length > MAX_VISIBLE_LENGTH;

    // Ensure we don't cut words in half when truncating
    const getTruncatedText = () => {
        if (!needsTruncation) return text;

        let truncated = text.substring(0, MAX_VISIBLE_LENGTH);
        // Find the last space to avoid cutting words
        const lastSpaceIndex = truncated.lastIndexOf(' ');
        if (lastSpaceIndex > MAX_VISIBLE_LENGTH * 0.7) {
            truncated = truncated.substring(0, lastSpaceIndex);
        }
        return truncated;
    };

    const displayText = !isExpanded && needsTruncation
        ? getTruncatedText()
        : text;

    // Generate a dynamic alias based on the index
    const alias = generateAlias(index);

    // Animation variants for scroll-based animations
    const cardVariants = {
        hidden: {
            opacity: 0,
            y: 10,
            scale: 0.98
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.3,
                delay: index * 0.05,
                ease: "easeOut"
            }
        }
    };

    // Measure content height for animations
    useEffect(() => {
        if (textRef.current) {
            // Add a small delay to ensure the DOM has updated
            setTimeout(() => {
                setContentHeight(textRef.current.scrollHeight);
            }, 10);
        }
    }, [text, isExpanded]);

    // Add click outside listener to collapse expanded cards
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (cardRef.current && !cardRef.current.contains(event.target) && isExpanded) {
                setIsExpanded(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isExpanded]);

    useEffect(() => {
        const liked = getLikedRants();
        setIsLiked(liked.includes(id));
    }, [id]);

    const handleLikeClick = async () => {
        if (isLiking) return;
        setIsLiking(true);

        const deviceId = localStorage.getItem('deviceId') || (() => {
            const newId = crypto.randomUUID();
            localStorage.setItem('deviceId', newId);
            return newId;
        })();

        // Determine text color based on background color using the utility function
        const textColor = isLightColor(color) ? '#333' : '#fff';

        // Step 1: Check rate-limit
        const { data: recentLikes, error: logError } = await supabase
            .from('likes_log')
            .select('id')
            .eq('rant_id', id)
            .eq('device_id', deviceId)
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        if (logError) {
            console.error('Error checking like log:', logError);
            enqueueSnackbar('Could not validate like — try again later.', {
                variant: 'error',
                autoHideDuration: 1000,
                style: {
                    backgroundColor: color,
                    color: textColor
                }
            });
            setIsLiking(false);
            return;
        }

        if (recentLikes.length > 0) {
            enqueueSnackbar("You've already liked this rant in the last 24 hours 😅", {
                variant: 'info',
                autoHideDuration: 1000,
                style: {
                    backgroundColor: color,
                    color: textColor
                }
            });
            setIsLiking(false);
            return;
        }

        // Step 2: Proceed with like
        const newLikeCount = currentLikes + 1;
        setIsLiked(true);
        setCurrentLikes(newLikeCount);

        const { error } = await supabase
            .from('rants')
            .update({ likes: newLikeCount })
            .eq('id', id);

        if (error) {
            console.error('Error updating like:', error);
            setIsLiked(false);
            setCurrentLikes(currentLikes);
            enqueueSnackbar(`Failed to update like: ${error.message}`, {
                variant: 'error',
                autoHideDuration: 3000,
                style: {
                    backgroundColor: color,
                    color: textColor
                }
            });
        } else {
            await supabase.from('likes_log').insert([{ rant_id: id, device_id: deviceId }]);
            saveLikedRant(id); // Optional UI feedback
            if (typeof onLike === 'function') onLike();
        }

        setIsLiking(false);
    };

    const handleCommentClick = () => {
        enqueueSnackbar('Comments feature coming soon!', {
            variant: 'info',
            autoHideDuration: 3000,
            style: {
                backgroundColor: '#fff',
                color: '#333',
                position: 'fixed',
                bottom: '20px',
                left: '20px',
                transform: 'none',
            },
        });
    };

    const handleShareClick = () => {
        enqueueSnackbar('Share feature coming soon!', {
            variant: 'info',
            autoHideDuration: 3000,
            style: {
                backgroundColor: '#fff',
                color: '#333',
                position: 'fixed',
                bottom: '20px',
                left: '20px',
                transform: 'none',
            },
        });
    };

    // Calculate max height based on screen size for better proportions
    const getMaxExpandedHeight = () => {
        if (isMobile) return 500;
        if (isTablet) return 600;
        return 700; // Desktop
    };

    return (
        <motion.div
            ref={(node) => {
                cardRef.current = node;
                if (typeof ref === 'function') ref(node);
                else if (ref) ref.current = node;
            }}
            className={`rant-card-container ${isExpanded ? 'expanded' : ''}`}
            style={{
                borderColor: color,
                zIndex: isExpanded ? 5 : 'auto',
                // Adjust padding at the bottom when expanded to prevent overlap
                paddingBottom: isExpanded ? '70px' : '32px',
                // Allow the card to expand in height when expanded
                height: isExpanded ? 'auto' : undefined,
                // Limit max height for expanded cards to prevent excessive size
                maxHeight: isExpanded ? getMaxExpandedHeight() : undefined,
                // Add transition for smooth height animation
                transition: 'height 0.3s ease, max-height 0.3s ease, padding 0.3s ease, transform 0.2s ease'
            }}
            variants={cardVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            whileHover={{ y: -10 }}
            transition={{ duration: 0.2 }}
        >
            <div className="rant-card-content">
                <div className="rant-card-header">
                    <div className="rant-card-emoji-wrapper" style={{ backgroundColor: color }}>
                        <img className="rant-card-emoji-img" src={`/assets/images/${emoji}`} alt={`${moodName} mood emoji`} />
                    </div>
                    <div className="rant-card-likes-container">
                        <div className="rant-card-likes-icon" style={{ color: color }}>
                            <Heart size={16} strokeWidth={2} />
                        </div>
                        <span className="rant-card-likes-text">{currentLikes}</span>
                    </div>
                </div>

                <AnimatePresence initial={false}>
                    <motion.div
                        ref={contentRef}
                        className="rant-card-text-container"
                        initial={false}
                        animate={{
                            maxHeight: isExpanded
                                ? Math.min(contentHeight + 60, getMaxExpandedHeight() - 120) // Adjust for footer
                                : '210px'
                        }}
                        transition={{
                            duration: 0.3,
                            ease: "easeInOut"
                        }}
                        style={{
                            overflowY: !isExpanded ? 'hidden' : 'auto',
                            // Add margin at the bottom to create space for the "Show less" button
                            marginBottom: isExpanded ? '20px' : '0'
                        }}
                    >
                        <div
                            ref={textRef}
                            className="rant-card-text"
                        >
                            {displayText}
                            {!isExpanded && needsTruncation && (
                                <span style={{ opacity: 0.7 }}>...</span>
                            )}
                        </div>

                        {needsTruncation && (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="read-more-button"
                                style={{
                                    color: color,
                                    marginTop: '8px',
                                    display: 'inline-block',
                                    // Add margin-bottom when expanded to prevent overlap with footer
                                    marginBottom: isExpanded ? '10px' : '0'
                                }}
                            >
                                {isExpanded ? 'Show less' : 'Read more'}
                            </button>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            <div
                className="rant-card-footer"
                style={{
                    // Ensure the footer stays at the bottom
                    bottom: '16px',
                    // Add z-index to ensure footer is above content
                    zIndex: 3
                }}
            >
                <div className="rant-card-author-container">
                    <div className="rant-card-author-icon">
                        <span className="rant-card-author-initial">{authorInitial}</span>
                    </div>
                    <span className="rant-card-author-text">{alias}</span>
                </div>

                <div className="rant-card-actions-container">
                    <motion.div
                        className={`rant-card-action-icon ${isLiked ? 'liked' : ''}`}
                        onClick={handleLikeClick}
                        title={isLiked ? 'Unlike' : 'Like'}
                        whileTap={!isLiking ? { scale: 0.85 } : {}}
                        style={{
                            cursor: isLiking ? 'wait' : 'pointer',
                            color: isLiked ? color : 'inherit',
                        }}
                    >
                        <Heart
                            size={24}
                            strokeWidth={1.5}
                            style={{
                                fill: isLiked ? color : 'transparent',
                                stroke: isLiked ? color : 'currentColor'
                            }}
                        />
                    </motion.div>

                    <motion.div className="rant-card-action-icon" onClick={handleCommentClick} whileTap={{ scale: 0.85 }}>
                        <MessageSquare size={24} strokeWidth={1.5} />
                    </motion.div>

                    <motion.div className="rant-card-action-icon" onClick={handleShareClick} whileTap={{ scale: 0.85 }}>
                        <Share2 size={24} strokeWidth={1.5} />
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
});

export default RantCard;
