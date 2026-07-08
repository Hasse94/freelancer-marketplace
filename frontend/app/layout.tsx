import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./Navbar";

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
      <body className="min-h-screen bg-[#0a0a0a] text-white antialiased" suppressHydrationWarning>
       <Navbar />
        <main className="pt-16">
          {children}
        </main>
      </body>
    </html>
  );
}