"use client";

import { useState, useEffect } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from './firebase';

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auth) {
            setLoading(false);
            return;
        }
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            console.log("Auth State Changed:", user ? "User Logged In" : "User Logged Out", user?.email);
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async () => {
        if (!auth || !googleProvider) {
            alert("Firebase not configured. Please check your .env.local file.");
            return;
        }
        try {
            console.log("Attempting login...");
            await signInWithPopup(auth, googleProvider);
            console.log("Login successful");
        } catch (error) {
            console.error("Login failed", error);
            alert("Login failed: " + (error as any).message);
        }
    };

    const logout = async () => {
        if (!auth) return;
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return { user, loading, login, logout };
}
