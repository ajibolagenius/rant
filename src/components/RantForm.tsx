import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { getMoodColor, MoodType, getMoodUnicodeEmoji } from '@/lib/utils/mood';
import MoodSelector from './MoodSelector';
import { MessageCircle, Send, AlertCircle, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDraftPersistence } from '@/hooks/useDraftPersistence';
import { useTypewriterEffect } from '@/hooks/useTypewriterEffect';
import { useElementDimension } from '@/hooks/useElementDimension';
import { useTextareaAutosize } from '@/hooks/useTextareaAutosize';
import { sanitizeInput, validateRantInput, checkRateLimit, getSecureAuthorId } from '@/utils/security';
import { toast } from '@/hooks/use-toast';
import { addMyRant } from '@/utils/userStorage';
import { logError } from "@/utils/supabaseErrorHandler";

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
    "Your digital diary of doom awaits. 📓",
    "Yell into the void — we promise it echoes back supportively. 📣",
    "One rant a day keeps the stress away! 😮‍💨",
    "Don't hold back — rage-type it all out! ⌨",
    "Unload your emotional backpack here. 🎒😔",
    "Too much on your plate? Flip the table here. 🍽️",
    "Anonymity is your superpower. Use it wisely. 🦸‍♂️",
    "No filters. No judgments. Just pure you. 🔊",
    "We don't do 'calm down' here. Let it fly. 🪁",
];

const TYPEWRITER_SPEED = 50;
const PLACEHOLDER_DISPLAY_TIME = 3000;

interface RantFormProps {
    onSubmit: (content: string, mood: MoodType) => Promise<any>;
}

