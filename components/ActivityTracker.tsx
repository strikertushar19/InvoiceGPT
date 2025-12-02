"use client";

import { useEffect, useRef } from 'react';
import { useAuth } from '../lib/useAuth';
import { startActivitySession, updateActivitySession } from '../lib/activityService';

export default function ActivityTracker() {
    const { user, loading } = useAuth();
    const sessionIdRef = useRef<number | null>(null);

    useEffect(() => {
        if (loading || !user) return;

        const initSession = async () => {
            // Check if we already have a session ID in sessionStorage to avoid duplicates on refresh
            const storedSessionId = sessionStorage.getItem('activity_session_id');

            if (storedSessionId) {
                sessionIdRef.current = parseInt(storedSessionId);
                // Update immediately to confirm it's active
                await updateActivitySession(sessionIdRef.current);
            } else {
                // Start new session
                const newSessionId = await startActivitySession(user.uid);
                if (newSessionId) {
                    sessionIdRef.current = newSessionId;
                    sessionStorage.setItem('activity_session_id', String(newSessionId));
                }
            }
        };

        initSession();

        // Heartbeat every 1 minute
        const intervalId = setInterval(() => {
            if (sessionIdRef.current) {
                updateActivitySession(sessionIdRef.current);
            }
        }, 60 * 1000);

        return () => {
            clearInterval(intervalId);
        };
    }, [user, loading]);

    // Clear session storage on logout (when user becomes null but was previously there)
    useEffect(() => {
        if (!loading && !user) {
            sessionStorage.removeItem('activity_session_id');
            sessionIdRef.current = null;
        }
    }, [user, loading]);

    return null; // This component renders nothing
}
