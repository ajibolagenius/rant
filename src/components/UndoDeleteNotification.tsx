import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Rant } from '@/lib/types/rant';
import { restoreDeletedRant } from '@/utils/userStorage';
import { useTranslation } from 'react-i18next';

interface UndoDeleteNotificationProps {
    rantId: string;
    onClose: () => void;
    onUndo: (rant: Rant) => void;
}

const UndoDeleteNotification: React.FC<UndoDeleteNotificationProps> = ({
    rantId,
    onClose,
    onUndo
}) => {
    const { t } = useTranslation();
    const [timeLeft, setTimeLeft] = useState(10);

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

        return () => clearInterval(timer);
    }, [onClose]);

    const handleUndo = () => {
        const restoredRant = restoreDeletedRant(rantId);
        if (restoredRant) {
            onUndo(restoredRant);
        }
        onClose();
    };

    return (
        <motion.div
            className="fixed bottom-4 right-4 bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-4 max-w-xs z-50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
        >
            <div className="flex flex-col space-y-2">
                <p className="text-sm text-white">{t('undo.rantDeleted')}</p>
                <div className="flex justify-between items-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleUndo}
                        className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/50"
                    >
                        {t('undo.undoAction')} ({timeLeft}s)
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-300"
                    >
                        {t('undo.dismiss')}
                    </Button>
                </div>
            </div>
            <div
                className="absolute bottom-0 left-0 h-1 bg-cyan-500 rounded-b-lg transition-all duration-1000"
                style={{ width: `${(timeLeft / 10) * 100}%` }}
            />
        </motion.div>
    );
};

export default UndoDeleteNotification;
