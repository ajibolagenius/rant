import { useState, useEffect, useCallback } from "react";

interface UseSafeAsyncResult<T> {
    data: T | null;
    error: Error | null;
    loading: boolean;
    execute: () => Promise<void>;
}

/**
 * A hook for safely executing async operations with proper error handling
 */
export function useSafeAsync<T>(
    asyncFn: () => Promise<T>,
    dependencies: any[] = [],
    immediate: boolean = true
): UseSafeAsyncResult<T> {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState<boolean>(immediate);

    const execute = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await asyncFn();
            setData(result);
            return result;
        } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
            return null;
        } finally {
            setLoading(false);
        }
    }, [asyncFn, ...dependencies]);

    useEffect(() => {
        if (immediate) {
            execute();
        }
    }, [execute, immediate]);

    return { data, error, loading, execute };
}
