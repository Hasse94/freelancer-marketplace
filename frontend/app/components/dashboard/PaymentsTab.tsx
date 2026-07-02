"use client";

import { useCallback, useEffect, useState } from "react";
import { getApiError, getPaymentHistory } from "@/app/lib/api";
import type { Payment } from "@/app/lib/types";
import { useAuth } from "@/app/context/AuthContext";
import Spinner from "@/app/components/Spinner";
import PayNowModal from "@/app/components/PayNowModal";
import { formatMoney } from "@/app/components/JobCard";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: Payment["status"] }) {
  if (status === "succeeded") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
        Payment confirmed
      </span>
    );
  }
  const styles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    failed: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
    canceled: "bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  };
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
        styles[status] ?? styles.canceled
      }`}
    >
      {status}
    </span>
  );
}

export default function PaymentsTab() {
  const { isClient, clientProfile } = useAuth();
  const [payments, setPayments] = useState<Payment[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [payingBidId, setPayingBidId] = useState<number | null>(null);

  const load = useCallback(() => {
    getPaymentHistory()
      .then(setPayments)
      .catch((err) => setError(getApiError(err)));
  }, []);

  useEffect(load, [load]);

  return (
    <div>
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}
      {payments === null && !error && <Spinner label="Loading payment history…" />}
      {payments?.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-200 px-6 py-16 text-center text-gray-500 dark:border-gray-800 dark:text-gray-400">
          No payments yet. {isClient && "Payments appear here once you start paying for accepted bids."}
        </div>
      )}

      <div className="space-y-4">
        {payments?.map((payment) => {
          // Only the client who owns the payment can pay it
          const canPay =
            payment.status === "pending" &&
            isClient &&
            clientProfile?.id === payment.client_id;
          const canRetry =
            (payment.status === "failed" || payment.status === "canceled") &&
            isClient &&
            clientProfile?.id === payment.client_id;
          return (
            <div
              key={payment.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-950"
            >
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {formatMoney(payment.amount)}{" "}
                  <span className="text-sm font-normal uppercase text-gray-400">
                    {payment.currency}
                  </span>
                </p>
                <p className="mt-1 text-sm text-gray-400">
                  Bid #{payment.bid_id} · {formatDateTime(payment.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={payment.status} />
                {(canPay || canRetry) && (
                  <button
                    onClick={() => setPayingBidId(payment.bid_id)}
                    className="rounded-lg bg-emerald-500 px-5 py-2 text-sm font-semibold text-white transition-transform hover:scale-105 hover:bg-emerald-600"
                  >
                    {canRetry ? "Retry Payment" : "Pay Now"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {payingBidId !== null && (
        <PayNowModal
          bidId={payingBidId}
          onClose={() => {
            setPayingBidId(null);
            load();
          }}
          onPaid={load}
        />
      )}
    </div>
  );
}
