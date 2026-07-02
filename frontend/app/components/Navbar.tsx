"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

const THEME_KEY = "fm_theme";

function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem(THEME_KEY, next ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
    >
      {dark ? (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1.5M12 19.5V21M4.9 4.9l1.06 1.06M18.04 18.04l1.06 1.06M3 12h1.5M19.5 12H21M4.9 19.1l1.06-1.06M18.04 5.96l1.06-1.06M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        </svg>
      ) : (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 15.001A9.72 9.72 0 0118 15.75 9.75 9.75 0 018.25 6c0-1.33.266-2.598.748-3.752A9.753 9.753 0 003 11.25 9.75 9.75 0 0012.75 21a9.753 9.753 0 009-5.999z" />
        </svg>
      )}
    </button>
  );
}

export default function Navbar() {
  const { user, isLoggedIn, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu on navigation
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const linkClass = (href: string) =>
    `text-sm font-medium transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 ${
      pathname === href
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-gray-600 dark:text-gray-300"
    }`;

  const navLinks = (
    <>
      <Link href="/" className={linkClass("/")}>
        Home
      </Link>
      <Link href="/jobs" className={linkClass("/jobs")}>
        Browse Jobs
      </Link>
      {isLoggedIn && (
        <Link href="/dashboard" className={linkClass("/dashboard")}>
          Dashboard
        </Link>
      )}
    </>
  );

  const authButtons = isLoggedIn ? (
    <div className="flex items-center gap-3">
      <span className="hidden text-sm text-gray-500 dark:text-gray-400 lg:inline">
        {user?.email}
      </span>
      <button
        onClick={handleLogout}
        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-emerald-500 hover:text-emerald-600 dark:border-gray-700 dark:text-gray-200 dark:hover:border-emerald-400 dark:hover:text-emerald-400"
      >
        Logout
      </button>
    </div>
  ) : (
    <div className="flex items-center gap-3">
      <Link
        href="/auth/login"
        className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-emerald-600 dark:text-gray-200 dark:hover:text-emerald-400"
      >
        Login
      </Link>
      <Link
        href="/auth/signup"
        className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-transform hover:scale-105 hover:bg-emerald-600"
      >
        Sign Up
      </Link>
    </div>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-950/90">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-lg font-bold text-white">
            F
          </span>
          <span className="text-lg font-bold tracking-tight">FreelanceHub</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">{navLinks}</div>
        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {authButtons}
        </div>

        {/* Mobile hamburger */}
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-gray-100 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-950 md:hidden">
          <div className="flex flex-col gap-4">
            {navLinks}
            <div className="border-t border-gray-100 pt-4 dark:border-gray-800">
              {isLoggedIn && (
                <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
              )}
              {authButtons}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
