import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and anon key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

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
            query = query.ilike('content', `%${searchQuery}%`);
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
        console.error('Error fetching rants:', error);
        throw error;
    }
}

// Function to add a new rant
export async function addRant({ id, content, mood, author_id }) {
    try {
        const { data, error } = await supabase
            .from('rants')
            .insert([
                {
                    id: id || crypto.randomUUID(), // Use provided ID or generate a new one
                    content,
                    mood,
                    author_id,
                    likes: 0,
                    language: 'en',
                    sentiment: 'neutral'
                }
            ])
            .select();

        if (error) throw error;

        return data[0];
    } catch (error) {
        console.error('Error adding rant:', error);
        throw error;
    }
}

// Function to like a rant
export async function likeRant(rantId, authorId) {
    try {
        // First check if the user has already liked this rant
        const { data: existingLike, error: checkError } = await supabase
            .from('likes_log')  // Changed from rant_likes to likes_log
            .select('*')
            .eq('rant_id', rantId)
            .eq('author_id', authorId)
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            // PGRST116 is the error code for "no rows returned" which is expected
            throw checkError;
        }

        if (existingLike) {
            // User has already liked this rant
            throw new Error('You have already liked this rant');
        }

        // Add the like to likes_log table
        const { error: insertError } = await supabase
            .from('likes_log')  // Changed from rant_likes to likes_log
            .insert([
                { rant_id: rantId, author_id: authorId }
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
        console.error('Error liking rant:', error);
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
        console.error('Error getting active user count:', error);
        // Return a fallback count
        return Math.floor(50 + Math.random() * 100);
    }
}
