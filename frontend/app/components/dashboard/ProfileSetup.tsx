"use client";

import { useState } from "react";
import {
  createClientProfile,
  createFreelancerProfile,
  getApiError,
} from "@/app/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import Spinner from "@/app/components/Spinner";
import { SlideUp } from "@/app/components/motion";

/**
 * Roles on the backend are implicit: a user is a client and/or a freelancer
 * depending on which profiles exist. This card lets a new user create them.
 */
export default function ProfileSetup() {
  const { isClient, isFreelancer, refreshProfiles } = useAuth();
  const [mode, setMode] = useState<"client" | "freelancer" | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isClient && isFreelancer) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (mode === "client") {
        await createClientProfile(companyName.trim());
      } else {
        const rate = hourlyRate === "" ? null : Number(hourlyRate);
        await createFreelancerProfile({
          bio: bio.trim(),
          skills: skills.trim(),
          hourly_rate: rate !== null && !Number.isNaN(rate) ? rate : null,
        });
      }
      await refreshProfiles();
      setMode(null);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100";

  return (
    <SlideUp>
      <div className="mb-8 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-6 dark:border-emerald-900 dark:bg-emerald-950/30">
        {!mode ? (
          <>
            <h2 className="font-bold text-gray-900 dark:text-white">
              {!isClient && !isFreelancer
                ? "How do you want to use FreelanceHub?"
                : "Add another role"}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {!isClient && !isFreelancer
                ? "Set up a profile to post jobs or start bidding. You can do both."
                : isClient
                  ? "You're set up as a client. Add a freelancer profile to bid on jobs too."
                  : "You're set up as a freelancer. Add a client profile to post jobs too."}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {!isClient && (
                <button
                  onClick={() => setMode("client")}
                  className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105 hover:bg-emerald-600"
                >
                  I&apos;m a client — I want to hire
                </button>
              )}
              {!isFreelancer && (
                <button
                  onClick={() => setMode("freelancer")}
                  className="rounded-xl border border-emerald-500 px-5 py-2.5 text-sm font-semibold text-emerald-600 transition-colors hover:bg-emerald-500 hover:text-white dark:text-emerald-400"
                >
                  I&apos;m a freelancer — I want to work
                </button>
              )}
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="font-bold text-gray-900 dark:text-white">
              {mode === "client" ? "Create your client profile" : "Create your freelancer profile"}
            </h2>
            {mode === "client" ? (
              <div>
                <label htmlFor="company" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Company name (optional)
                </label>
                <input
                  id="company"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Acme Inc."
                  className={inputClass}
                />
              </div>
            ) : (
              <>
                <div>
                  <label htmlFor="skills" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Skills (comma separated)
                  </label>
                  <input
                    id="skills"
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="Python, React, PostgreSQL"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="rate" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Hourly rate (USD)
                  </label>
                  <input
                    id="rate"
                    type="number"
                    min={0}
                    step="0.01"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    placeholder="75"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="bio" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell clients what you're great at…"
                    className={inputClass}
                  />
                </div>
              </>
            )}
            {error && (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
                {error}
              </p>
            )}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105 hover:bg-emerald-600 disabled:opacity-50"
              >
                {submitting ? <Spinner small label="Saving…" /> : "Create profile"}
              </button>
              <button
                type="button"
                onClick={() => setMode(null)}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </SlideUp>
  );
}
