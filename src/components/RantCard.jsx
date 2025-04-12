import React, { useState, useEffect, forwardRef, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Heart, MessageSquare, Share2 } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import '../pages/Rant.css';
import { useSnackbar } from 'notistack';
import { isLightColor, generateAlias } from '../../utils';

const RantCard = forwardRef(({ id, moodName, likes, text, authorId, index = 0, onLike, justAdded = false }, ref) => {
    const { enqueueSnackbar } = useSnackbar();

    const [isLiked, setIsLiked] = useState(false);
    const [isLiking, setIsLiking] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [contentHeight, setContentHeight] = useState(0);

    const cardRef = useRef(null);
    const contentRef = useRef(null);
    const textRef = useRef(null);

    const { emoji, color } = {
        Sad: { emoji: "sad.gif", color: "#ef687a" },
        Crying: { emoji: "loudlycrying.gif", color: "#71c6ec" },
        Angry: { emoji: "angry.gif", color: "#d56c2a" },
        "Eye Roll": { emoji: "rollingeyes.gif", color: "#ac95f8" },
        Heartbroken: { emoji: "brokenheart.gif", color: "#f086b5" },
        "Mind Blown": { emoji: "mindblown.gif", color: "#a0f8ba" },
        Laughing: { emoji: "joy.gif", color: "#f4db67" },
        Smiling: { emoji: "smilewithbigeyes.gif", color: "#b2f88a" },
        Bored: { emoji: "yawn.gif", color: "#a9b2bd" },
        Loved: { emoji: "redheart.gif", color: "#f87171" },
        Default: { emoji: "default.gif", color: "#cccccc" }
    }[moodName] || { emoji: "default.gif", color: "#cccccc" };

    const alias = generateAlias(id);

    const isInView = useInView(cardRef, {
        once: false,
        amount: 0.3,
        onChange: (inView) => {
            if (!inView && isExpanded) {
                setIsExpanded(false);
            }
        }
    });

    useEffect(() => {
        if (textRef.current) {
            setTimeout(() => {
                setContentHeight(textRef.current.scrollHeight);
            }, 10);
        }
    }, [text, isExpanded]);

    useEffect(() => {
        if (isExpanded && cardRef.current) {
            cardRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }, [isExpanded]);

    useEffect(() => {
        const liked = JSON.parse(localStorage.getItem('likedRants') || '[]');
        setIsLiked(liked.includes(id));
    }, [id]);

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

    const handleToast = (message) => {
        const textColor = isLightColor(color) ? '#333' : '#fff';
        enqueueSnackbar(message, {
            variant: 'info',
            autoHideDuration: 3000,
            style: {
                backgroundColor: color,
                color: textColor,
                fontWeight: 500,
                fontSize: '14px'
            }
        });
    };

    const handleLikeClick = async () => {
        if (isLiking) return;
        setIsLiking(true);

        const deviceId = localStorage.getItem('deviceId') || (() => {
            const newId = crypto.randomUUID();
            localStorage.setItem('deviceId', newId);
            return newId;
        })();

        const textColor = isLightColor(color) ? '#333' : '#fff';

        const { data: recentLikes, error: logError } = await supabase
            .from('likes_log')
            .select('id')
            .eq('rant_id', id)
            .eq('device_id', deviceId)
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        if (logError || recentLikes.length > 0) {
            enqueueSnackbar(
                logError ? 'Could not validate like.' : 'Already liked in last 24h 😅',
                {
                    variant: 'info',
                    autoHideDuration: 1000,
                    style: { backgroundColor: color, color: textColor }
                }
            );
            setIsLiking(false);
            return;
        }

        setIsLiked(true);

        const { error } = await supabase
            .from('rants')
            .update({ likes: likes + 1 })
            .eq('id', id);

        if (!error) {
            await supabase.from('likes_log').insert([{ rant_id: id, device_id: deviceId }]);
            const liked = JSON.parse(localStorage.getItem('likedRants') || '[]');
            localStorage.setItem('likedRants', JSON.stringify([...liked, id]));
            if (typeof onLike === 'function') onLike();
        } else {
            setIsLiked(false);
            enqueueSnackbar(`Failed to like: ${error.message}`, {
                variant: 'error',
                autoHideDuration: 3000,
                style: { backgroundColor: color, color: textColor }
            });
        }

        setIsLiking(false);
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
                backgroundColor: justAdded ? 'rgba(45, 212, 191, 0.05)' : 'transparent',
                height: isExpanded ? 'auto' : '380px',
                maxHeight: isExpanded ? 'unset' : '380px',
                paddingBottom: isExpanded ? '90px' : '32px',
                overflow: isExpanded ? 'visible' : 'hidden',
                transition: 'all 0.3s ease'
            }}
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                        type: "spring",
                        damping: 20,
                        stiffness: 100,
                        delay: index * 0.04
                    }
                }
            }}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            whileHover={{
                scale: 1.01,
                boxShadow: `0 0 6px ${color}`
            }}
        >
            <div className="rant-card-content">
                <div className="rant-card-header">
                    <div className="rant-card-emoji-wrapper" style={{ backgroundColor: color }}>
                        <img className="rant-card-emoji-img" src={`/assets/images/${emoji}`} alt="mood" />
                    </div>
                    <div className="rant-card-likes-container">
                        <div className="rant-card-likes-icon" style={{ color }}>
                            <Heart size={16} strokeWidth={2} />
                        </div>
                        <span className="rant-card-likes-text">{likes}</span>
                    </div>
                </div>

                <AnimatePresence>
                    <motion.div
                        ref={contentRef}
                        className="rant-card-text-container"
                        animate={{
                            maxHeight: isExpanded
                                ? Math.min(contentHeight + 60, 580)
                                : '210px'
                        }}
                        transition={{ duration: 0.3 }}
                        style={{
                            overflowY: !isExpanded ? 'hidden' : 'auto',
                            marginBottom: isExpanded ? '20px' : '0'
                        }}
                    >
                        <div ref={textRef} className="rant-card-text">
                            {!isExpanded && text.length > 220
                                ? text.slice(0, text.lastIndexOf(' ', 220)) + '...'
                                : text}
                        </div>

                        {text.length > 220 && (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="read-more-button"
                                style={{
                                    color,
                                    padding: '6px 12px',
                                    minHeight: '32px',
                                    borderRadius: '6px',
                                    marginTop: '10px'
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
                    position: isExpanded ? 'relative' : 'absolute',
                    bottom: isExpanded ? 'auto' : '16px',
                    left: '16px',
                    right: '16px',
                    transition: 'all 0.3s ease'
                }}
            >
                <div className="rant-card-author-container">
                    <motion.div
                        className="rant-card-author-icon"
                        style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [1, 0.8, 1],
                            transition: { duration: 0.6, repeat: 4, ease: 'easeInOut' }
                        }}
                    >
                        <span
                            className="rant-card-author-initial"
                            style={{ color: isLightColor(color) ? '#333' : '#fff' }}
                        >
                            {alias.charAt(0)}
                        </span>
                    </motion.div>
                    <span className="rant-card-author-text">{alias}</span>
                </div>

                <div className="rant-card-actions-container">
                    <motion.div
                        className={`rant-card-action-icon ${isLiked ? 'liked' : ''}`}
                        onClick={handleLikeClick}
                        whileTap={!isLiking ? { scale: 0.85 } : {}}
                        style={{
                            cursor: isLiking ? 'wait' : 'pointer',
                            color: isLiked ? color : 'inherit'
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

                    <motion.div
                        className="rant-card-action-icon"
                        onClick={() => handleToast('Comments feature coming soon')}
                        whileTap={{ scale: 0.85 }}
                    >
                        <MessageSquare size={24} strokeWidth={1.5} />
                    </motion.div>

                    <motion.div
                        className="rant-card-action-icon"
                        onClick={() => handleToast('Share feature coming soon')}
                        whileTap={{ scale: 0.85 }}
                    >
                        <Share2 size={24} strokeWidth={1.5} />
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
});


export default RantCard;
