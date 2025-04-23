import { v4 as uuidv4 } from 'uuid';

/**
 * Gets the anonymous user ID from localStorage or creates a new one if it doesn't exist
 */
export function getAnonymousUserId(): string {
    let anonymousUserId = localStorage.getItem('anonymous_user_id');

    try {
        if (!anonymousUserId) {
            anonymousUserId = uuidv4();
            localStorage.setItem('anonymous_user_id', anonymousUserId);
        }
    } catch (error) {
        console.error('Failed to access or store anonymous_user_id:', error);
        anonymousUserId = uuidv4(); // Fallback to a temporary ID
    }

    return anonymousUserId;
}
