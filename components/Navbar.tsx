"use client";

import { User } from 'firebase/auth';
import { LogOut, User as UserIcon } from 'lucide-react';

interface NavbarProps {
    user: User | null;
    onLogin: () => void;
    onLogout: () => void;
}

export default function Navbar({ user, onLogin, onLogout }: NavbarProps) {
    return (
        <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center gap-2">
                        <div className="bg-blue-600 text-white p-2 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" /></svg>
                        </div>
                        <span className="font-bold text-xl text-blue-600">
                            InvoiceGPT
                        </span>
                    </div>

                    {/* User Actions */}
                    <div>
                        {user ? (
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-sm font-medium text-black bg-gray-100 px-3 py-1.5 rounded-full">
                                    {user.photoURL ? (
                                        <img src={user.photoURL} alt={user.displayName || 'User'} className="w-6 h-6 rounded-full" />
                                    ) : (
                                        <UserIcon size={16} />
                                    )}
                                    <span className="hidden sm:inline">{user.displayName}</span>
                                </div>
                                <button
                                    onClick={onLogout}
                                    className="text-gray-500 hover:text-red-600 transition p-2 rounded-full hover:bg-red-50 cursor-pointer"
                                    title="Sign Out"
                                >
                                    <LogOut size={20} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={onLogin}
                                className="bg-black cursor-pointer text-white px-5 py-2 rounded-full font-medium hover:bg-gray-800 transition shadow-lg shadow-gray-200"
                            >
                                Sign In
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
