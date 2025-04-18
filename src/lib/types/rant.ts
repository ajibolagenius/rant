
import { MoodType } from '../utils/mood';

export interface Rant {
    id: string;
    content: string;
    mood: MoodType;
    likes: number;
    created_at: string;
    comments: number;
    userAlias: string;
    isLiked?: boolean;
    author_id: string;
    is_optimistic?: boolean;
}
