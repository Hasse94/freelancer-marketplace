"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { getApiError } from "@/app/lib/api";
import Spinner from "@/app/components/Spinner";
import { AuthCard, AuthError, AuthInput } from "@/app/components/AuthCard";

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      await signup(email.trim(), password);
      router.push("/dashboard");
    } catch (err) {
      setError(getApiError(err));
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Create your account"
      subtitle={
        <>
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">
            Login
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
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
        />
        <AuthInput
          id="confirm"
          label="Confirm password"
          type="password"
          required
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Repeat your password"
        />
        {error && <AuthError message={error} />}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-emerald-500 py-3 font-semibold text-white transition-all hover:scale-[1.02] hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? <Spinner small label="Creating account…" /> : "Sign Up"}
        </button>
      </form>
      <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500">
        After signing up you&apos;ll choose whether to work as a client, a freelancer, or both.
      </p>
    </AuthCard>
  );
}
