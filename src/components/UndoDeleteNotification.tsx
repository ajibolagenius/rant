import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/button';
import { Rant } from '@/lib/types/rant';
import { restoreDeletedRant } from '@/utils/userStorage';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useAccessibility } from '@/components/AccessibilityContext';
import { Cross2Icon } from '@radix-ui/react-icons';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface UndoDeleteNotificationProps {
    rantId: string;
    onClose: () => void;
    onUndo: (rant: Rant) => void;
    index?: number; // Add index prop for stacking
}

const UndoDeleteNotification: React.FC<UndoDeleteNotificationProps> = ({
    rantId,
    onClose,
    onUndo,
    index = 0 // Default to 0 if not provided
}) => {
    const { t } = useTranslation();
    const [timeLeft, setTimeLeft] = useState(10);
    const { reducedMotion } = useAccessibility();

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onClose();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Accessibility: Add ARIA live region announcement
        const announceMessage = () => {
            const liveRegion = document.getElementById('undo-delete-live-region');
            if (liveRegion) {
                liveRegion.textContent = `${t('Rant deleted')}. ${t('You have')} ${timeLeft} ${t('seconds to undo')}.`;
            }
        };
        announceMessage();

        return () => clearInterval(timer);
    }, [onClose, t, timeLeft]);

    const handleUndo = async () => {
        const restoredRant = restoreDeletedRant(rantId);
        if (restoredRant) {
            try {
                // Insert rant back into Supabase
                const { error } = await supabase.from('rants').insert([{ ...restoredRant }]);
                if (error) throw error;
                toast({
                    title: t('Rant Restored'),
                    description: t('Your rant has been restored successfully.'),
                    variant: 'default',
                });
                onUndo(restoredRant);
            } catch (err) {
                toast({
                    title: t('Error'),
                    description: t('Failed to restore rant. Please try again.'),
                    variant: 'error',
                });
            }
        }
        onClose();
    };

    // Animation variants that respect reduced motion preferences
    const containerVariants = {
        hidden: reducedMotion ? { opacity: 0.9 } : { opacity: 0, y: 20 },
        visible: reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 },
        exit: reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }
    };

    // Calculate bottom position based on index for stacking
    // Each toast is approximately 120px tall with 8px gap
    const bottomPosition = 16 + (index * 128); // 16px base bottom + (index * (height + gap))

    return (
        <>
            {/* Accessibility: Hidden live region for screen readers */}
            <div
                id="undo-delete-live-region"
                className="sr-only"
                aria-live="polite"
                role="status"
            />

            <AnimatePresence>
                <motion.div
                    className={cn(
                        "fixed right-4 bg-background-secondary border border-border-subtle",
                        "rounded-lg shadow-high p-4 max-w-xs z-50 backdrop-blur-sm"
                    )}
                    style={{
                        bottom: `${bottomPosition}px`,
                        zIndex: 50 + index // Ensure proper z-index stacking
                    }}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={containerVariants}
                    transition={{ duration: reducedMotion ? 0.1 : 0.3, ease: "easeOut" }}
                >
                    <div className="flex flex-col space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-text-primary">
                                {t('Rant Deleted')}
                            </p>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="h-6 w-6 rounded-full text-text-muted hover:text-text-primary hover:bg-background-hover"
                                aria-label={t('Dismiss notification')}
                            >
                                <Cross2Icon className="h-3 w-3" />
                            </Button>
                        </div>

                        <p className="text-xs text-text-muted">
                            {t('This action will be permanent in')} {timeLeft} {t('seconds')}.
                        </p>

                        <div className="flex justify-between items-center pt-1">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleUndo}
                                className={cn(
                                    "text-accent-teal hover:text-accent-teal-hover hover:bg-accent-teal/10",
                                    "border-accent-teal/30 hover:border-accent-teal/50 gap-1.5"
                                )}
                            >
                                {/* Custom SVG for undo icon instead of UndoIcon */}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-3 w-3"
                                >
                                    <path d="M9 14 4 9l5-5" />
                                    <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11" />
                                </svg>
                                {t('Undo Delete')}
                            </Button>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-background-dark rounded-b-lg overflow-hidden">
                        <motion.div
                            className="h-full bg-accent-teal"
                            initial={{ width: "100%" }}
                            animate={{ width: "0%" }}
                            transition={{
                                duration: 10,
                                ease: "linear",
                                ...(!reducedMotion && {
                                    transitionEnd: { display: "none" }
                                })
                            }}
                        />
                    </div>
                </motion.div>
            </AnimatePresence>
        </>
    );
};

// Toast container component to manage multiple toasts
interface ToastContainerProps {
    toasts: Array<{
        id: string;
        rantId: string;
        onUndo: (rant: Rant) => void;
    }>;
    onClose: (id: string) => void;
}

export const UndoDeleteToastContainer: React.FC<ToastContainerProps> = ({
    toasts,
    onClose
}) => {
    return (
        <div className="fixed bottom-0 right-0 z-50 p-4 flex flex-col-reverse gap-2 pointer-events-none">
            <AnimatePresence>
                {toasts.map((toast, index) => (
                    <div key={toast.id} className="pointer-events-auto">
                        <UndoDeleteNotification
                            rantId={toast.rantId}
                            onClose={() => onClose(toast.id)}
                            onUndo={toast.onUndo}
                            index={index}
                        />
                    </div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default UndoDeleteNotification;
