import { createClient } from '@supabase/supabase-js';
import CryptoJS from 'crypto-js';
import DOMPurify from 'dompurify';
import { supabase } from '@/lib/supabase.ts';
import { v4 as uuidv4 } from 'uuid';

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

        // More robust check for encrypted values - CryptoJS encrypted strings are base64-encoded
        // and typically have a specific format
        const isLikelyEncrypted = encryptedValue.includes('U2FsdGVkX1') ||
                                 (encryptedValue.length > 20 && /^[A-Za-z0-9+/=]+$/.test(encryptedValue));

        if (!isLikelyEncrypted) {
            // If it doesn't look encrypted, return it as is
            return encryptedValue;
        }

        try {
            const decryptedBytes = CryptoJS.AES.decrypt(
                encryptedValue,
                getEncryptionKey()
            );

            // More robust validation of decrypted data
            if (decryptedBytes && decryptedBytes.sigBytes > 0) {
                try {
                    // Try to convert to string and validate it's proper UTF-8
                    const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);

                    // Basic validation that the decrypted text is reasonable
                    if (decryptedText && decryptedText.length > 0 && !decryptedText.includes('\u0000')) {
                        return decryptedText;
                    }
                } catch (stringError) {
                    console.warn('Error converting decrypted data to string:', stringError);
                }
            }

            // If we get here, decryption didn't produce valid data
            console.warn('Decryption produced invalid data for key:', key);
            return encryptedValue;
        } catch (decryptError) {
            console.warn('Decryption failed for key:', key, 'Error:', decryptError);
            return encryptedValue;
        }
    } catch (error) {
        console.error('Failed to retrieve or decrypt data:', error);
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

    if (text.length > 560) {
        return { valid: false, message: 'Rant cannot exceed 560 characters' };
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
            .eq('anonymous_user_id', authorId)
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
    try {
        // Check if we have a problematic stored ID that needs to be reset
        const hasDecryptionIssue = (() => {
            try {
                // Try to get the raw value first
                const rawValue = localStorage.getItem('anonymous_id');
                if (!rawValue) return false;

                // Try to decrypt it
                const decryptedBytes = CryptoJS.AES.decrypt(rawValue, getEncryptionKey());
                decryptedBytes.toString(CryptoJS.enc.Utf8);
                // If we get here, decryption worked fine
                return false;
            } catch (e) {
                // If we catch an error, we have a decryption issue
                console.warn('Detected corrupted anonymous_id, will reset it');
                return true;
            }
        })();

        // If we detected a decryption issue, clear the problematic value
        if (hasDecryptionIssue) {
            localStorage.removeItem('anonymous_id');
        }

        // Try to get the author ID from secure storage
        let authorId = secureStorage.getItem('anonymous_id');

        // More comprehensive validation of the author ID
        const isValidAuthorId = authorId &&
                               typeof authorId === 'string' &&
                               authorId.length >= 10 &&
                               !authorId.includes('Error') &&
                               !/[^\x20-\x7E]/.test(authorId); // Check for non-printable characters

        if (!isValidAuthorId) {
            // Generate a new UUID with fallbacks
            let newId;
            try {
                // Try the modern crypto.randomUUID() first
                if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
                    newId = crypto.randomUUID();
                } else {
                    // Fallback to a simple random ID
                    newId = uuidv4();
                }
            } catch (idGenError) {
                // Ultimate fallback
                newId = 'fallback-' + Date.now() + '-' + Math.random().toString(36).substring(2, 10);
            }

            authorId = newId;

            // Try to store the new ID
            try {
                secureStorage.setItem('anonymous_id', authorId);
                console.log('Generated and stored new author ID');
            } catch (storeError) {
                console.warn('Failed to store new author ID:', storeError);
                // Continue with the generated ID even if we couldn't store it
            }
        }

        return authorId;
    } catch (error) {
        console.error('Critical error in getSecureAuthorId:', error);
        // Ultimate fallback - generate a temporary ID
        return 'temp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8);
    }
};
