import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/types/database.types.ts';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for common operations
export const fetchRants = async (options: {
    limit?: number,
    offset?: number,
    sortBy?: string,
    moods?: string[],
    searchQuery?: string
} = {}) => {
    const { limit = 10, offset = 0, sortBy = 'created_at', moods = [], searchQuery = '' } = options;

    let query = supabase
        .from('rants')
        .select('*');

    // Apply mood filter if provided
    if (moods.length > 0) {
        query = query.in('mood', moods);
    }

    // Apply search filter if provided
    if (searchQuery) {
        query = query.ilike('content', `%${searchQuery}%`);
    }

    // Apply sorting
    if (sortBy === 'popular') {
        query = query.order('likes', { ascending: false });
    } else {
        query = query.order('created_at', { ascending: false });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching rants:', error);
        throw error;
    }

    return data;
};

export const addRant = async (rant: {
    content: string,
    mood: string,
    author_id: string,
    language?: string
}) => {
    const { data, error } = await supabase
        .from('rants')
        .insert([rant])
        .select();

    if (error) {
        console.error('Error adding rant:', error);
        throw error;
    }

    return data?.[0];
};

export const likeRant = async (rantId: string, authorId: string) => {
    // First, update the rant's like count
    const { error: updateError } = await supabase
        .from('rants')
        .update({ likes: supabase.rpc('increment', { x: 1 }) })
        .eq('id', rantId);

    if (updateError) {
        console.error('Error updating like count:', updateError);
        throw updateError;
    }

    // Then, log the like action
    const { error: logError } = await supabase
        .from('likes_log')
        .insert([{ rant_id: rantId, author_id: authorId }]);

    if (logError) {
        console.error('Error logging like:', logError);
        throw logError;
    }

    return true;
};
