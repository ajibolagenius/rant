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
                <h3 className="text-lg font-medium font-heading">Accessibility</h3>
                <p className="text-sm text-muted-foreground font-body">Customize your experience for better accessibility</p>
            </div>

            <Separator />

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label htmlFor="high-contrast" className="font-ui">High Contrast</Label>
                        <p className="text-sm text-muted-foreground font-body">Increases contrast for better readability</p>
                    </div>
                    <Switch
                        id="high-contrast"
                        checked={highContrast}
                        onCheckedChange={toggleHighContrast}
                        aria-label="High Contrast"
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label htmlFor="reduced-motion" className="font-ui">Reduced Motion</Label>
                        <p className="text-sm text-muted-foreground font-body">Minimizes animations throughout the interface</p>
                    </div>
                    <Switch
                        id="reduced-motion"
                        checked={reducedMotion}
                        onCheckedChange={toggleReducedMotion}
                        aria-label="Reduced Motion"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="font-ui">Font Size</Label>
                    <RadioGroup value={fontSize} onValueChange={(value) => setFontSize(value as any)}>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="normal" id="fontSize-normal" />
                            <Label htmlFor="fontSize-normal" className="font-body">Normal</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="large" id="fontSize-large" />
                            <Label htmlFor="fontSize-large" className="font-body">Large</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="x-large" id="fontSize-x-large" />
                            <Label htmlFor="fontSize-x-large" className="font-body">Extra Large</Label>
                        </div>
                    </RadioGroup>
                </div>
            </div>
        </div>
    );
};

export default AccessibilitySettings;
