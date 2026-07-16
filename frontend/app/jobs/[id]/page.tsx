"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { API_URL } from "../../lib/api";
import PayNowModal from "../../components/PayNowModal";

interface Job {
  id: number;
  client_id: number;
  title: string;
  description: string;
  budget: number;
  deadline: string | null;
  is_open: boolean;
  extracted_skills: string | null;
  complexity_level: string | null;
  domain: string | null;
  created_at: string;
}

interface Bid {
  id: number;
  freelancer_id: number;
  job_id: number;
  proposal: string;
  bid_amount: number;
  is_accepted: boolean;
  created_at: string;
}

interface Match {
  freelancer_id: number;
  match_score: number;
}

export default function JobDetail() {
  const params = useParams();
  const jobId = params.id;

  const [job, setJob] = useState<Job | null>(null);
  const [myClientId, setMyClientId] = useState<number | null>(null);
  const [isFreelancer, setIsFreelancer] = useState(false);
  const [bids, setBids] = useState<Bid[]>([]);
  const [payingBidId, setPayingBidId] = useState<number | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // bid form
  const [proposal, setProposal] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [bidError, setBidError] = useState("");
  const [bidSuccess, setBidSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // AI
  const [summarizing, setSummarizing] = useState(false);
  const [matching, setMatching] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetchJob();
  }, []);

  const fetchJob = async () => {
    try {
      const res = await fetch(`${API_URL}/api/jobs/${jobId}`);
      if (!res.ok) {
        setError("Job not found.");
        return;
      }
      const data = await res.json();
      setJob(data);

      // The token lives in an httpOnly cookie now — invisible to JS —
      // so we ask the API whether we're logged in instead of checking locally.
      const meRes = await fetch(`${API_URL}/api/auth/me`, { credentials: "include" }).catch(() => null);
      const loggedIn = !!meRes?.ok;
      setIsLoggedIn(loggedIn);

      if (loggedIn) {
        const bidsRes = await fetch(`${API_URL}/api/bids/job/${jobId}`, { credentials: "include" });
        if (bidsRes.ok) setBids(await bidsRes.json());

        // do I own this job? (my client profile id === job.client_id)
        const clientRes = await fetch(`${API_URL}/api/users/client/me`, { credentials: "include" }).catch(() => null);
        if (clientRes?.ok) {
          const client = await clientRes.json();
          setMyClientId(client.id);
        }

        // do I have a freelancer profile? (needed to bid)
        const freelancerRes = await fetch(`${API_URL}/api/users/freelancer/me`, { credentials: "include" }).catch(() => null);
        setIsFreelancer(!!freelancerRes?.ok);
      }
    } catch {
      setError("Cannot reach the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = async () => {
    setSummarizing(true);
    try {
      const res = await fetch(`${API_URL}/api/matching/summarize-job/${jobId}`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        await fetchJob();
      }
    } catch {
      // silently fail
    } finally {
      setSummarizing(false);
    }
  };

  const handleMatch = async () => {
    setMatching(true);
    try {
      const res = await fetch(`${API_URL}/api/matching/job/${jobId}/matching-freelancers`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setMatches(data.matches || []);
      }
    } catch {
      // silently fail
    } finally {
      setMatching(false);
    }
  };

  const handleBid = async (e: React.FormEvent) => {
    e.preventDefault();
    setBidError("");
    setSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/api/bids/${jobId}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposal,
          bid_amount: parseFloat(bidAmount),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setBidError(res.status === 401 ? "You need to log in first." : (data.detail || "Failed to submit bid."));
        return;
      }

      setBidSuccess(true);
      setProposal("");
      setBidAmount("");
      await fetchJob();
    } catch {
      setBidError("Cannot reach the server.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptBid = async (bidId: number) => {
    try {
      const res = await fetch(`${API_URL}/api/bids/${bidId}/accept`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        await fetchJob();
      }
    } catch {
      // silently fail
    }
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

  const parsedSkills = (() => {
    if (!job?.extracted_skills) return [];
    try {
      return JSON.parse(job.extracted_skills);
    } catch {
      return [];
    }
  })();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-400">{error || "Job not found."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-20">
      <div className="max-w-4xl mx-auto">
        {/* Back link */}
        <a href="/jobs" className="text-neutral-500 hover:text-orange-500 text-sm transition mb-6 inline-block">
          ← Back to jobs
        </a>

        {/* Job header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-3xl font-bold">{job.title}</h1>
            <div className="text-right shrink-0">
              <p className="text-orange-500 font-bold text-2xl">${job.budget.toLocaleString()}</p>
              <span className={`text-xs px-2 py-1 rounded-full mt-2 inline-block ${
                job.is_open
                  ? "bg-green-500/10 text-green-400 border border-green-500/30"
                  : "bg-neutral-700/30 text-neutral-500 border border-neutral-700"
              }`}>
                {job.is_open ? "Open" : "Closed"}
              </span>
            </div>
          </div>
          <p className="text-neutral-600 text-sm">{timeAgo(job.created_at)}</p>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="p-6 bg-[#1a1a1a] border border-neutral-800 rounded-xl mb-6"
        >
          <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3">Description</h2>
          <p className="text-white leading-relaxed">{job.description}</p>
        </motion.div>

        {/* AI Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="p-6 bg-[#1a1a1a] border border-neutral-800 rounded-xl mb-6"
        >
          <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">AI Analysis</h2>

          {parsedSkills.length > 0 ? (
            <div className="space-y-4">
              <div>
                <p className="text-neutral-500 text-xs mb-2">Extracted Skills</p>
                <div className="flex flex-wrap gap-2">
                  {parsedSkills.map((skill: string) => (
                    <span key={skill} className="px-3 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/30 rounded-full text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              {job.complexity_level && (
                <div>
                  <p className="text-neutral-500 text-xs mb-1">Complexity</p>
                  <p className="text-white capitalize">{job.complexity_level}</p>
                </div>
              )}
              {job.domain && (
                <div>
                  <p className="text-neutral-500 text-xs mb-1">Domain</p>
                  <p className="text-white capitalize">{job.domain}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-neutral-500 text-sm mb-3">No AI analysis yet.</p>
              {isLoggedIn && (
                <button
                  onClick={handleSummarize}
                  disabled={summarizing}
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition"
                >
                  {summarizing ? "Analyzing..." : "Run AI Analysis"}
                </button>
              )}
            </div>
          )}
        </motion.div>

        {/* AI Freelancer Matches */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="p-6 bg-[#1a1a1a] border border-neutral-800 rounded-xl mb-6"
        >
          <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">AI Freelancer Matching</h2>

          {matches.length > 0 ? (
            <div className="space-y-3">
              {matches.map((match, i) => (
                <div key={match.freelancer_id} className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-lg border border-neutral-800">
                  <div className="flex items-center gap-3">
                    <span className="text-orange-500 font-mono font-bold text-sm">#{i + 1}</span>
                    <p className="text-white text-sm">Freelancer #{match.freelancer_id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full"
                        style={{ width: `${match.match_score}%` }}
                      />
                    </div>
                    <span className="text-orange-400 font-bold text-sm">{match.match_score}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-neutral-500 text-sm mb-3">No matches yet.</p>
              {isLoggedIn && (
                <button
                  onClick={handleMatch}
                  disabled={matching}
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition"
                >
                  {matching ? "Finding matches..." : "Find Matching Freelancers"}
                </button>
              )}
            </div>
          )}
        </motion.div>

        {/* Bids Section */}
        {bids.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="p-6 bg-[#1a1a1a] border border-neutral-800 rounded-xl mb-6"
          >
            <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">
              Bids ({bids.length})
            </h2>
            <div className="space-y-3">
              {bids.map((bid) => (
                <div key={bid.id} className="p-4 bg-[#0a0a0a] rounded-lg border border-neutral-800">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-white text-sm leading-relaxed">{bid.proposal}</p>
                      <p className="text-neutral-600 text-xs mt-2">{timeAgo(bid.created_at)}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-orange-500 font-bold">${bid.bid_amount.toLocaleString()}</p>
                      {bid.is_accepted ? (
                        <div className="mt-2 flex flex-col items-end gap-2">
                          <span className="text-xs px-2 py-1 bg-green-500/10 text-green-400 border border-green-500/30 rounded-full inline-block">
                            Accepted
                          </span>
                          <button
                            onClick={() => setPayingBidId(bid.id)}
                            className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium rounded-lg transition"
                          >
                            Pay ${bid.bid_amount.toLocaleString()}
                          </button>
                        </div>

                        ) : (
                        isLoggedIn && job.is_open && myClientId === job.client_id && (
                          <button
                            onClick={() => handleAcceptBid(bid.id)}
                            className="mt-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition"
                          >
                            Accept
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Submit Bid Form */}
        {job.is_open && isLoggedIn && isFreelancer && myClientId !== job.client_id && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="p-6 bg-[#1a1a1a] border border-neutral-800 rounded-xl"
          >
            <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">Submit a Bid</h2>

            {bidSuccess ? (
              <div className="px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
                Bid submitted! The client will review your proposal.
              </div>
            ) : (
              <form onSubmit={handleBid} className="space-y-4">
                <div>
                  <label className="text-sm text-neutral-400 block mb-2">Your proposal</label>
                  <textarea
                    value={proposal}
                    onChange={(e) => setProposal(e.target.value)}
                    required
                    rows={4}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500 transition resize-none"
                    placeholder="Explain why you're a good fit for this job..."
                  />
                </div>
                <div>
                  <label className="text-sm text-neutral-400 block mb-2">Bid amount ($)</label>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500 transition"
                    placeholder="Your price"
                  />
                </div>

                {bidError && (
                  <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    {bidError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold rounded-lg transition"
                >
                  {submitting ? "Submitting..." : "Submit Bid"}
                </button>
              </form>
            )}
          </motion.div>
        )}

        {!isLoggedIn && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="p-6 bg-[#1a1a1a] border border-neutral-800 rounded-xl text-center"
          >
            <p className="text-neutral-400 mb-4">Log in to submit a bid or run AI analysis.</p>
            <a href="/auth/login" className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition inline-block">
              Log In
            </a>
          </motion.div>
        )}
      </div>

      {payingBidId !== null && (
          <PayNowModal
            bidId={payingBidId}
            onClose={() => setPayingBidId(null)}
            onSuccess={() => {
              setPayingBidId(null);
              fetchJob();
            }}
          />
        )}

    </div>
  );
}
