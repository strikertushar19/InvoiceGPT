"use client";

import { useAuth } from '../lib/useAuth';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LandingPage from '../components/LandingPage';
import Dashboard from '../components/Dashboard';

export default function Home() {
  const { user, loading, login, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <Navbar user={user} onLogin={login} onLogout={logout} />

      <main className="flex-grow">
        {user ? <Dashboard onLogout={logout} /> : <LandingPage onLogin={login} />}
      </main>

      {!user && <Footer />}
    </div>
  );
}
