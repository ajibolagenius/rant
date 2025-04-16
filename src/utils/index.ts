export type MoodType = 'Happy' | 'Sad' | 'Angry' | 'Excited' | 'Loved' | 'Confused';

export interface Rant {
    id: string;
    content: string;
    mood: MoodType;
    created_at: string;
    likes: number;
    author_id: string;
    language?: string;
    sentiment?: 'Positive' | 'Neutral' | 'Negative';
}

export interface LikeLog {
    id: string;
    rant_id: string;
    author_id: string;
    created_at: string;
}

export interface Comment {
    id: string;
    rant_id: string;
    author_id: string;
    content: string;
    created_at: string;
}
