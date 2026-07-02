import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/app/context/AuthContext";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export const metadata: Metadata = {
  title: "FreelanceHub — Hire Freelancers. Get Work Done.",
  description:
    "A freelancer marketplace with AI-powered matching: post jobs, submit bids, get paid.",
};

// Applies the saved theme before first paint to avoid a light-mode flash
const themeScript = `
try {
  if (localStorage.getItem("fm_theme") === "dark") {
    document.documentElement.classList.add("dark");
  }
} catch {}
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-white text-gray-800 antialiased dark:bg-gray-950 dark:text-gray-100">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
