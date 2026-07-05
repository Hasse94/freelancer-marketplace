"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Invalid email or password");
        return;
      }

      localStorage.setItem("token", data.access_token);
      window.location.href = "/dashboard";
    } catch {
      setError("Cannot reach the server. Is the API running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
        <p className="text-neutral-400 mb-8">Log in to your FreelanceHub account.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm text-neutral-400 block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500 transition"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="text-sm text-neutral-400 block mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500 transition"
              placeholder="Your password"
            />
          </div>

          {error && (
            <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold rounded-lg transition transform hover:scale-[1.02]"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="text-neutral-500 text-sm text-center mt-6">
          No account yet?{" "}
          <a href="/auth/signup" className="text-orange-500 hover:underline">Sign up</a>
        </p>
      </motion.div>
    </div>
  );
}
