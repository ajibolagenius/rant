import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAccessibility } from '@/components/AccessibilityContext.tsx';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

const AccessibilitySettings: React.FC = () => {
    const { t } = useTranslation();
    const {
        highContrast,
        toggleHighContrast,
        fontSize,
        setFontSize,
        reducedMotion,
        toggleReducedMotion
    } = useAccessibility();

    return (
        <div className="space-y-6 p-2" role="region" aria-label="Accessibility settings">
            <div className="space-y-2">
                <h3 className="text-lg font-medium">{t('accessibility.title')}</h3>
                <p className="text-sm text-muted-foreground">{t('accessibility.description')}</p>
            </div>

            <Separator />

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label htmlFor="high-contrast">{t('accessibility.highContrast')}</Label>
                        <p className="text-sm text-muted-foreground">{t('accessibility.highContrastDescription')}</p>
                    </div>
                    <Switch
                        id="high-contrast"
                        checked={highContrast}
                        onCheckedChange={toggleHighContrast}
                        aria-label={t('accessibility.highContrast')}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label htmlFor="reduced-motion">{t('accessibility.reducedMotion')}</Label>
                        <p className="text-sm text-muted-foreground">{t('accessibility.reducedMotionDescription')}</p>
                    </div>
                    <Switch
                        id="reduced-motion"
                        checked={reducedMotion}
                        onCheckedChange={toggleReducedMotion}
                        aria-label={t('accessibility.reducedMotion')}
                    />
                </div>

                <div className="space-y-2">
                    <Label>{t('accessibility.fontSize')}</Label>
                    <RadioGroup value={fontSize} onValueChange={(value) => setFontSize(value as any)}>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="normal" id="fontSize-normal" />
                            <Label htmlFor="fontSize-normal">{t('accessibility.fontSizeNormal')}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="large" id="fontSize-large" />
                            <Label htmlFor="fontSize-large">{t('accessibility.fontSizeLarge')}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="x-large" id="fontSize-x-large" />
                            <Label htmlFor="fontSize-x-large">{t('accessibility.fontSizeXLarge')}</Label>
                        </div>
                    </RadioGroup>
                </div>
            </div>
        </div>
    );
};

export default AccessibilitySettings;
