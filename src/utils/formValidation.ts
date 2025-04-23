import { z } from "zod";
import { toast } from "@/hooks/use-toast";

/**
 * Validates a rant form submission
 */
export const rantSchema = z.object({
    content: z.string()
        .min(1, "Rant content is required")
        .max(280, "Rant must be 280 characters or less"),
    mood: z.string()
        .min(1, "Mood is required")
        .default("neutral"),
    anonymous_user_id: z.string()
        .min(1, "Author ID is required")
        .default("anonymous"),
});

/**
 * Type for a validated rant
 */
export type ValidatedRant = z.infer<typeof rantSchema>;

/**
 * Validates rant data with error handling
 * @returns Validated data or null if validation fails
 */
export function validateRantData(data: unknown): ValidatedRant | null {
    try {
        return rantSchema.parse(data);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessage = error.errors.map(err => err.message).join(", ");
            toast({
                title: "Validation Error",
                description: errorMessage,
                variant: "destructive",
            });
        } else {
            toast({
                title: "Error",
                description: "Invalid rant data",
                variant: "destructive",
            });
        }
        return null;
    }
}

/**
 * Safely validates and processes form data
 */
export async function safeFormSubmit<T>(
    data: unknown,
    schema: z.ZodSchema<T>,
    onSuccess: (validData: T) => Promise<void>,
    onError?: (error: Error) => void
): Promise<boolean> {
    try {
        const validData = schema.parse(data);
        await onSuccess(validData);
        return true;
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessage = error.errors.map(err => err.message).join(", ");
            toast({
                title: "Validation Error",
                description: errorMessage,
                variant: "destructive",
            });
        } else if (onError && error instanceof Error) {
            onError(error);
        } else {
            toast({
                title: "Error",
                description: "An unexpected error occurred",
                variant: "destructive",
            });
        }
        return false;
    }
}
