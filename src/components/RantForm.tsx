import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { getMoodColor, MoodType, getMoodUnicodeEmoji } from '@/lib/utils/mood';
import MoodSelector from './MoodSelector';
import { MessageCircle, Send, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDraftPersistence } from '@/hooks/useDraftPersistence';
import { useTypewriterEffect } from '@/hooks/useTypewriterEffect';
import { useElementDimension } from '@/hooks/useElementDimension';
import { useTextareaAutosize } from '@/hooks/useTextareaAutosize';
import { sanitizeInput, validateRantInput, checkRateLimit, getSecureAuthorId } from '@/utils/security';
import { toast } from '@/hooks/use-toast';


// Constants for the typewriter effect
const PLACEHOLDER_TEXTS = [
    "Type your rant here. No one will know it's from you! 🤐",
    "Let it all out! Your secrets are safe with us... 🔐",
    "Frustrated? Angry? Annoyed? Tell us about it... 😤",
    "What's on your mind? Vent freely and anonymously! 💭",
    "Go ahead, we're listening. Rant away... 👂",
    "Ready to rant? Let's get this started... 💣",
    "Ready to unleash your inner frustration? Let's do this... 💥",
    "Feeling frustrated? Let's turn that frustration into a rant... 😡",
    "Say it loud (but type it quietly) — we're here for you. 🙃",
    "Got a hot take? Let it simmer here... 🔥",
    "Your digital diary of doom awaits. 📓😶",
    "Yell into the void — we promise it echoes back supportively. 🌌📣",
    "One rant a day keeps the stress away! 🍵😮‍💨",
    "Don't hold back — rage-type it all out! ⌨️💢",
    "Unload your emotional backpack here. 🎒😔",
    "Too much on your plate? Flip the table here. 🍽️🗯️",
    "Anonymity is your superpower. Use it wisely. 🦸‍♂️💬",
    "No filters. No judgments. Just pure you. 🧠🔊",
    "We don't do 'calm down' here. Let it fly. 🪁💨",
];

const TYPEWRITER_SPEED = 30;
const PLACEHOLDER_DISPLAY_TIME = 3000;

interface RantFormProps {
    onSubmit: (content: string, mood: MoodType) => void;
}

const RantForm: React.FC<RantFormProps> = ({ onSubmit }) => {
    // Use custom hooks for complex logic
    const { content, setContent, selectedMood, setSelectedMood, clearDraft } = useDraftPersistence();
    const placeholder = useTypewriterEffect(
        PLACEHOLDER_TEXTS,
        TYPEWRITER_SPEED,
        PLACEHOLDER_DISPLAY_TIME,
        true,
        content
    );

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const formRef = useRef<HTMLDivElement>(null);

    // Use element dimension hook
    const { height: formHeight } = useElementDimension(formRef);

    // Use textarea autosize hook
    useTextareaAutosize(textareaRef, content);

    const maxLength = 560;
    const minLength = 30;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedMood) {
            toast({
                title: "Error",
                description: "Please select a mood for your rant",
                variant: "destructive",
            });
            return;
        }

        if (content.trim().length < minLength) {
            toast({
                title: "Rant too short",
                description: `Your rant needs to be at least ${minLength} characters.`,
                variant: "destructive",
            });
            return;
        }

        // Sanitize input
        const sanitizedText = sanitizeInput(content);

        // Validate input
        const validation = validateRantInput(sanitizedText);
        if (!validation.valid) {
            toast({
                title: "Error",
                description: validation.message,
                variant: "destructive",
            });
            return;
        }

        // Get the secure author ID
        const authorId = getSecureAuthorId();

        // Check rate limiting
        const rateLimitCheck = await checkRateLimit(authorId);
        if (!rateLimitCheck.allowed) {
            toast({
                title: "Rate Limit Exceeded",
                description: rateLimitCheck.message,
                variant: "destructive",
            });
            return;
        }

        if (sanitizedText.trim() && selectedMood) {
            if (!showConfirmation) {
                setShowConfirmation(true);
                return;
            }

            setIsSubmitting(true);

            // Submit the rant with sanitized content
            onSubmit(sanitizedText.trim(), selectedMood);

            // Clear the form after a short delay to allow for animation
            setTimeout(() => {
                clearDraft();
                setIsSubmitting(false);
                setShowConfirmation(false);

                // Focus back on the textarea
                if (textareaRef.current) {
                    textareaRef.current.focus();
                }
            }, 500);
        }
    };

    const cancelSubmission = () => {
        setShowConfirmation(false);
    };

    // Keyboard shortcut for submitting with Ctrl+Enter
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && content.trim().length >= minLength && selectedMood) {
            e.preventDefault();
            if (!showConfirmation) {
                setShowConfirmation(true);
            } else {
                handleSubmit(e as any);
            }
        }
    };

    return (
        <Card
            className="bg-[#09090B] border border-[#222] rounded-2xl overflow-hidden"
            ref={formRef}
            style={{
                borderColor: selectedMood ? getMoodColor(selectedMood) + '50' : '#333',
            }}
        >
            <div className="text-xl font-medium p-6 pb-0 flex items-center gap-2">
                What's bothering you?
                <MessageCircle className="text-cyan-400" size={20} />
            </div>
            <CardContent className="p-6">
                <form onKeyDown={handleKeyDown} >
                    <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={(e) => setContent(e.target.value.substring(0, maxLength))}
                        placeholder={placeholder}
                        className="w-full p-3 bg-transparent border border-[#333] focus:outline-none min-h-[120px] max-h-[200px] text-base rounded-lg transition-all duration-200"
                        maxLength={maxLength}
                        disabled={isSubmitting}
                        style={{
                            borderColor: selectedMood ? getMoodColor(selectedMood) + '50' : '#333',
                        }}
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

                    {/* Keyboard shortcut hint */}
                    <div className="mt-4 text-xs text-gray-500 flex items-center gap-1">
                        <span>Pro tip: Press</span>
                        <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
                            Ctrl
                        </kbd>
                        <span>+</span>
                        <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
                            Enter
                        </kbd>
                        <span>to submit</span>
                    </div>
                </form>
            </CardContent>
            <CardFooter className="px-6 pb-6">
                <AnimatePresence mode="wait">
                    {showConfirmation ? (
                        <motion.div
                            className="w-full flex gap-2"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
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
                                {isSubmitting ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            className="w-5 h-5"
                                        >
                                            <Send size={18} />
                                        </motion.div>
                                        <span>Posting...</span>
                                    </>
                                ) : (
                                    'Confirm Rant'
                                )}
                            </Button>
                        </motion.div>
                    ) : (
                        <motion.div
                            className="w-full"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Button
                                onClick={handleSubmit}
                                disabled={!content.trim() || !selectedMood || content.length < minLength || isSubmitting}
                                className="w-full py-6 text-base font-medium rounded-full flex items-center gap-2 justify-center transition-all duration-300"
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
