import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FreelanceHub",
  description: "AI-powered freelancer marketplace",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0a0a0a] text-white antialiased">
        <nav className="fixed top-0 w-full z-50 border-b border-[#2a2a2a] bg-[#0a0a0a]/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <a href="/" className="text-xl font-bold tracking-tight">
              Freelance<span className="text-orange-500">Hub</span>
            </a>
            <div className="hidden md:flex items-center gap-8">
              <a href="/jobs" className="text-sm text-neutral-400 hover:text-white transition">Browse Jobs</a>
              <a href="/dashboard" className="text-sm text-neutral-400 hover:text-white transition">Dashboard</a>
            </div>
            <div className="flex items-center gap-4">
              <a href="/auth/login" className="text-sm text-neutral-400 hover:text-white transition">Log in</a>
              <a href="/auth/signup" className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition">
                Sign Up
              </a>
            </div>
          </div>
        </nav>
        <main className="pt-16">
          {children}
        </main>
      </body>
    </html>
  );
}