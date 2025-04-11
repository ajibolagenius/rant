import React, { useState, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    useFloating,
    useHover,
    useInteractions,
    FloatingPortal,
    FloatingArrow,
    arrow,
    offset,
    shift,
    autoUpdate
} from '@floating-ui/react';
import { supabase } from '../../supabaseClient';
import '../pages/Rant.css';
import RantReleased from './RantReleased';

// --- Mood Data ---
const moods = [
    { name: "Sad", emoji: "sad.gif", color: "#ef687a", description: "Feeling down or unhappy." },
    { name: "Crying", emoji: "loudlycrying.gif", color: "#71c6ec", description: "Overwhelmed with sadness." },
    { name: "Angry", emoji: "angry.gif", color: "#d56c2a", description: "Feeling mad or irritated." },
    { name: "Eye Roll", emoji: "rollingeyes.gif", color: "#ac95f8", description: "Annoyed or exasperated." },
    { name: "Heartbroken", emoji: "brokenheart.gif", color: "#f086b5", description: "Deep emotional pain." },
    { name: "Mind Blown", emoji: "mindblown.gif", color: "#a0f8ba", description: "Amazed or astonished." },
    { name: "Laughing", emoji: "joy.gif", color: "#f4db67", description: "Finding something very funny." },
    { name: "Smiling", emoji: "smilewithbigeyes.gif", color: "#b2f88a", description: "Happy and content." },
    { name: "Bored", emoji: "yawn.gif", color: "#a9b2bd", description: "Uninterested or weary." },
    { name: "Loved", emoji: "redheart.gif", color: "#f87171", description: "Feeling cherished and adored." },
];

