import { v4 as uuidv4 } from 'uuid';

/**
 * Gets the author ID from localStorage or creates a new one if it doesn't exist
 */
export function getAuthorId(): string {
    let authorId = localStorage.getItem('authorId');

    if (!authorId) {
        authorId = uuidv4();
        localStorage.setItem('authorId', authorId);
    }

    return authorId;
}
