"use client";

import { useEffect, useMemo, useState } from "react";
import { getApiError, getJobs } from "@/app/lib/api";
import type { Job } from "@/app/lib/types";
import JobCard from "@/app/components/JobCard";
import Spinner from "@/app/components/Spinner";
import { PageFade } from "@/app/components/motion";

const PAGE_SIZE = 9;

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    getJobs()
      .then(setJobs)
      .catch((err) => setError(getApiError(err)))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const min = minBudget === "" ? null : Number(minBudget);
    const max = maxBudget === "" ? null : Number(maxBudget);
    return jobs.filter((job) => {
      if (
        q &&
        !job.title.toLowerCase().includes(q) &&
        !job.description.toLowerCase().includes(q)
      ) {
        return false;
      }
      if (min !== null && !Number.isNaN(min) && job.budget < min) return false;
      if (max !== null && !Number.isNaN(max) && job.budget > max) return false;
      return true;
    });
  }, [jobs, search, minBudget, maxBudget]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageJobs = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [search, minBudget, maxBudget]);

  return (
    <PageFade>
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Browse Jobs
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {loading
              ? "Loading open jobs…"
              : `${filtered.length} open job${filtered.length === 1 ? "" : "s"} waiting for a great freelancer.`}
          </p>
        </div>

        {/* Search + filters */}
        <div className="mb-10 flex flex-col gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900 md:flex-row md:items-center">
          <div className="relative flex-1">
            <svg
              className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, description or skills…"
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition-colors focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={0}
              value={minBudget}
              onChange={(e) => setMinBudget(e.target.value)}
              placeholder="Min budget $"
              className="w-32 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
            />
            <span className="text-gray-400">–</span>
            <input
              type="number"
              min={0}
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
              placeholder="Max budget $"
              className="w-32 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
            />
          </div>
        </div>

        {loading && <Spinner label="Fetching jobs…" />}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-200 px-6 py-16 text-center text-gray-500 dark:border-gray-800 dark:text-gray-400">
            No jobs match your search. Try widening the filters.
          </div>
        )}

        {!loading && !error && pageJobs.length > 0 && (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {pageJobs.map((job, i) => (
                <JobCard key={job.id} job={job} index={i} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-emerald-500 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors ${
                      n === currentPage
                        ? "bg-emerald-500 text-white"
                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-emerald-500 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </PageFade>
  );
}
