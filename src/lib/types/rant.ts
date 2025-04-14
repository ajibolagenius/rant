
import { MoodType } from '../utils/mood';

export interface Rant {
  id: string;
  content: string;
  mood: MoodType;
  createdAt: string;
  likes: number;
  comments: number;
  userAlias: string;
  isLiked?: boolean;
}
