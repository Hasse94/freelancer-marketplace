import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-sm font-bold text-white">
              F
            </span>
            <span className="font-semibold">FreelanceHub</span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            <Link href="/" className="hover:text-emerald-600 dark:hover:text-emerald-400">
              Home
            </Link>
            <Link href="/jobs" className="hover:text-emerald-600 dark:hover:text-emerald-400">
              Browse Jobs
            </Link>
            <Link href="/auth/signup" className="hover:text-emerald-600 dark:hover:text-emerald-400">
              Sign Up
            </Link>
            <Link href="/dashboard" className="hover:text-emerald-600 dark:hover:text-emerald-400">
              Dashboard
            </Link>
          </nav>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            © {new Date().getFullYear()} FreelanceHub. Built with FastAPI, Next.js &amp; Claude.
          </p>
        </div>
      </div>
    </footer>
  );
}
