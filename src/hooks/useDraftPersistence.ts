import { useState, useEffect } from 'react';
import { MoodType } from '@/lib/utils/mood';

interface DraftState {
    content: string;
    selectedMood: MoodType | null;
}

export function useDraftPersistence(initialState: DraftState = { content: '', selectedMood: null }) {
    const [content, setContent] = useState(initialState.content);
    const [selectedMood, setSelectedMood] = useState<MoodType | null>(initialState.selectedMood);

    // Load draft from localStorage on mount
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

    // Save draft to localStorage when content or mood changes
    useEffect(() => {
        if (content || selectedMood) {
            localStorage.setItem('rantDraft', JSON.stringify({ content, mood: selectedMood }));
        }
    }, [content, selectedMood]);

    const clearDraft = () => {
        setContent('');
        setSelectedMood(null);
        localStorage.removeItem('rantDraft');
    };

    return { content, setContent, selectedMood, setSelectedMood, clearDraft };
}
