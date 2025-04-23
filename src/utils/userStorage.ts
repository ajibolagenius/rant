import { Rant } from "@/lib/types/rant";
import { MoodType } from "@/lib/utils/mood";
import { getAnonymousUserId } from "@/utils/authorId";

// Types for our storage
interface RantDraft {
  content: string;
  mood: MoodType | null;
  timestamp: number;
}

interface DeletedRant extends Rant {
  deletedAt: number;
}

interface UserStorage {
  drafts: RantDraft[];
  myRants: string[]; // IDs of user's rants
  bookmarks: string[]; // IDs of bookmarked rants
  recentlyDeleted: DeletedRant[];
}

// Initialize storage with default values
const getInitialStorage = (): UserStorage => ({
  drafts: [],
  myRants: [],
  bookmarks: [],
  recentlyDeleted: []
});

// Helper to get storage key based on author ID
const getStorageKey = (): string => {
  const anonymousUserId = getAnonymousUserId();
  return `bentoRant_${anonymousUserId}_storage`;
};

// Get user storage
export const getUserStorage = (): UserStorage => {
  try {
    const data = localStorage.getItem(getStorageKey());
    if (!data) return getInitialStorage();
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to get user storage:", error);
    return getInitialStorage();
  }
};

// Save user storage
export const saveUserStorage = (storage: UserStorage): void => {
  try {
    localStorage.setItem(getStorageKey(), JSON.stringify(storage));
  } catch (error) {
    console.error("Failed to save user storage:", error);
  }
};

// Draft management
export const saveDraft = (content: string, mood: MoodType | null): void => {
  const storage = getUserStorage();
  const draft: RantDraft = { content, mood, timestamp: Date.now() };

  // Update the most recent draft (replace if exists, add if not)
  const updatedDrafts = [draft, ...storage.drafts.slice(0, 4)]; // Keep only 5 most recent drafts

  saveUserStorage({
    ...storage,
    drafts: updatedDrafts
  });
};

export const getDrafts = (): RantDraft[] => {
  return getUserStorage().drafts;
};

export const clearDrafts = (): void => {
  const storage = getUserStorage();
  saveUserStorage({
    ...storage,
    drafts: []
  });
};

// My Rants management
export const addMyRant = (rantId: string): void => {
  const storage = getUserStorage();
  if (!storage.myRants.includes(rantId)) {
    saveUserStorage({
      ...storage,
      myRants: [rantId, ...storage.myRants]
    });
  }
};

export const getMyRants = (): string[] => {
  return getUserStorage().myRants;
};

// Bookmark management
export const toggleBookmark = (rantId: string): boolean => {
  const storage = getUserStorage();
  const isBookmarked = storage.bookmarks.includes(rantId);

  if (isBookmarked) {
    saveUserStorage({
      ...storage,
      bookmarks: storage.bookmarks.filter(id => id !== rantId)
    });
    return false;
  } else {
    saveUserStorage({
      ...storage,
      bookmarks: [rantId, ...storage.bookmarks]
    });
    return true;
  }
};

export const isBookmarked = (rantId: string): boolean => {
  return getUserStorage().bookmarks.includes(rantId);
};

export const getBookmarks = (): string[] => {
  return getUserStorage().bookmarks;
};

// Deleted rants management (for undo functionality)
export const addDeletedRant = (rant: Rant): void => {
  const storage = getUserStorage();
  const deletedRant: DeletedRant = {
    ...rant,
    deletedAt: Date.now()
  };

  // Keep only the 10 most recent deleted rants for 15 minutes
  const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000;
  const recentlyDeleted = [
    deletedRant,
    ...storage.recentlyDeleted.filter(r => r.deletedAt > fifteenMinutesAgo).slice(0, 9)
  ];

  saveUserStorage({
    ...storage,
    recentlyDeleted
  });
};

export const getRecentlyDeleted = (): DeletedRant[] => {
  const storage = getUserStorage();
  // Only return rants deleted in the last 15 minutes
  const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000;
  return storage.recentlyDeleted.filter(rant => rant.deletedAt > fifteenMinutesAgo);
};

export const restoreDeletedRant = (rantId: string): Rant | null => {
  const storage = getUserStorage();
  const deletedRant = storage.recentlyDeleted.find(r => r.id === rantId);

  if (deletedRant) {
    // Remove from deleted list
    saveUserStorage({
      ...storage,
      recentlyDeleted: storage.recentlyDeleted.filter(r => r.id !== rantId)
    });

    // Return the rant without the deletedAt property
    const { deletedAt, ...rant } = deletedRant;
    return rant as Rant;
  }

  return null;
};
