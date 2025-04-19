import { createClient } from '@supabase/supabase-js';
import CryptoJS from 'crypto-js';
import DOMPurify from 'dompurify';
import { supabase } from '@/lib/supabase.ts';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Encryption key - in a real app, this should be derived from something unique to the user
// For this anonymous app, we'll use a combination of browser info and a secret
const getEncryptionKey = (): string => {
    const browserInfo = navigator.userAgent + navigator.language;
    const secret = 'rant-app-encryption-key'; // In production, use environmental variables
    return CryptoJS.SHA256(browserInfo + secret).toString();
};

// Secure localStorage functions
export const secureStorage = {
    // Set with encryption
    setItem: (key: string, value: string): void => {
        try {
            const encryptedValue = CryptoJS.AES.encrypt(
                value,
                getEncryptionKey()
            ).toString();
            localStorage.setItem(key, encryptedValue);
        } catch (error) {
            console.error('Failed to encrypt and store data:', error);
            // Fallback to regular storage in case of error
            localStorage.setItem(key, value);
        }
    },

    // Get with decryption
    getItem: (key: string): string | null => {
        try {
            const encryptedValue = localStorage.getItem(key);
            if (!encryptedValue) return null;

            const decryptedBytes = CryptoJS.AES.decrypt(
                encryptedValue,
                getEncryptionKey()
            );
            return decryptedBytes.toString(CryptoJS.enc.Utf8);
        } catch (error) {
            console.error('Failed to decrypt data:', error);
            // Fallback to regular retrieval in case of error
            return localStorage.getItem(key);
        }
    },

    // Remove item
    removeItem: (key: string): void => {
        localStorage.removeItem(key);
    }
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
    // Use DOMPurify to sanitize HTML content
    return DOMPurify.sanitize(input, {
        ALLOWED_TAGS: [], // Don't allow any HTML tags
        ALLOWED_ATTR: []  // Don't allow any HTML attributes
    });
};

// Input validation
export const validateRantInput = (text: string): { valid: boolean; message?: string } => {
    if (!text || text.trim() === '') {
        return { valid: false, message: 'Rant cannot be empty' };
    }

    if (text.length > 300) {
        return { valid: false, message: 'Rant cannot exceed 300 characters' };
    }

    return { valid: true };
};

// Rate limiting check
export const checkRateLimit = async (authorId: string): Promise<{ allowed: boolean; message?: string }> => {
    try {
        // Get the timestamp from one hour ago
        const oneHourAgo = new Date();
        oneHourAgo.setHours(oneHourAgo.getHours() - 1);

        // Query for rants submitted by this author in the last hour
        const { data, error, count } = await supabase
            .from('rants')
            .select('id', { count: 'exact' })
            .eq('author_id', authorId)
            .gte('created_at', oneHourAgo.toISOString());

        if (error) throw error;

        // Allow maximum 5 rants per hour
        if (count && count >= 5) {
            return {
                allowed: false,
                message: 'Rate limit exceeded. You can post again in a few minutes.'
            };
        }

        return { allowed: true };
    } catch (error) {
        console.error('Rate limit check failed:', error);
        // If check fails, allow the action to proceed
        return { allowed: true };
    }
};

// Generate or retrieve secure author ID
export const getSecureAuthorId = (): string => {
    let authorId = secureStorage.getItem('anonymous_id');

    if (!authorId) {
        // Generate a new UUID
        authorId = crypto.randomUUID ?
            crypto.randomUUID() :
            Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        // Store it securely
        secureStorage.setItem('anonymous_id', authorId);
    }

    return authorId;
};
