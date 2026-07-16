"use client";

import { useState, useEffect } from "react";
import { API_URL } from "./lib/api";

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);

    // The cookie (if any) is sent automatically — just ask the API who we are
    fetch(`${API_URL}/api/auth/me`, {
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.email) {
          setEmail(data.email);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Even if the request fails, still send the user home
    }
    window.location.href = "/";
  };

  const loggedIn = mounted && !!email;

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-[#2a2a2a] bg-[#0a0a0a]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="/" className="text-xl font-bold tracking-tight">
          Freelance<span className="text-orange-500">Hub</span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          <a href="/jobs" className="text-sm text-neutral-400 hover:text-white transition">
            Browse Jobs
          </a>
          {loggedIn && (
            <a href="/dashboard" className="text-sm text-neutral-400 hover:text-white transition">
              Dashboard
            </a>
          )}
        </div>

        <div className="flex items-center gap-4">
          {loggedIn ? (
            <>
              <span className="hidden sm:inline text-sm text-neutral-400">{email}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-neutral-400 hover:text-white transition"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <a href="/auth/login" className="text-sm text-neutral-400 hover:text-white transition">
                Log in
              </a>
              
                <a href="/auth/signup"
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition"
              >
                Sign Up
              </a>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}