const RantForm: React.FC<RantFormProps> = ({ onSubmit }) => {
    // Use enhanced hook with draft loading functionality
    const {
        content,
        setContent,
        selectedMood,
        setSelectedMood,
        clearDraft,
        hasSavedDrafts,
        loadLatestDraft
    } = useDraftPersistence();

    const placeholder = useTypewriterEffect(
        PLACEHOLDER_TEXTS,
        TYPEWRITER_SPEED,
        PLACEHOLDER_DISPLAY_TIME,
        true,
        content
    );

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showDraftBanner, setShowDraftBanner] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const formRef = useRef<HTMLDivElement>(null);

    // Use element dimension hook
    const { height: formHeight } = useElementDimension(formRef);

    // Use textarea autosize hook
    useTextareaAutosize(textareaRef, content);

    // Show draft banner if there are saved drafts
    useEffect(() => {
        if (hasSavedDrafts) {
            setShowDraftBanner(true);
        }
    }, [hasSavedDrafts]);

    const maxLength = 560;
    const minLength = 30;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Prevent multiple submissions
        if (isSubmitting) return;

        if (!selectedMood) {
            toast({
                title: "Error",
                description: "Please select a mood for your rant",
                variant: "error",
            });
            return;
        }

        if (content.trim().length < minLength) {
            toast({
                title: "Rant too short",
                description: `Your rant needs to be at least ${minLength} characters.`,
                variant: "error",
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
                variant: "error",
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
                variant: "error",
            });
            return;
        }

        if (sanitizedText.trim() && selectedMood) {
            if (!showConfirmation) {
                setShowConfirmation(true);
                return;
            }

            setIsSubmitting(true);

            try {
                // Submit the rant with sanitized content
                const result = await onSubmit(sanitizedText.trim(), selectedMood);

                // Add to my rants if we have an ID
                if (result && result.id) {
                    addMyRant(result.id);
                }

                // Clear the form after submission
                clearDraft();
                setIsSubmitting(false);
                setShowConfirmation(false);

                // Focus back on the textarea
                if (textareaRef.current) {
                    textareaRef.current.focus();
                }
            } catch (error) {
                logError("Error posting rant", error);
                setIsSubmitting(false);
                setShowConfirmation(false);

                toast({
                    title: "Error",
                    description: "Failed to post your rant. Please try again.",
                    variant: "error",
                });
            }
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
            } else if (!isSubmitting) { // Prevent multiple submissions via keyboard shortcut
                handleSubmit(e as React.FormEvent);
            }
        }
    };

    return (
        <Card
            className="bg-[transparent] border rounded-2xl overflow-hidden"
            ref={formRef}
            style={{
                borderColor: selectedMood ? getMoodColor(selectedMood) + '50' : '#333',
            }}
        >
            {showDraftBanner && (
                <div className="bg-background-secondary/80 border-b border-border-subtle px-4 py-2 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-ui">
                        <History className="text-primary" size={16} />
                        <span>You have a saved draft</span>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                loadLatestDraft();
                                setShowDraftBanner(false);
                            }}
                            className="text-primary hover:text-primary hover:bg-primary/10 text-xs sm:text-sm font-ui"
                        >
                            Restore
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowDraftBanner(false)}
                            className="text-text-muted hover:text-text-strong hover:bg-background-dark text-xs sm:text-sm font-ui"
                        >
                            Dismiss
                        </Button>
                    </div>
                </div>
            )}

            <div className="text-base sm:text-lg md:text-xl font-medium p-4 sm:p-5 md:p-6 pb-0 flex items-center gap-2 font-heading">
                What's bothering you?
                <MessageCircle className="text-primary" size={18} />
            </div>
            <CardContent className="p-4 sm:p-5 md:p-6">
                <form onKeyDown={handleKeyDown} >
                    <label htmlFor="rant-content" className="sr-only">
                        Your rant (required)
                    </label>
                    <textarea
                        id="rant-content"
                        ref={textareaRef}
                        value={content}
                        onChange={(e) => setContent(e.target.value.substring(0, maxLength))}
                        placeholder={placeholder}
                        className="w-full p-3 bg-transparent border border-border-subtle focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 min-h-[120px] max-h-[200px] text-sm sm:text-base font-body rounded-lg transition-all duration-200"
                        maxLength={maxLength}
                        disabled={isSubmitting}
                        style={{
                            borderColor: selectedMood ? getMoodColor(selectedMood) + '50' : undefined,
                        }}
                    />
                    <div className="flex justify-between text-xs text-text-muted font-ui mt-2">
                        <span className={content.length < minLength && content.length > 0 ? "text-utility-error" : ""}>
                            {content.length < minLength && content.length > 0 && (
                                <span className="flex items-center gap-1">
                                    <AlertCircle size={12} />
                                    Min {minLength} chars
                                </span>
                            )}
                        </span>
                        <span>{maxLength - content.length} characters left</span>
                    </div>

                    <div className="mt-5 sm:mt-6">
                        <p className="text-xs sm:text-sm font-medium mb-2 font-ui">Current mood:</p>
                        <MoodSelector selectedMood={selectedMood} onMoodSelect={setSelectedMood} />

                        {/* Keyboard shortcut hint - single line with responsive break */}
                        <div className="mt-4 flex flex-row flex-wrap items-center justify-start gap-2 bg-background-dark hover:bg-background-secondary/50 px-3 py-2 rounded-lg border border-border-subtle transition-colors duration-200">
                            <div className="text-xs text-primary font-medium whitespace-nowrap font-ui">Pro tip:</div>
                            <div className="flex flex-wrap items-center gap-1.5 text-xs text-text-muted font-ui">
                                <span>Press</span>
                                <kbd className="px-1.5 py-0.5 text-xs font-medium bg-background-secondary border border-border-subtle rounded text-text-strong shadow-sm">
                                    Ctrl
                                </kbd>
                                <span>+</span>
                                <kbd className="px-1.5 py-0.5 text-xs font-medium bg-background-secondary border border-border-subtle rounded text-text-strong shadow-sm">
                                    Enter
                                </kbd>
                                <span>to submit your rant</span>
                            </div>
                        </div>
                    </div>

                </form>
            </CardContent>
            <CardFooter className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6">
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
                                className="flex-1 py-5 sm:py-6 bg-background-secondary hover:bg-background-secondary/70 rounded-full text-sm sm:text-base font-ui transition-colors duration-200"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="w-full py-5 sm:py-6 text-sm sm:text-base font-medium rounded-full flex items-center gap-2 justify-center font-ui transition-all duration-300"
                                style={{
                                    background: `linear-gradient(90deg, #00C2FF, #904FFF)`,
                                }}
                            >
                                {isSubmitting ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            className="w-4 h-4 sm:w-5 sm:h-5"
                                        >
                                            <Send size={16} className="sm:hidden" />
                                            <Send size={18} className="hidden sm:block" />
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
                                className="w-full py-5 sm:py-6 text-sm sm:text-base font-medium rounded-full flex items-center gap-2 justify-center transition-all duration-300 font-ui hover:opacity-90"
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
