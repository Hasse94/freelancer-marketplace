"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { API_URL } from "../lib/api";

interface Job {
  id: number;
  title: string;
  description: string;
  budget: number;
  is_open: boolean;
  created_at: string;
}

interface Bid {
  id: number;
  job_id: number;
  freelancer_id: number;
  proposal: string;
  bid_amount: number;
  is_accepted: boolean;
  created_at: string;
}

interface Payment {
  id: number;
  bid_id: number;
  client_id: number;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
}

type Tab = "jobs" | "bids" | "payments";

export default function Dashboard() {
  const [tab, setTab] = useState<Tab>("jobs");
  const [bidCounts, setBidCounts] = useState<Record<number, number>>({});
  const [jobs, setJobs] = useState<Job[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // profile state
  const [hasClient, setHasClient] = useState(false);
  const [hasFreelancer, setHasFreelancer] = useState(false);

  // which profile form is open: "client" | "freelancer" | null
  const [profileForm, setProfileForm] = useState<"client" | "freelancer" | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [skills, setSkills] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [bio, setBio] = useState("");
  const [profileError, setProfileError] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // post job form
  const [showJobForm, setShowJobForm] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [jobBudget, setJobBudget] = useState("");
  const [jobError, setJobError] = useState("");
  const [posting, setPosting] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      window.location.href = "/auth/login";
      return;
    }
    fetchData();
  }, []);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchData = async () => {
    try {
      const meRes = await fetch(`${API_URL}/api/auth/me`, { headers });
      if (!meRes.ok) {
        localStorage.removeItem("token");
        window.location.href = "/auth/login";
        return;
      }
      const me = await meRes.json();
      setEmail(me.email);

      // check which profiles exist
      const [clientRes, freelancerRes] = await Promise.all([
        fetch(`${API_URL}/api/users/client/me`, { headers }).catch(() => null),
        fetch(`${API_URL}/api/users/freelancer/me`, { headers }).catch(() => null),
      ]);
      setHasClient(!!clientRes?.ok);
      setHasFreelancer(!!freelancerRes?.ok);

      const [jobsRes, bidsRes, paymentsRes] = await Promise.all([
        fetch(`${API_URL}/api/jobs/my/jobs`, { headers }).catch(() => null),
        fetch(`${API_URL}/api/bids/my/bids`, { headers }).catch(() => null),
        fetch(`${API_URL}/api/payments/history`, { headers }).catch(() => null),
      ]);

      if (jobsRes?.ok) {
        const jobsData: Job[] = await jobsRes.json();
        setJobs(jobsData);

        // count bids on each of my jobs
        const counts: Record<number, number> = {};
        await Promise.all(
          jobsData.map(async (job) => {
            try {
              const r = await fetch(`${API_URL}/api/bids/job/${job.id}`, { headers });
              if (r.ok) {
                const jobBids = await r.json();
                counts[job.id] = jobBids.length;
              }
            } catch {}
          })
        );
        setBidCounts(counts);
      }
      if (bidsRes?.ok) setBids(await bidsRes.json());
      if (paymentsRes?.ok) setPayments(await paymentsRes.json());
    } catch {
      setError("Cannot reach the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setSavingProfile(true);
    try {
      const res = await fetch(`${API_URL}/api/users/client`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ company_name: companyName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setProfileError(data.detail || "Could not create client profile.");
        return;
      }
      setCompanyName("");
      setProfileForm(null);
      setHasClient(true);
    } catch {
      setProfileError("Cannot reach the server.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCreateFreelancer = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setSavingProfile(true);
    try {
      const res = await fetch(`${API_URL}/api/users/freelancer`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          skills,
          hourly_rate: parseFloat(hourlyRate),
          bio,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setProfileError(data.detail || "Could not create freelancer profile.");
        return;
      }
      setSkills("");
      setHourlyRate("");
      setBio("");
      setProfileForm(null);
      setHasFreelancer(true);
    } catch {
      setProfileError("Cannot reach the server.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setJobError("");
    setPosting(true);
    try {
      const res = await fetch(`${API_URL}/api/jobs/`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          title: jobTitle,
          description: jobDesc,
          budget: parseFloat(jobBudget),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setJobError(data.detail || "Failed to post job.");
        return;
      }
      setJobTitle("");
      setJobDesc("");
      setJobBudget("");
      setShowJobForm(false);
      await fetchData();
    } catch {
      setJobError("Cannot reach the server.");
    } finally {
      setPosting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "jobs", label: "My Jobs", count: jobs.length },
    { key: "bids", label: "My Bids", count: bids.length },
    { key: "payments", label: "Payments", count: payments.length },
  ];

  return (
    <div className="min-h-screen px-6 py-20">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-10"
        >
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-neutral-400 mt-1">{email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 border border-neutral-700 hover:border-red-500 text-neutral-400 hover:text-red-400 rounded-lg text-sm transition"
          >
            Log out
          </button>
        </motion.div>

        {error && (
          <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm mb-6">
            {error}
          </div>
        )}

        {/* Profile setup — shows role cards for whichever profile is missing */}
        {(!hasClient || !hasFreelancer) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mb-8 p-6 bg-[#1a1a1a] border border-neutral-800 rounded-xl"
          >
            <h2 className="text-lg font-semibold mb-1">Set up your profile</h2>
            <p className="text-neutral-400 text-sm mb-5">
              Add a role to start using FreelanceHub. You can be both.
            </p>

            {profileError && (
              <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm mb-4">
                {profileError}
              </div>
            )}

            {/* role choice cards */}
            {profileForm === null && (
              <div className="grid md:grid-cols-2 gap-4">
                {!hasClient && (
                  <button
                    onClick={() => { setProfileForm("client"); setProfileError(""); }}
                    className="p-5 text-left rounded-xl bg-[#0a0a0a] border border-neutral-800 hover:border-orange-500/50 transition group"
                  >
                    <h3 className="font-semibold mb-1 group-hover:text-orange-500 transition">I want to hire</h3>
                    <p className="text-neutral-400 text-sm">Create a client profile and post jobs.</p>
                  </button>
                )}
                {!hasFreelancer && (
                  <button
                    onClick={() => { setProfileForm("freelancer"); setProfileError(""); }}
                    className="p-5 text-left rounded-xl bg-[#0a0a0a] border border-neutral-800 hover:border-orange-500/50 transition group"
                  >
                    <h3 className="font-semibold mb-1 group-hover:text-orange-500 transition">I want to work</h3>
                    <p className="text-neutral-400 text-sm">Create a freelancer profile and submit bids.</p>
                  </button>
                )}
              </div>
            )}

            {/* client form */}
            {profileForm === "client" && (
              <form onSubmit={handleCreateClient} className="space-y-4">
                <div>
                  <label className="text-sm text-neutral-400 block mb-2">Company name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500 transition"
                    placeholder="e.g. BrightLoop Inc."
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition"
                  >
                    {savingProfile ? "Saving..." : "Create client profile"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfileForm(null)}
                    className="px-5 py-2.5 border border-neutral-700 text-neutral-400 hover:text-white text-sm rounded-lg transition"
                  >
                    Back
                  </button>
                </div>
              </form>
            )}

            {/* freelancer form */}
            {profileForm === "freelancer" && (
              <form onSubmit={handleCreateFreelancer} className="space-y-4">
                <div>
                  <label className="text-sm text-neutral-400 block mb-2">Skills</label>
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500 transition"
                    placeholder="e.g. React, TypeScript, FastAPI"
                  />
                </div>
                <div>
                  <label className="text-sm text-neutral-400 block mb-2">Hourly rate ($)</label>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500 transition"
                    placeholder="e.g. 50"
                  />
                </div>
                <div>
                  <label className="text-sm text-neutral-400 block mb-2">Short bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    required
                    rows={3}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500 transition resize-none"
                    placeholder="A sentence or two about your experience..."
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition"
                  >
                    {savingProfile ? "Saving..." : "Create freelancer profile"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfileForm(null)}
                    className="px-5 py-2.5 border border-neutral-700 text-neutral-400 hover:text-white text-sm rounded-lg transition"
                  >
                    Back
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        )}

        {/* Tabs + Post a Job button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex gap-1 bg-[#1a1a1a] p-1 rounded-xl">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition ${
                  tab === t.key
                    ? "bg-orange-500 text-white"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {t.label}
                {t.count > 0 && (
                  <span className={`ml-2 text-xs ${tab === t.key ? "text-orange-200" : "text-neutral-600"}`}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {tab === "jobs" && hasClient && (
            <button
              onClick={() => setShowJobForm(!showJobForm)}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition"
            >
              {showJobForm ? "Cancel" : "+ Post a Job"}
            </button>
          )}
        </motion.div>

        {/* Post Job Form */}
        {showJobForm && tab === "jobs" && hasClient && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-[#1a1a1a] border border-neutral-800 rounded-xl mb-6"
          >
            <h2 className="text-lg font-semibold mb-4">Post a new job</h2>
            <form onSubmit={handlePostJob} className="space-y-4">
              <div>
                <label className="text-sm text-neutral-400 block mb-2">Job title</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500 transition"
                  placeholder="e.g. Build a landing page"
                />
              </div>
              <div>
                <label className="text-sm text-neutral-400 block mb-2">Description</label>
                <textarea
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  required
                  rows={4}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500 transition resize-none"
                  placeholder="Describe what you need built..."
                />
              </div>
              <div>
                <label className="text-sm text-neutral-400 block mb-2">Budget ($)</label>
                <input
                  type="number"
                  value={jobBudget}
                  onChange={(e) => setJobBudget(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500 transition"
                  placeholder="Your budget"
                />
              </div>

              {jobError && (
                <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {jobError}
                </div>
              )}

              <button
                type="submit"
                disabled={posting}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold rounded-lg transition"
              >
                {posting ? "Posting..." : "Post Job"}
              </button>
            </form>
          </motion.div>
        )}

        {tab === "jobs" && (
          <div className="space-y-4">
            {jobs.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-neutral-500 text-lg mb-2">No jobs posted yet.</p>
                <p className="text-neutral-600 text-sm">
                  {hasClient ? "Click \"+ Post a Job\" to get started." : "Add a client profile above to post jobs."}
                </p>
              </div>
            ) : (
              jobs.map((job, i) => (
                <motion.a
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="block p-6 bg-[#1a1a1a] border border-neutral-800 rounded-xl hover:border-orange-500/50 transition group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-1 group-hover:text-orange-500 transition">{job.title}</h3>
                      <p className="text-neutral-400 text-sm line-clamp-2">{job.description}</p>
                      {bidCounts[job.id] > 0 && (
                        <span className="inline-block mt-2 text-xs text-orange-400 font-medium">
                          {bidCounts[job.id]} {bidCounts[job.id] === 1 ? "bid" : "bids"}
                        </span>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-orange-500 font-bold">${job.budget.toLocaleString()}</p>
                      <span className={`text-xs px-2 py-1 rounded-full mt-2 inline-block ${
                        job.is_open
                          ? "bg-green-500/10 text-green-400 border border-green-500/30"
                          : "bg-neutral-700/30 text-neutral-500 border border-neutral-700"
                      }`}>
                        {job.is_open ? "Open" : "Closed"}
                      </span>
                    </div>
                  </div>
                </motion.a>
              ))
            )}
          </div>
        )}

        {tab === "bids" && (
          <div className="space-y-4">
            {bids.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-neutral-500 text-lg mb-2">No bids submitted yet.</p>
                {hasFreelancer ? (
                  <a href="/jobs" className="text-orange-500 hover:underline text-sm">Browse jobs and start bidding</a>
                ) : (
                  <p className="text-neutral-600 text-sm">Add a freelancer profile above to submit bids.</p>
                )}
              </div>
            ) : (
              bids.map((bid, i) => (
                <motion.div
                  key={bid.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="p-6 bg-[#1a1a1a] border border-neutral-800 rounded-xl"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-neutral-400 text-sm mb-2">Job #{bid.job_id}</p>
                      <p className="text-white text-sm leading-relaxed">{bid.proposal}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-orange-500 font-bold">${bid.bid_amount.toLocaleString()}</p>
                      <span className={`text-xs px-2 py-1 rounded-full mt-2 inline-block ${
                        bid.is_accepted
                          ? "bg-green-500/10 text-green-400 border border-green-500/30"
                          : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30"
                      }`}>
                        {bid.is_accepted ? "Accepted" : "Pending"}
                      </span>
                      <p className="text-neutral-600 text-xs mt-2">{timeAgo(bid.created_at)}</p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {tab === "payments" && (
          <div className="space-y-4">
            {payments.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-neutral-500 text-lg mb-2">No payments yet.</p>
                <p className="text-neutral-600 text-sm">Payments appear here after accepting a bid.</p>
              </div>
            ) : (
              payments.map((payment, i) => (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="p-6 bg-[#1a1a1a] border border-neutral-800 rounded-xl"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-neutral-400 text-sm">Bid #{payment.bid_id}</p>
                      <p className="text-white font-semibold text-lg mt-1">
                        ${payment.amount.toLocaleString()} {payment.currency.toUpperCase()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                        payment.status === "succeeded"
                          ? "bg-green-500/10 text-green-400 border border-green-500/30"
                          : payment.status === "pending"
                          ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30"
                          : "bg-red-500/10 text-red-400 border border-red-500/30"
                      }`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                      <p className="text-neutral-600 text-xs mt-2">{timeAgo(payment.created_at)}</p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
