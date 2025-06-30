import { toast } from "@/hooks/use-toast";

/**
 * Safely gets anonymous user ID with fallback
 * @param getAnonymousUserIdFn Function to get anonymous user ID
 * @returns Anonymous user ID or fallback value
 */
export function getSafeAnonymousUserId(getAnonymousUserIdFn: () => string | null): string {
    try {
        const anonymousUserId = getAnonymousUserIdFn();
        if (!anonymousUserId) {
            console.warn("Anonymous user ID is missing, using anonymous");
            return "anonymous";
        }
        return anonymousUserId;
    } catch (error) {
        console.error("Failed to get anonymous user ID:", error);
        return "anonymous";
    }
}

/**
 * Safely handles mood values
 * @param mood The mood value to check
 * @returns Safe mood value or default
 */
export function getSafeMood(mood: string | null | undefined): string {
    if (!mood) {
        return "neutral";
    }

    const validMoods = ["happy", "sad", "angry", "surprised", "neutral"];
    return validMoods.includes(mood) ? mood : "neutral";
}

/**
 * Shows error toast with user-friendly message
 */
export function showErrorToast(error: unknown, userMessage: string = "Something went wrong") {
    if (process.env.NODE_ENV !== 'production') {
        console.error("Error:", error);
    }
    toast({
        title: "Error",
        description: userMessage,
        variant: "destructive",
    });
}

/**
 * Handles Supabase errors with appropriate user feedback
 */
export function handleSupabaseError(error: unknown): string {
    if (!error) return "Unknown error occurred";
    if (typeof error === 'object' && error !== null && 'code' in error) {
        // Handle specific error codes
        if (error.code === "PGRST301") {
            return "Database connection error. Please try again later.";
        }

        if (error.message?.includes("JWT")) {
            return "Your session has expired. Please sign in again.";
        }
    }
    if (error instanceof Error) {
        if (error.message?.includes("network")) {
            return "Network error. Please check your connection.";
        }
        return error.message;
    }
    return (typeof error === 'string' ? error : 'An unexpected error occurred');
}
