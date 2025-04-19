import { useState, useEffect, useCallback } from 'react';
import { MoodType } from '@/lib/utils/mood';
import { saveDraft, getDrafts, clearDrafts } from '@/utils/userStorage';
import { toast } from '@/hooks/use-toast';

export const useDraftPersistence = () => {
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [hasSavedDrafts, setHasSavedDrafts] = useState(false);

  // Initialize from local storage
  useEffect(() => {
    const drafts = getDrafts();
    if (drafts.length > 0) {
      const latestDraft = drafts[0];
      // Only auto-load if the draft is from the last 24 hours
      const isDraftRecent = Date.now() - latestDraft.timestamp < 24 * 60 * 60 * 1000;

      if (isDraftRecent) {
        setHasSavedDrafts(true);
      }
    }
  }, []);

  // Function to load a specific draft
  const loadDraft = useCallback((index: number = 0) => {
    const drafts = getDrafts();
    if (drafts.length > index) {
      const draft = drafts[index];
      setContent(draft.content || '');
      setSelectedMood(draft.mood);

      toast({
        title: "Draft loaded",
        description: "Your saved draft has been restored.",
        duration: 3000,
      });
    }
  }, []);

  // Function to load the most recent draft
  const loadLatestDraft = useCallback(() => {
    loadDraft(0);
  }, [loadDraft]);

  // Auto-save draft when content or mood changes
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      if (content.trim() || selectedMood) {
        saveDraft(content, selectedMood);
      }
    }, 1000); // Save after 1 second of inactivity

    return () => clearTimeout(saveTimer);
  }, [content, selectedMood]);

  // Clear draft from storage
  const clearDraft = useCallback(() => {
    setContent('');
    setSelectedMood(null);
    clearDrafts();
  }, []);

  return {
    content,
    setContent,
    selectedMood,
    setSelectedMood,
    clearDraft,
    hasSavedDrafts,
    loadLatestDraft,
    loadDraft
  };
};
