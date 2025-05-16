import { createClient } from '@supabase/supabase-js';
import { logError } from "@/utils/supabaseErrorHandler";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Add logging to verify Supabase client initialization
// console.log('Supabase URL:', supabaseUrl);
// console.log('Supabase Anon Key:', supabaseAnonKey);

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to fetch rants with various filters
export async function fetchRants({
    limit = 20,
    offset = 0,
    sortBy = 'latest',
    moods = [],
    searchQuery = '',
    searchMood = null
}) {
    try {
        let query = supabase
            .from('rants')
            .select('*');

        // Apply sorting
        if (sortBy === 'popular') {
            query = query.order('likes', { ascending: false });
        } else {
            query = query.order('created_at', { ascending: false });
        }

        // Apply mood filtering
        if (moods && moods.length > 0) {
            query = query.in('mood', moods);
        }

        // Apply search query
        if (searchQuery) {
            // Use full-text search instead of ilike for fuzzy search
            query = query.textSearch('content', searchQuery, { type: 'plain' });
        }

        // Apply mood search
        if (searchMood) {
            query = query.eq('mood', searchMood);
        }

        // Apply pagination
        query = query.range(offset, offset + limit - 1);

        const { data, error } = await query;

        if (error) throw error;

        return data || [];
    } catch (error) {
        logError('Error fetching rants', error);
        throw error;
    }
}

// Function to add a new rant
export async function addRant({ id, content, mood, anonymous_user_id }) {
    try {
        const { data, error } = await supabase
            .from('rants')
            .insert([
                {
                    id: id || crypto.randomUUID(), // Use provided ID or generate a new one
                    content,
                    mood,
                    anonymous_user_id,
                    likes: 0,
                    language: 'en',
                    sentiment: 'neutral'
                }
            ])
            .select();

        if (error) throw error;
        const newRant = data[0];
        return newRant;
    } catch (error) {
        logError('Error adding rant', error);
        throw error;
    }
}

// Function to like a rant
export async function likeRant(rantId, authorId) {
    try {
        // Ensure the anonymous_user_id exists in the anonymous_users table
        const { data: userExists, error: userCheckError } = await supabase
            .from('anonymous_users')
            .select('id')
            .eq('id', authorId)
            .single();

        if (userCheckError && userCheckError.code !== 'PGRST116') {
            throw userCheckError;
        }

        if (!userExists) {
            const { error: userInsertError } = await supabase
                .from('anonymous_users')
                .insert([{ id: authorId }]);

            if (userInsertError) throw userInsertError;
        }

        // First check if the user has already liked this rant
        const { data: existingLike, error: checkError } = await supabase
            .from('likes')  // Changed from likes_log to likes
            .select('*')
            .eq('rant_id', rantId)
            .eq('anonymous_user_id', authorId)
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            // PGRST116 is the error code for "no rows returned" which is expected
            throw checkError;
        }

        if (existingLike) {
            // User has already liked this rant
            throw new Error('You have already liked this rant');
        }

        // Add the like to likes table
        const { error: insertError } = await supabase
            .from('likes')  // Changed from likes_log to likes
            .insert([
                { rant_id: rantId, anonymous_user_id: authorId }
            ]);

        if (insertError) throw insertError;

        // Increment the likes count in the rants table
        const { data: rant, error: fetchError } = await supabase
            .from('rants')
            .select('likes')
            .eq('id', rantId)
            .single();

        if (fetchError) throw fetchError;

        const currentLikes = rant?.likes || 0;

        const { error: updateError } = await supabase
            .from('rants')
            .update({ likes: currentLikes + 1 })
            .eq('id', rantId);

        if (updateError) throw updateError;

        return true;
    } catch (error) {
        logError('Error liking rant', error);
        throw error;
    }
}

// Function to get the count of active users (approximation)
export async function getActiveUserCount() {
    try {
        // Get count of distinct author_ids from recent rants (last 24 hours)
        const { count, error } = await supabase
            .from('rants')
            .select('author_id', { count: 'exact', head: true })
            .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        if (error) throw error;

        // Add some randomness to make it feel more dynamic
        const baseCount = count || 10;
        const randomFactor = Math.random() * 0.4 + 0.8; // Between 0.8 and 1.2

        return Math.floor(baseCount * randomFactor);
    } catch (error) {
        logError('Error getting active user count', error);
        // Return a fallback count
        return Math.floor(50 + Math.random() * 100);
    }
}

// Add logging for debugging Supabase API requests
export async function logSupabaseRequest(endpoint, method, payload) {
    console.log(`Supabase Request - Endpoint: ${endpoint}, Method: ${method}`);
    console.log('Payload:', payload);
}
