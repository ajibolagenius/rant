import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
import { GearIcon } from '@radix-ui/react-icons';
import { ScrollArea } from '@/components/ui/scroll-area';
import LanguageSelector from '@/components/LanguageSelector';
import AccessibilitySettings from '@/components/AccessibilitySettings';
import ThemeSettings from '@/components/ThemeSettings';
import { XIcon, InfoIcon } from 'lucide-react';

interface SettingsProps {
    onClose?: () => void;
}

const Settings = ({ onClose }: SettingsProps = {}) => {
    const { t } = useTranslation('common');
    const [open, setOpen] = useState(false);

    // Handle the onClose prop when the sheet is closed
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

    return (
        <Sheet open={open} onOpenChange={handleOpenChange}>
            {/* Only show the trigger button if no onClose prop is provided */}
            {!onClose && (
                <SheetTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label={t('settings.title') || "Settings"}
                        className="h-8 w-8 rounded-full text-cyan-400 hover:bg-cyan-900/20 hover:text-cyan-300"
                        title={t('settings.title') || "Settings"}
                    >
                        <GearIcon className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
            )}

            <SheetContent
                className="border-l border-[#2e2e3a] bg-[#09090B] p-0 max-w-[95vw] sm:max-w-[450px] flex flex-col"
                onEscapeKeyDown={() => handleOpenChange(false)}
                onInteractOutside={() => handleOpenChange(false)}
            >
                <div className="border-b border-[#333] p-4">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="text-white text-xl font-bold flex items-center">
                            <GearIcon className="h-5 w-5 mr-2 text-cyan-500" />
                            {t('settings.title') || "Settings"}
                        </SheetTitle>
                        {/* Ensure only the custom close button is shown */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenChange(false)}
                            className="text-gray-400 hover:text-white hover:bg-[#252525] rounded-full"
                        >
                            <XIcon size={18} />
                        </Button>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">
                        {"Customize your experience with these settings"}
                    </p>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col mt-4">
                    <Tabs defaultValue="accessibility" className="flex-1 overflow-hidden flex flex-col">
                        <TabsList className="flex bg-[#121212] p-1 rounded-lg mb-4 overflow-x-auto justify-center mx-4">
                            <TabsTrigger
                                value="accessibility"
                                className="flex-shrink-0 data-[state=active]:bg-[#252525] data-[state=active]:text-white data-[state=active]:shadow-sm"
                            >
                                {"Accessibility"}
                            </TabsTrigger>
                            <TabsTrigger
                                value="language"
                                className="flex-shrink-0 data-[state=active]:bg-[#252525] data-[state=active]:text-white data-[state=active]:shadow-sm"
                            >
                                {"Language"}
                            </TabsTrigger>
                            <TabsTrigger
                                value="theme"
                                className="flex-shrink-0 data-[state=active]:bg-[#252525] data-[state=active]:text-white data-[state=active]:shadow-sm"
                            >
                                {"Theme"}
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex-1" style={{ height: 'calc(60vh - 120px)' }}>
                            <ScrollArea className="h-full px-4">
                                <TabsContent
                                    value="accessibility"
                                    className="flex-1 overflow-hidden data-[state=active]:animate-in data-[state=active]:fade-in-50"
                                >
                                    <div className="bg-[#121212] hover:bg-[#1A1A1A] border border-[#222] p-3 rounded-lg">
                                        <h3 className="text-base sm:text-lg font-medium text-white mb-4">
                                            {t('settings.accessibilitySettings') || "Accessibility Settings"}
                                        </h3>
                                        <AccessibilitySettings />
                                    </div>
                                </TabsContent>

                                <TabsContent
                                    value="language"
                                    className="flex-1 overflow-hidden data-[state=active]:animate-in data-[state=active]:fade-in-50"
                                >
                                    <div className="bg-[#121212] hover:bg-[#1A1A1A] border border-[#222] p-3 rounded-lg">
                                        <h3 className="text-base sm:text-lg font-medium text-white mb-4">
                                            {t('settings.selectLanguage') || "Select Language"}
                                        </h3>
                                        <div className="space-y-3">
                                            <LanguageSelector />
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent
                                    value="theme"
                                    className="flex-1 overflow-hidden data-[state=active]:animate-in data-[state=active]:fade-in-50"
                                >
                                    <div className="bg-[#121212] hover:bg-[#1A1A1A] border border-[#222] p-3 rounded-lg">
                                        <h3 className="text-base sm:text-lg font-medium text-white mb-4">
                                            {t('settings.themeSettings') || "Theme Settings"}
                                        </h3>
                                        <ThemeSettings />
                                    </div>
                                </TabsContent>
                            </ScrollArea>
                        </div>
                    </Tabs>
                </div>
                sett
                {/* Footer with info text */}
                <SheetFooter className="pt-4 mt-4 border-t border-[#333] flex items-center justify-center gap-2 text-xs text-gray-500 p-4">
                    <div className="flex items-center gap-1 text-center">
                        <InfoIcon size={12} />
                        <span>{"Your preferences are automatically saved"}</span>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};

export default Settings;
