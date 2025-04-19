import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { GearIcon } from '@radix-ui/react-icons';
import LanguageSelector from '@/components/LanguageSelector';
import AccessibilitySettings from '@/components/AccessibilitySettings';
import ThemeSettings from '@/components/ThemeSettings';

const Settings = () => {
    const { t } = useTranslation('common');
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t('settings.title')}
                    className="rounded-full"
                >
                    <GearIcon className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:max-w-none">
                <SheetHeader>
                    <SheetTitle>{t('settings.title')}</SheetTitle>
                </SheetHeader>

                <div className="mt-6">
                    <Tabs defaultValue="accessibility">
                        <TabsList className="grid grid-cols-3 mb-6">
                            <TabsTrigger value="accessibility">{t('settings.accessibility')}</TabsTrigger>
                            <TabsTrigger value="language">{t('settings.language')}</TabsTrigger>
                            <TabsTrigger value="theme">{t('settings.theme')}</TabsTrigger>
                        </TabsList>

                        <TabsContent value="accessibility">
                            <AccessibilitySettings />
                        </TabsContent>

                        <TabsContent value="language">
                            <div className="p-4 space-y-4">
                                <h3 className="text-lg font-medium">{t('settings.selectLanguage')}</h3>
                                <div className="grid grid-cols-1 gap-2">
                                    <LanguageSelector />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="theme">
                            <ThemeSettings />
                        </TabsContent>
                    </Tabs>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default Settings;
