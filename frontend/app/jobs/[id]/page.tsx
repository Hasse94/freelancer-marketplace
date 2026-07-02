"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  acceptBid,
  getApiError,
  getBidsForJob,
  getJob,
  getMatchingFreelancers,
  submitBid,
} from "@/app/lib/api";
import type { Bid, FreelancerMatch, Job } from "@/app/lib/types";
import { useAuth } from "@/app/context/AuthContext";
import Spinner from "@/app/components/Spinner";
import PayNowModal from "@/app/components/PayNowModal";
import { PageFade, SlideUp } from "@/app/components/motion";
import { formatDate, formatMoney } from "@/app/components/JobCard";

// ─── AI matching section (job owner only) ────────────────────

function MatchCard({ match, rank }: { match: FreelancerMatch; rank: number }) {
  const [expanded, setExpanded] = useState(false);
  const scoreColor =
    match.match_score >= 75
      ? "text-emerald-600 dark:text-emerald-400"
      : match.match_score >= 50
        ? "text-amber-600 dark:text-amber-400"
        : "text-gray-500 dark:text-gray-400";

  return (
    <motion.button
      type="button"
      onClick={() => setExpanded((v) => !v)}
      whileHover={{ scale: 1.02 }}
      className="w-full rounded-xl border border-gray-100 bg-white px-5 py-4 text-left transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-950"
    >
      <div className="flex items-center gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 font-bold text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
          #{rank}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-gray-900 dark:text-white">
            {match.name ?? `Freelancer #${match.freelancer_id}`}
          </p>
          {match.skills && (
            <p className="truncate text-sm text-gray-500 dark:text-gray-400">
              {match.skills}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className={`text-xl font-bold ${scoreColor}`}>{match.match_score}</p>
          <p className="text-xs text-gray-400">match score</p>
        </div>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, match.match_score))}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="h-full rounded-full bg-emerald-500"
        />
      </div>
      {expanded && (
        <div className="mt-4 space-y-1 border-t border-gray-100 pt-4 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300">
          <p>
            <span className="font-medium">Freelancer ID:</span> {match.freelancer_id}
          </p>
          {match.hourly_rate !== undefined && (
            <p>
              <span className="font-medium">Hourly rate:</span>{" "}
              {formatMoney(match.hourly_rate)}/hr
            </p>
          )}
          {match.reason && (
            <p>
              <span className="font-medium">Why this match:</span> {match.reason}
            </p>
          )}
          <p className="text-gray-400 dark:text-gray-500">
            Ranked by Claude based on skills, budget fit, experience and profile quality.
          </p>
        </div>
      )}
    </motion.button>
  );
}

function MatchesSection({ jobId, isOwner }: { jobId: number; isOwner: boolean }) {
  const { isLoggedIn } = useAuth();
  const [matches, setMatches] = useState<FreelancerMatch[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOwner) return;
    setLoading(true);
    getMatchingFreelancers(jobId)
      .then((res) => setMatches(res.matches.slice(0, 3)))
      .catch((err) => setError(getApiError(err)))
      .finally(() => setLoading(false));
  }, [jobId, isOwner]);

  return (
    <SlideUp>
      <section className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6 dark:border-emerald-900 dark:bg-emerald-950/30">
        <div className="mb-4 flex items-center gap-2">
          <svg className="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Top matching freelancers for this job
          </h2>
        </div>

        {!isOwner && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isLoggedIn
              ? "AI matches are only visible to the client who posted this job."
              : "Log in as the job owner to see Claude's top freelancer matches."}
          </p>
        )}

        {isOwner && loading && (
          <Spinner label="Claude is ranking freelancers — this can take a few seconds…" />
        )}

        {isOwner && error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}

        {isOwner && matches && matches.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No freelancer matches yet — check back once freelancers have joined.
          </p>
        )}

        {isOwner && matches && matches.length > 0 && (
          <div className="space-y-3">
            {matches.map((match, i) => (
              <MatchCard key={match.freelancer_id} match={match} rank={i + 1} />
            ))}
          </div>
        )}
      </section>
    </SlideUp>
  );
}

