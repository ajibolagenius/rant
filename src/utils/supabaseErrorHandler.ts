import { PostgrestError } from "@supabase/supabase-js";
import { toast } from "@/hooks/use-toast";

/**
 * Maps Supabase error codes to user-friendly messages
 */
const errorMessages: Record<string, string> = {
    "PGRST301": "Database connection error. Please try again later.",
    "PGRST302": "Database query error. Please try again.",
    "23505": "This item already exists.",
    "23503": "This operation references a missing item.",
    "23514": "The data doesn't meet the requirements.",
    "42P01": "The requested resource doesn't exist.",
    "42501": "You don't have permission to perform this action.",
    "JWSError": "Your session has expired. Please sign in again.",
    "default": "An unexpected error occurred. Please try again."
};

/**
 * Handles Supabase errors and returns user-friendly messages
 */
export function handleSupabaseError(error: PostgrestError | null | unknown): string {
    if (!error) return errorMessages.default;

    // Handle PostgrestError
    if (typeof error === 'object' && error !== null && 'code' in error) {
        const pgError = error as PostgrestError;

        // Check for specific error codes
        if (pgError.code && errorMessages[pgError.code]) {
            return errorMessages[pgError.code];
        }

        // Check for JWT errors
        if (pgError.message && pgError.message.includes("JWT")) {
            return errorMessages.JWSError;
        }

        // Return the error message if available
        return pgError.message || errorMessages.default;
    }

    // Handle network errors
    if (error instanceof Error) {
        if (error.message.includes("network") || error.message.includes("fetch")) {
            return "Network error. Please check your connection.";
        }
        return error.message;
    }

    return errorMessages.default;
}

/**
 * Wraps a Supabase query with error handling
 * @param queryFn Function that performs the Supabase query
 * @param errorHandler Optional custom error handler
 * @returns Promise with data and error
 */
export async function safeSupabaseQuery<T>(
    queryFn: () => Promise<{ data: T | null; error: PostgrestError | null }>,
    errorHandler?: (error: any) => void
): Promise<{ data: T | null; error: string | null }> {
    try {
        const { data, error } = await queryFn();

        if (error) {
            const errorMessage = handleSupabaseError(error);

            if (errorHandler) {
                errorHandler(error);
            } else {
                // Default error handling with toast
                toast({
                    title: "Error",
                    description: errorMessage,
                    variant: "destructive",
                });
            }

            return { data: null, error: errorMessage };
        }

        return { data, error: null };
    } catch (err) {
        const errorMessage = handleSupabaseError(err);

        if (errorHandler) {
            errorHandler(err);
        } else {
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        }

        return { data: null, error: errorMessage };
    }
}
