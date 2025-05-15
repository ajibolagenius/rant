import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { GearIcon } from '@radix-ui/react-icons';
import { ScrollArea } from '@/components/ui/scroll-area';
import LanguageSelector from '@/components/LanguageSelector';
import AccessibilitySettings from '@/components/AccessibilitySettings';
import ThemeSettings from '@/components/ThemeSettings';
import { XIcon, InfoIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SettingsProps {
    onClose?: () => void;
}

const Settings = ({ onClose }: SettingsProps = {}) => {
    const { t } = useTranslation('common');
    const [open, setOpen] = useState(false);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    // Handle the onClose prop when the modal is closed
    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen && onClose) {
            onClose();
        }
    };

    // For direct use in Navbar, auto-open the settings when component mounts
    useEffect(() => {
        if (onClose) {
            setOpen(true);
        }
    }, [onClose]);

    useEffect(() => {
        if (open && closeButtonRef.current) {
            closeButtonRef.current.focus();
        }
    }, [open]);

    // Animation variants for the modal
    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    };

    const modalVariants = {
        hidden: { opacity: 0, y: 50, scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 30
            }
        },
        exit: {
            opacity: 0,
            y: 50,
            scale: 0.95,
            transition: {
                duration: 0.2
            }
        }
    };

    // If not open and no onClose prop, render just the trigger button
    if (!open && !onClose) {
        return (
            <Button
                variant="ghost"
                size="icon"
                aria-label="Settings"
                className="h-8 w-8 rounded-full text-primary hover:bg-primary/20 hover:text-primary"
                title="Settings"
                onClick={() => setOpen(true)}
            >
                <GearIcon className="h-5 w-5" />
            </Button>
        );
    }

    // If not open and has onClose prop, render nothing
    if (!open) {
        return null;
    }

    return (
        <motion.div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={overlayVariants}
            onClick={() => handleOpenChange(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
            aria-describedby="settings-desc"
        >
            <motion.div
                className="bg-background-dark border border-border-subtle rounded-lg shadow-high w-full max-w-[450px] max-h-[90vh] flex flex-col overflow-hidden"
                variants={modalVariants}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="border-b border-border-subtle p-4">
                    <div className="flex items-center justify-between">
                        <div id="settings-title" className="text-text-strong text-xl font-heading font-bold flex items-center">
                            <GearIcon className="h-5 w-5 mr-2 text-primary" />
                            Settings
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenChange(false)}
                            className="text-text-muted hover:text-text-strong hover:bg-background-secondary rounded-full"
                            aria-label="Close settings dialog"
                            ref={closeButtonRef}
                        >
                            <XIcon size={18} />
                            <span className="sr-only">Close</span>
                        </Button>
                    </div>
                    <p id="settings-desc" className="text-text-muted text-sm mt-1 font-body">
                        Customize your experience with these settings
                    </p>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col mt-4">
                    <Tabs defaultValue="accessibility" className="flex-1 overflow-hidden flex flex-col">
                        <TabsList className="flex bg-background-secondary p-1 rounded-lg mb-4 overflow-x-auto justify-center mx-4">
                            <TabsTrigger
                                value="accessibility"
                                className="flex-shrink-0 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm font-ui"
                            >
                                Accessibility
                            </TabsTrigger>
                            <TabsTrigger
                                value="theme"
                                className="flex-shrink-0 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm font-ui"
                            >
                                Theme
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex-1" style={{ height: 'calc(60vh - 120px)' }}>
                            <ScrollArea className="h-full px-4">
                                <TabsContent
                                    value="accessibility"
                                    className="flex-1 overflow-hidden data-[state=active]:animate-in data-[state=active]:fade-in-50"
                                >
                                    <div className="bg-background-secondary hover:bg-background-secondary/80 border border-border-subtle p-3 rounded-lg">
                                        <h3 className="text-base sm:text-lg font-heading font-semibold text-text-strong mb-4">
                                            Accessibility Settings
                                        </h3>
                                        <AccessibilitySettings />
                                    </div>
                                </TabsContent>

                                <TabsContent
                                    value="theme"
                                    className="flex-1 overflow-hidden data-[state=active]:animate-in data-[state=active]:fade-in-50"
                                >
                                    <div className="bg-background-secondary hover:bg-background-secondary/80 border border-border-subtle p-3 rounded-lg">
                                        <h3 className="text-base sm:text-lg font-heading font-semibold text-text-strong mb-4">
                                            Theme Settings
                                        </h3>
                                        <ThemeSettings />
                                    </div>
                                </TabsContent>
                            </ScrollArea>
                        </div>
                    </Tabs>
                </div>

                {/* Footer with info text */}
                <div className="pt-4 mt-4 border-t border-border-subtle flex items-center justify-center gap-2 text-xs text-text-muted p-4 font-body">
                    <div className="flex items-center gap-1 text-center">
                        <InfoIcon size={12} />
                        <span>Your preferences are automatically saved</span>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Settings;