// ─── Bid form (freelancers) ──────────────────────────────────

function BidForm({ jobId, onSubmitted }: { jobId: number; onSubmitted: () => void }) {
  const [proposal, setProposal] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const bidAmount = Number(amount);
    if (!proposal.trim()) {
      setError("Please write a proposal.");
      return;
    }
    if (!amount || Number.isNaN(bidAmount) || bidAmount <= 0) {
      setError("Please enter a valid bid amount.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await submitBid(jobId, { proposal: proposal.trim(), bid_amount: bidAmount });
      setDone(true);
      onSubmitted();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-6 text-center dark:border-emerald-900 dark:bg-emerald-950">
        <p className="font-semibold text-emerald-700 dark:text-emerald-300">
          ✓ Your bid is in!
        </p>
        <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">
          Track its status under{" "}
          <Link href="/dashboard" className="underline">
            My Bids
          </Link>{" "}
          in your dashboard.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-gray-100 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900"
    >
      <h2 className="text-lg font-bold text-gray-900 dark:text-white">Submit a Bid</h2>
      <div className="mt-4">
        <label htmlFor="proposal" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Your proposal
        </label>
        <textarea
          id="proposal"
          rows={5}
          value={proposal}
          onChange={(e) => setProposal(e.target.value)}
          placeholder="Explain why you're the right freelancer for this job…"
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
        />
      </div>
      <div className="mt-4">
        <label htmlFor="bidAmount" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Bid amount (USD)
        </label>
        <input
          id="bidAmount"
          type="number"
          min={1}
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 1500"
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
        />
      </div>
      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="mt-5 w-full rounded-xl bg-emerald-500 py-3 font-semibold text-white transition-all hover:scale-[1.02] hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? <Spinner small label="Submitting…" /> : "Submit Bid"}
      </button>
    </form>
  );
}

// ─── Bids list with accept buttons (job owner) ───────────────

function BidsSection({ jobId, onAccepted }: { jobId: number; onAccepted: () => void }) {
  const [bids, setBids] = useState<Bid[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<number | null>(null);
  const [payingBidId, setPayingBidId] = useState<number | null>(null);

  const load = useCallback(() => {
    getBidsForJob(jobId)
      .then(setBids)
      .catch((err) => setError(getApiError(err)));
  }, [jobId]);

  useEffect(load, [load]);

  const handleAccept = async (bidId: number) => {
    setAcceptingId(bidId);
    setError(null);
    try {
      await acceptBid(bidId);
      load();
      onAccepted();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setAcceptingId(null);
    }
  };

  const hasAccepted = bids?.some((b) => b.is_accepted) ?? false;

  return (
    <section className="rounded-2xl border border-gray-100 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white">
        Bids received {bids ? `(${bids.length})` : ""}
      </h2>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {!bids && !error && <Spinner label="Loading bids…" />}

      {bids && bids.length === 0 && (
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          No bids yet. Freelancers will see this job on the Browse Jobs page.
        </p>
      )}

      <div className="mt-4 space-y-4">
        {bids?.map((bid) => (
          <div
            key={bid.id}
            className="rounded-xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-gray-950"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  Freelancer #{bid.freelancer_id} — {formatMoney(bid.bid_amount)}
                </p>
                <p className="text-xs text-gray-400">Submitted {formatDate(bid.created_at)}</p>
              </div>
              {bid.is_accepted ? (
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    ✓ Accepted
                  </span>
                  <button
                    onClick={() => setPayingBidId(bid.id)}
                    className="rounded-lg bg-emerald-500 px-4 py-1.5 text-sm font-semibold text-white transition-transform hover:scale-105 hover:bg-emerald-600"
                  >
                    Pay Now
                  </button>
                </div>
              ) : (
                !hasAccepted && (
                  <button
                    onClick={() => handleAccept(bid.id)}
                    disabled={acceptingId !== null}
                    className="rounded-lg border border-emerald-500 px-4 py-1.5 text-sm font-semibold text-emerald-600 transition-colors hover:bg-emerald-500 hover:text-white disabled:opacity-50 dark:text-emerald-400"
                  >
                    {acceptingId === bid.id ? "Accepting…" : "Accept Bid"}
                  </button>
                )
              )}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              {bid.proposal}
            </p>
          </div>
        ))}
      </div>

      {payingBidId !== null && (
        <PayNowModal
          bidId={payingBidId}
          onClose={() => setPayingBidId(null)}
          onPaid={load}
        />
      )}
    </section>
  );
}

// ─── Page ────────────────────────────────────────────────────

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const jobId = Number(params.id);
  const { isLoggedIn, isClient, isFreelancer, clientProfile, loading: authLoading } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadJob = useCallback(() => {
    if (Number.isNaN(jobId)) {
      setError("Invalid job ID");
      return;
    }
    getJob(jobId)
      .then(setJob)
      .catch((err) => setError(getApiError(err)));
  }, [jobId]);

  useEffect(loadJob, [loadJob]);

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
        <Link href="/jobs" className="mt-6 inline-block font-medium text-emerald-600 hover:underline dark:text-emerald-400">
          ← Back to all jobs
        </Link>
      </div>
    );
  }

  if (!job || authLoading) {
    return <Spinner label="Loading job…" />;
  }

  const isOwner = isClient && clientProfile !== null && clientProfile.id === job.client_id;

  return (
    <PageFade>
      <div className="mx-auto max-w-4xl px-6 py-12">
        <Link
          href="/jobs"
          className="mb-6 inline-block text-sm font-medium text-gray-500 transition-colors hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400"
        >
          ← Back to all jobs
        </Link>

        {/* Job header */}
        <SlideUp>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-8 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                {job.title}
              </h1>
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  job.is_open
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                }`}
              >
                {job.is_open ? "Open for bids" : "Closed"}
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
              <span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatMoney(job.budget)}
                </span>{" "}
                budget
              </span>
              {job.deadline && <span>Deadline: {formatDate(job.deadline)}</span>}
              <span>Posted {formatDate(job.created_at)}</span>
            </div>
            <p className="mt-6 whitespace-pre-line leading-relaxed text-gray-600 dark:text-gray-300">
              {job.description}
            </p>
          </div>
        </SlideUp>

        <div className="mt-8 space-y-8">
          <MatchesSection jobId={job.id} isOwner={isOwner} />

          {/* Freelancer: bid form */}
          {isFreelancer && !isOwner && job.is_open && (
            <SlideUp>
              <BidForm jobId={job.id} onSubmitted={() => undefined} />
            </SlideUp>
          )}

          {isFreelancer && !isOwner && !job.is_open && (
            <p className="rounded-xl border border-gray-200 px-6 py-4 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
              This job is closed and no longer accepting bids.
            </p>
          )}

          {/* Client owner: bids with accept buttons */}
          {isOwner && (
            <SlideUp>
              <BidsSection jobId={job.id} onAccepted={loadJob} />
            </SlideUp>
          )}

          {/* Logged out */}
          {!isLoggedIn && (
            <SlideUp>
              <div className="rounded-2xl border border-gray-100 bg-gray-50 px-6 py-8 text-center dark:border-gray-800 dark:bg-gray-900">
                <p className="font-medium text-gray-700 dark:text-gray-200">
                  Want to bid on this job?
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Log in or create a freelancer account to submit your proposal.
                </p>
                <div className="mt-5 flex items-center justify-center gap-3">
                  <Link
                    href="/auth/login"
                    className="rounded-xl border border-gray-200 px-6 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-emerald-500 hover:text-emerald-600 dark:border-gray-700 dark:text-gray-200"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105 hover:bg-emerald-600"
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
            </SlideUp>
          )}

          {/* Logged in but no profile yet */}
          {isLoggedIn && !isClient && !isFreelancer && (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-6 py-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
              You need a freelancer profile to bid on jobs.{" "}
              <Link href="/dashboard" className="font-semibold underline">
                Set one up in your dashboard →
              </Link>
            </p>
          )}
        </div>
      </div>
    </PageFade>
  );
}
