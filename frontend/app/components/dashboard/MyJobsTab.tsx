"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  acceptBid,
  createJob,
  getApiError,
  getBidsForJob,
  getMyJobs,
} from "@/app/lib/api";
import type { Bid, Job } from "@/app/lib/types";
import Spinner from "@/app/components/Spinner";
import PayNowModal from "@/app/components/PayNowModal";
import { formatDate, formatMoney } from "@/app/components/JobCard";

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100";

function PostJobForm({ onPosted }: { onPosted: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const budgetNum = Number(budget);
    if (!title.trim() || !description.trim() || !budget || Number.isNaN(budgetNum) || budgetNum <= 0) {
      setError("Please fill in a title, description and a valid budget.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createJob({
        title: title.trim(),
        description: description.trim(),
        budget: budgetNum,
        deadline: deadline ? new Date(deadline).toISOString() : null,
      });
      setTitle("");
      setDescription("");
      setBudget("");
      setDeadline("");
      setOpen(false);
      onPosted();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mb-6 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-105 hover:bg-emerald-600"
      >
        + Post a new job
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 space-y-4 rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-950"
    >
      <h3 className="font-bold text-gray-900 dark:text-white">Post a new job</h3>
      <div>
        <label htmlFor="jobTitle" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Title
        </label>
        <input
          id="jobTitle"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Build a landing page for my startup"
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="jobDescription" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Description
        </label>
        <textarea
          id="jobDescription"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the work, required skills, and what success looks like…"
          className={inputClass}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="jobBudget" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Budget (USD)
          </label>
          <input
            id="jobBudget"
            type="number"
            min={1}
            step="0.01"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="2000"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="jobDeadline" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Deadline (optional)
          </label>
          <input
            id="jobDeadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>
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
          {submitting ? <Spinner small label="Posting…" /> : "Post job"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function JobRow({ job, onChanged }: { job: Job; onChanged: () => void }) {
  const [bids, setBids] = useState<Bid[] | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<number | null>(null);
  const [payingBidId, setPayingBidId] = useState<number | null>(null);

  const loadBids = useCallback(() => {
    getBidsForJob(job.id)
      .then(setBids)
      .catch((err) => setError(getApiError(err)));
  }, [job.id]);

  useEffect(loadBids, [loadBids]);

  const handleAccept = async (bidId: number) => {
    setAcceptingId(bidId);
    setError(null);
    try {
      await acceptBid(bidId);
      loadBids();
      onChanged();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setAcceptingId(null);
    }
  };

  const hasAccepted = bids?.some((b) => b.is_accepted) ?? false;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href={`/jobs/${job.id}`}
            className="font-semibold text-gray-900 hover:text-emerald-600 dark:text-white dark:hover:text-emerald-400"
          >
            {job.title}
          </Link>
          <p className="mt-1 text-sm text-gray-400">
            {formatMoney(job.budget)} · Posted {formatDate(job.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              job.is_open
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                : "bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
            }`}
          >
            {job.is_open ? "Open" : "Closed"}
          </span>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 transition-colors hover:border-emerald-500 hover:text-emerald-600 dark:border-gray-700 dark:text-gray-300"
          >
            {bids === null ? "Bids" : `${bids.length} bid${bids.length === 1 ? "" : "s"}`}{" "}
            {expanded ? "▲" : "▼"}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 space-y-3 border-t border-gray-100 pt-4 dark:border-gray-800">
          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              {error}
            </p>
          )}
          {bids === null && !error && <Spinner small label="Loading bids…" />}
          {bids?.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">No bids yet.</p>
          )}
          {bids?.map((bid) => (
            <div
              key={bid.id}
              className="rounded-xl bg-gray-50 p-4 dark:bg-gray-900"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Freelancer #{bid.freelancer_id} — {formatMoney(bid.bid_amount)}
                </p>
                {bid.is_accepted ? (
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      ✓ Accepted
                    </span>
                    <button
                      onClick={() => setPayingBidId(bid.id)}
                      className="rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-white transition-transform hover:scale-105 hover:bg-emerald-600"
                    >
                      Pay Now
                    </button>
                  </div>
                ) : (
                  !hasAccepted &&
                  job.is_open && (
                    <button
                      onClick={() => handleAccept(bid.id)}
                      disabled={acceptingId !== null}
                      className="rounded-lg border border-emerald-500 px-4 py-1.5 text-xs font-semibold text-emerald-600 transition-colors hover:bg-emerald-500 hover:text-white disabled:opacity-50 dark:text-emerald-400"
                    >
                      {acceptingId === bid.id ? "Accepting…" : "Accept Bid"}
                    </button>
                  )
                )}
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{bid.proposal}</p>
            </div>
          ))}
        </div>
      )}

      {payingBidId !== null && (
        <PayNowModal
          bidId={payingBidId}
          onClose={() => setPayingBidId(null)}
          onPaid={loadBids}
        />
      )}
    </div>
  );
}

export default function MyJobsTab() {
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    getMyJobs()
      .then((data) =>
        setJobs(
          [...data].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
        )
      )
      .catch((err) => setError(getApiError(err)));
  }, []);

  useEffect(load, [load]);

  return (
    <div>
      <PostJobForm onPosted={load} />
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}
      {jobs === null && !error && <Spinner label="Loading your jobs…" />}
      {jobs?.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-200 px-6 py-16 text-center text-gray-500 dark:border-gray-800 dark:text-gray-400">
          You haven&apos;t posted any jobs yet. Post one to start receiving bids.
        </div>
      )}
      <div className="space-y-4">
        {jobs?.map((job) => (
          <JobRow key={job.id} job={job} onChanged={load} />
        ))}
      </div>
    </div>
  );
}