// --- MoodOption Component ---
const MoodOption = ({ mood, isSelected, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const arrowRef = useRef(null);
    const { refs, floatingStyles, context } = useFloating({
        open: isOpen, onOpenChange: setIsOpen, placement: 'top',
        middleware: [offset(8), shift(), arrow({ element: arrowRef })],
        whileElementsMounted: autoUpdate,
    });
    const hover = useHover(context, { delay: { open: 100, close: 0 } });
    const { getReferenceProps, getFloatingProps } = useInteractions([hover]);

    return (
        <>
            <motion.div ref={refs.setReference} className={`mood-option ${isSelected ? 'selected' : ''}`} onClick={() => onSelect(mood)} style={{ borderColor: isSelected ? mood.color : 'transparent' }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.1 }} {...getReferenceProps()}>
                <img className="mood-option-emoji-img" src={`/assets/images/${mood.emoji}`} alt={mood.name} />
                <span className="mood-option-text">{mood.name}</span>
            </motion.div>
            <FloatingPortal>
                {isOpen && (<div ref={refs.setFloating} style={{ ...floatingStyles, background: 'rgba(30, 30, 45, 0.9)', color: 'white', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', zIndex: 1000, backdropFilter: 'blur(2px)', }} {...getFloatingProps()} > <FloatingArrow ref={arrowRef} context={context} fill="rgba(30, 30, 45, 0.9)" /> {mood.description} </div>)}
            </FloatingPortal>
        </>
    );
};


/**
 * Form component for submitting a new rant to Supabase.
 */

const RantForm = ({ onRantSubmitted }) => {
    const [selectedMood, setSelectedMood] = useState(null);
    const [rantText, setRantText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Character limit implementation
    const MAX_RANT_LENGTH = 560;
    const charactersLeft = MAX_RANT_LENGTH - rantText.length;
    const isOverLimit = charactersLeft < 0;

    const moodsRow1 = useMemo(() => moods.slice(0, 5), []);
    const moodsRow2 = useMemo(() => moods.slice(5), []);

    // Make handleSubmit async
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!rantText.trim() || !selectedMood || isSubmitting || isOverLimit) {
            alert(!rantText.trim() ? "Please enter your rant!" :
                !selectedMood ? "Please select your current mood!" :
                    isOverLimit ? "Your rant is too long!" :
                        "Submission in progress...");
            return;
        }

        setIsSubmitting(true);

        // 🔐 Generate or retrieve anonymous author ID
        const deviceId = localStorage.getItem('deviceId') || (() => {
            const newId = crypto.randomUUID();
            localStorage.setItem('deviceId', newId);
            return newId;
        })();

        const { data, error } = await supabase
            .from('rants')
            .insert([
                {
                    content: rantText,
                    mood: selectedMood.name,
                    likes: 0,
                    author_id: deviceId
                }
            ])
            .select()
            .single(); // Get the inserted rant back for real-time update

        setIsSubmitting(false);

        if (error) {
            console.error('Error submitting rant:', error);
            alert(`Error submitting rant: ${error.message || 'Please try again.'}`);
        } else {
            setIsModalOpen(true);
            setRantText("");
            setSelectedMood(null);
            if (onRantSubmitted) {
                onRantSubmitted(data); // Pass newly created rant back
            }
        }
    };


    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const formVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    };

    return (
        <>
            <motion.form
                className="form-container"
                onSubmit={handleSubmit}
                variants={formVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="form-header-container">
                    <div className="form-header">
                        <span className="form-title gradient-text-form-title">
                            What's bothering you?&nbsp;
                        </span>
                        <span className="form-emoji">💭</span>
                    </div>
                    <textarea
                        className="form-input"
                        placeholder="Type your rant here...no one will know it's from you!"
                        value={rantText}
                        onChange={(e) => setRantText(e.target.value)}
                        required
                        disabled={isSubmitting}
                        maxLength={MAX_RANT_LENGTH} // Prevent typing beyond limit
                    />
                    {/* Character counter */}
                    <div
                        style={{
                            textAlign: 'right',
                            fontSize: '14px',
                            marginTop: '4px',
                            color: isOverLimit ? '#ef687a' : charactersLeft < 50 ? '#f4db67' : '#cacaca'
                        }}
                    >
                        {charactersLeft} characters left
                    </div>
                </div>

                <div className="mood-container">
                    <span className="mood-title">Current mood:</span>
                    <div className="mood-options-container">
                        <div className="mood-row">
                            {moodsRow1.map((mood) => (
                                <MoodOption
                                    key={mood.name}
                                    mood={mood}
                                    isSelected={selectedMood?.name === mood.name}
                                    onSelect={isSubmitting ? () => { } : setSelectedMood}
                                />
                            ))}
                        </div>
                        <div className="mood-row">
                            {moodsRow2.map((mood) => (
                                <MoodOption
                                    key={mood.name}
                                    mood={mood}
                                    isSelected={selectedMood?.name === mood.name}
                                    onSelect={isSubmitting ? () => { } : setSelectedMood}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <motion.button
                    type="submit"
                    className="button button-primary submit-button-container"
                    whileHover={!isSubmitting && !isOverLimit ? { scale: 1.03 } : {}}
                    whileTap={!isSubmitting && !isOverLimit ? { scale: 0.98 } : {}}
                    disabled={isSubmitting || isOverLimit}
                    style={{
                        opacity: isSubmitting || isOverLimit ? 0.7 : 1,
                        cursor: isOverLimit ? 'not-allowed' : 'pointer'
                    }}
                >
                    <span className="button-text submit-button-text">
                        {/* Change button text while submitting or over limit */}
                        {isSubmitting ? 'Ranting...' :
                            isOverLimit ? 'Rant too long' :
                                'Rant Anonymously'}
                    </span>
                    {/* Hide emoji while submitting or over limit */}
                    {!isSubmitting && !isOverLimit && (
                        <img
                            className="submit-button-emoji"
                            src="/assets/images/_emoji_fire.svg"
                            alt="fire emoji"
                        />
                    )}
                </motion.button>
            </motion.form>

            {/* Render the modal */}
            <RantReleased isOpen={isModalOpen} onClose={handleCloseModal} />
        </>
    );
};

// Default props for variants if needed
RantForm.defaultProps = {
    formVariants: {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    }
};

export default RantForm;
