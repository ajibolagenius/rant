import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { PostgrestError } from "@supabase/supabase-js";

interface UseSupabaseQueryResult<T> {
    data: T | null;
    error: PostgrestError | Error | null;
    loading: boolean;
    refetch: () => Promise<void>;
}

export function useSupabaseQuery<T>(
    tableName: string,
    queryFn: (query: any) => any,
    dependencies: any[] = []
): UseSupabaseQueryResult<T> {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<PostgrestError | Error | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Start with the base query
            const query = supabase.from(tableName);

            // Apply the query function to customize the query
            const { data: result, error: queryError } = await queryFn(query);

            if (queryError) {
                setError(queryError);
                return;
            }

            setData(result as T);
        } catch (err) {
            setError(err instanceof Error ? err : new Error("An unknown error occurred"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, dependencies);

    return { data, error, loading, refetch: fetchData };
}
