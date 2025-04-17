export type MoodType = 'Happy' | 'Sad' | 'Angry' | 'Excited' | 'Loved' | 'Confused';

export interface Rant {
    id: string;
    created_at: string;
    content: string;
    mood: string;
    likes: number;
    author_id: string;
    language: string;
    sentiment: string;
}

export interface Comment {
    id: number;
    created_at: string;
    rant_id: string;
    author_id: string;
    content: string;
}

export interface LikeLog {
    id: string;
    rant_id: string;
    author_id: string;
    created_at: string;
}
