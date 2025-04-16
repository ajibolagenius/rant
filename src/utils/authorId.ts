import { v4 as uuidv4 } from 'uuid';

export const getAuthorId = (): string => {
    let authorId = localStorage.getItem('anonymous_author_id');

    if (!authorId) {
        authorId = uuidv4();
        localStorage.setItem('anonymous_author_id', authorId);
    }

    return authorId;
};

export const getDisplayAuthorId = (authorId: string): string => {
    // Take the last 3 characters of the UUID for display
    return `Anonymous #${authorId.slice(-3).toUpperCase()}`;
};
