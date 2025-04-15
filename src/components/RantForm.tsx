import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { getMoodColor, MoodType, getMoodUnicodeEmoji } from '@/lib/utils/mood';
import MoodSelector from './MoodSelector';
import { MessageCircle, Send, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Constants for the typewriter effect
const PLACEHOLDER_TEXTS = [
    "Type your rant here. No one will know it's from you! 🤐",
    "Let it all out! Your secrets are safe with us...",
    "Frustrated? Angry? Annoyed? Tell us about it...",
    "What's on your mind? Vent freely and anonymously!",
    "Go ahead, we're listening. Rant away..."
];
const TYPEWRITER_SPEED = 50;
const PLACEHOLDER_DISPLAY_TIME = 5000;

interface RantFormProps {
    onSubmit: (content: string, mood: MoodType) => void;
}

const RantForm: React.FC<RantFormProps> = ({ onSubmit }) => {
    const [content, setContent] = useState('');
    const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [placeholder, setPlaceholder] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const maxLength = 560;
    const minLength = 10;

    // Auto-save draft to localStorage
    useEffect(() => {
        const savedDraft = localStorage.getItem('rantDraft');
        if (savedDraft) {
            try {
                const { content: savedContent, mood: savedMood } = JSON.parse(savedDraft);
                setContent(savedContent || '');
                setSelectedMood(savedMood || null);
            } catch (e) {
                console.error('Error parsing saved draft', e);
            }
        }
    }, []);

    useEffect(() => {
        if (content || selectedMood) {
            localStorage.setItem('rantDraft', JSON.stringify({ content, mood: selectedMood }));
        }
    }, [content, selectedMood]);

    // Improved typewriter effect for placeholder
    useEffect(() => {
        if (content) {
            // Don't show placeholder when there's content
            setPlaceholder('');
            return () => { };
        }

        let currentTextIndex = 0;
        let isTyping = true;
        let charIndex = 0;
        let timeoutId: NodeJS.Timeout;

        const animatePlaceholder = () => {
            const currentText = PLACEHOLDER_TEXTS[currentTextIndex];

            if (isTyping) {
                // Typing phase
                if (charIndex <= currentText.length) {
                    setPlaceholder(currentText.substring(0, charIndex));
                    charIndex++;
                    timeoutId = setTimeout(animatePlaceholder, TYPEWRITER_SPEED);
                } else {
                    // Finished typing, pause before erasing
                    isTyping = false;
                    timeoutId = setTimeout(animatePlaceholder, PLACEHOLDER_DISPLAY_TIME);
                }
            } else {
                // Erasing phase
                if (charIndex > 0) {
                    charIndex--;
                    setPlaceholder(currentText.substring(0, charIndex));
                    timeoutId = setTimeout(animatePlaceholder, TYPEWRITER_SPEED / 2);
                } else {
                    // Move to next text
                    isTyping = true;
                    currentTextIndex = (currentTextIndex + 1) % PLACEHOLDER_TEXTS.length;
                    timeoutId = setTimeout(animatePlaceholder, TYPEWRITER_SPEED * 2);
                }
            }
        };

        // Start the animation
        timeoutId = setTimeout(animatePlaceholder, 500);

        // Cleanup
        return () => {
            clearTimeout(timeoutId);
        };
    }, [content]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (content.trim().length < minLength) {
            alert(`Your rant needs to be at least ${minLength} characters.`);
            return;
        }

        if (content.trim() && selectedMood) {
            if (!showConfirmation) {
                setShowConfirmation(true);
                return;
            }

            setIsSubmitting(true);

            // Simulate network delay
            setTimeout(() => {
                onSubmit(content.trim(), selectedMood);
                setContent('');
                setSelectedMood(null);
                setIsSubmitting(false);
                setShowConfirmation(false);
                localStorage.removeItem('rantDraft');
            }, 1000);
        }
    };

    const cancelSubmission = () => {
        setShowConfirmation(false);
    };

    return (
        <Card className="bg-[#09090B] border border-[#222] rounded-2xl overflow-hidden">
            <div className="text-xl font-medium p-6 pb-0 flex items-center gap-2">
                What's bothering you?
                <MessageCircle className="text-cyan-400" size={20} />
            </div>
            <CardContent className="p-6">
                <form>
                    <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={(e) => setContent(e.target.value.substring(0, maxLength))}
                        placeholder={placeholder}
                        className="w-full p-3 bg-transparent border border-[#333] focus:outline-none focus:ring-1 focus:ring-primary min-h-[120px] text-base rounded-lg"
                        maxLength={maxLength}
                        disabled={isSubmitting}
                    />
                    <div className="flex justify-between text-xs text-gray-400">
                        <span className={content.length < minLength && content.length > 0 ? "text-red-400" : ""}>
                            {content.length < minLength && content.length > 0 && (
                                <span className="flex items-center gap-1">
                                    <AlertCircle size={12} />
                                    Min {minLength} chars
                                </span>
                            )}
                        </span>
                        <span>{maxLength - content.length} characters left</span>
                    </div>

                    <div className="mt-6">
                        <p className="text-sm font-medium mb-2">Current mood:</p>
                        <MoodSelector selectedMood={selectedMood} onMoodSelect={setSelectedMood} />
                    </div>
                </form>
            </CardContent>
            <CardFooter className="px-6 pb-6">
                <AnimatePresence>
                    {showConfirmation ? (
                        <motion.div
                            className="w-full flex gap-2"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                        >
                            <Button
                                onClick={cancelSubmission}
                                className="flex-1 py-6 bg-gray-700 hover:bg-gray-600 rounded-full"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="w-full py-6 text-base font-medium rounded-full flex items-center gap-2 justify-center"
                                style={{
                                    background: `linear-gradient(90deg, #00C2FF, #904FFF)`,
                                }}
                            >
                                {isSubmitting ? 'Ranting...' : 'Confirm Rant'}
                            </Button>
                        </motion.div>
                    ) : (
                        <motion.div
                            className="w-full"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                        >
                            <Button
                                onClick={handleSubmit}
                                disabled={!content.trim() || !selectedMood || content.length < minLength || isSubmitting}
                                className="w-full py-6 text-base font-medium rounded-full flex items-center gap-2 justify-center"
                                style={{
                                    background: selectedMood
                                        ? `linear-gradient(90deg, ${getMoodColor(selectedMood)}aa, ${getMoodColor(selectedMood)})`
                                        : `linear-gradient(90deg, #00C2FF, #904FFF)`,
                                    opacity: (!content.trim() || !selectedMood || content.length < minLength) ? 0.7 : 1
                                }}
                            >
                                {selectedMood && content.trim() ? (
                                    <>
                                        Rant {getMoodUnicodeEmoji(selectedMood)} Anonymously
                                    </>
                                ) : (
                                    'Rant Anonymously 🔥'
                                )}
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardFooter>
        </Card>
    );
};

export default RantForm;
