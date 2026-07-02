"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getApiError, getJob, getMyBids } from "@/app/lib/api";
import type { Bid, Job } from "@/app/lib/types";
import Spinner from "@/app/components/Spinner";
import { formatDate, formatMoney } from "@/app/components/JobCard";

interface BidWithJob extends Bid {
  job?: Job;
}

/**
 * A bid is "pending" until accepted. The API has no explicit rejected state,
 * but once its job closes with a different accepted bid, this one lost.
 */
function bidStatus(bid: BidWithJob): "accepted" | "rejected" | "pending" {
  if (bid.is_accepted) return "accepted";
  if (bid.job && !bid.job.is_open) return "rejected";
  return "pending";
}

const statusStyles = {
  accepted:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  pending:
    "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  rejected: "bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
} as const;

export default function MyBidsTab() {
  const [bids, setBids] = useState<BidWithJob[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const myBids = await getMyBids();
        // Enrich with job info (title + open state) for status display
        const withJobs = await Promise.all(
          myBids.map(async (bid) => {
            const job = await getJob(bid.job_id).catch(() => undefined);
            return { ...bid, job };
          })
        );
        withJobs.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setBids(withJobs);
      } catch (err) {
        setError(getApiError(err));
      }
    })();
  }, []);

  return (
    <div>
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}
      {bids === null && !error && <Spinner label="Loading your bids…" />}
      {bids?.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-200 px-6 py-16 text-center text-gray-500 dark:border-gray-800 dark:text-gray-400">
          You haven&apos;t submitted any bids yet.{" "}
          <Link href="/jobs" className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">
            Browse open jobs →
          </Link>
        </div>
      )}
      <div className="space-y-4">
        {bids?.map((bid) => {
          const status = bidStatus(bid);
          return (
            <div
              key={bid.id}
              className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-950"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link
                    href={`/jobs/${bid.job_id}`}
                    className="font-semibold text-gray-900 hover:text-emerald-600 dark:text-white dark:hover:text-emerald-400"
                  >
                    {bid.job?.title ?? `Job #${bid.job_id}`}
                  </Link>
                  <p className="mt-1 text-sm text-gray-400">
                    Bid {formatMoney(bid.bid_amount)} · {formatDate(bid.created_at)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusStyles[status]}`}
                >
                  {status === "accepted" ? "✓ Accepted" : status}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                {bid.proposal}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
