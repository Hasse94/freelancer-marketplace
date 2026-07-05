"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { API_URL } from "../lib/api";

interface Job {
  id: number;
  client_id: number;
  title: string;
  description: string;
  budget: number;
  deadline: string | null;
  is_open: boolean;
  created_at: string;
}

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch(`${API_URL}/api/jobs/`);
      const data = await res.json();
      setJobs(data);
    } catch {
      setError("Cannot reach the API. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const filtered = jobs.filter((job) => {
    const matchesSearch =
      !search ||
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.description.toLowerCase().includes(search.toLowerCase());

    const matchesMin = !minBudget || job.budget >= Number(minBudget);
    const matchesMax = !maxBudget || job.budget <= Number(maxBudget);

    return matchesSearch && matchesMin && matchesMax;
  });

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="min-h-screen px-6 py-20">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-2">Browse Jobs</h1>
          <p className="text-neutral-400 mb-8">
            {filtered.length} open {filtered.length === 1 ? "job" : "jobs"} waiting for a great freelancer.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col md:flex-row gap-4 mb-10"
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or description..."
            className="flex-1 px-4 py-3 bg-[#1a1a1a] border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500 transition"
          />
          <div className="flex gap-3">
            <input
              type="number"
              value={minBudget}
              onChange={(e) => setMinBudget(e.target.value)}
              placeholder="Min $"
              className="w-28 px-4 py-3 bg-[#1a1a1a] border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500 transition"
            />
            <span className="text-neutral-600 self-center">—</span>
            <input
              type="number"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
              placeholder="Max $"
              className="w-28 px-4 py-3 bg-[#1a1a1a] border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500 transition"
            />
          </div>
        </motion.div>

        {loading && (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-neutral-400">Loading jobs...</p>
          </div>
        )}

        {error && (
          <div className="px-6 py-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm mb-8">
            {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-neutral-500 text-lg">No jobs match your search.</p>
            <p className="text-neutral-600 text-sm mt-2">Try different keywords or clear the filters.</p>
          </div>
        )}

        <div className="grid gap-4">
          {filtered.map((job, i) => (
            <motion.a
              key={job.id}
              href={`/jobs/${job.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="block p-6 bg-[#1a1a1a] border border-neutral-800 rounded-xl hover:border-orange-500/50 transition group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold group-hover:text-orange-500 transition mb-2">
                    {job.title}
                  </h3>
                  <p className="text-neutral-400 text-sm leading-relaxed line-clamp-2">
                    {job.description}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-orange-500 font-bold text-lg">${job.budget.toLocaleString()}</p>
                  <p className="text-neutral-600 text-xs mt-1">{timeAgo(job.created_at)}</p>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  );
}
