import { supabase } from './supabaseClient';

export const startActivitySession = async (userId: string) => {
    const { data, error } = await supabase
        .from('user_sessions')
        .insert({
            user_id: userId,
            login_at: new Date().toISOString(),
            last_seen_at: new Date().toISOString(),
            user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
        })
        .select()
        .single();

    if (error) {
        console.error('Error starting activity session:', error);
        return null;
    }
    return data.id;
};

export const updateActivitySession = async (sessionId: number) => {
    const { error } = await supabase
        .from('user_sessions')
        .update({
            last_seen_at: new Date().toISOString()
        })
        .eq('id', sessionId);

    if (error) {
        console.error('Error updating activity session:', error);
    }
};
