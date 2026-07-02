"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { getApiError } from "@/app/lib/api";
import Spinner from "@/app/components/Spinner";
import { AuthCard, AuthError, AuthInput } from "@/app/components/AuthCard";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      router.push("/dashboard");
    } catch (err) {
      setError(getApiError(err));
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Welcome back"
      subtitle={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthInput
          id="email"
          label="Email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        <AuthInput
          id="password"
          label="Password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
        {error && <AuthError message={error} />}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-emerald-500 py-3 font-semibold text-white transition-all hover:scale-[1.02] hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? <Spinner small label="Logging in…" /> : "Login"}
        </button>
      </form>
    </AuthCard>
  );
}
