import { toast } from "@/hooks/use-toast";

/**
 * Safely gets author ID with fallback
 * @param getAuthorIdFn Function to get author ID
 * @returns Author ID or fallback value
 */
export function getSafeAuthorId(getAuthorIdFn: () => string | null): string {
    try {
        const authorId = getAuthorIdFn();
        if (!authorId) {
            console.warn("Author ID is missing, using anonymous");
            return "anonymous";
        }
        return authorId;
    } catch (error) {
        console.error("Failed to get author ID:", error);
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
export function showErrorToast(error: any, userMessage: string = "Something went wrong") {
    console.error("Error:", error);

    toast({
        title: "Error",
        description: userMessage,
        variant: "destructive",
    });
}

/**
 * Handles Supabase errors with appropriate user feedback
 */
export function handleSupabaseError(error: any): string {
    if (!error) return "Unknown error occurred";

    // Handle specific error codes
    if (error.code === "PGRST301") {
        return "Database connection error. Please try again later.";
    }

    if (error.message?.includes("JWT")) {
        return "Your session has expired. Please sign in again.";
    }

    if (error.message?.includes("network")) {
        return "Network error. Please check your connection.";
    }

    // Default message
    return error.message || "An unexpected error occurred";
}
