"use client";

import { useEffect, useState } from "react";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { motion, AnimatePresence } from "framer-motion";
import { createPaymentIntent, getApiError } from "@/app/lib/api";
import type { PaymentIntentResponse } from "@/app/lib/types";
import Spinner from "@/app/components/Spinner";
import { formatMoney } from "@/app/components/JobCard";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
let stripePromise: Promise<Stripe | null> | null = null;

function getStripe(): Promise<Stripe | null> | null {
  if (!publishableKey) return null;
  if (!stripePromise) stripePromise = loadStripe(publishableKey);
  return stripePromise;
}

function CheckoutForm({
  amount,
  onSuccess,
}: {
  amount: number;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/dashboard` },
      redirect: "if_required",
    });

    if (result.error) {
      setError(result.error.message ?? "Payment failed. Please try again.");
      setSubmitting(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={!stripe || submitting}
        className="mt-6 w-full rounded-xl bg-emerald-500 py-3.5 font-semibold text-white transition-all hover:scale-[1.02] hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? <Spinner small label="Processing…" /> : `Pay ${formatMoney(amount)}`}
      </button>
      <p className="mt-3 text-center text-xs text-gray-400">
        Test mode — use card 4242 4242 4242 4242, any future date, any CVC.
      </p>
    </form>
  );
}

function SuccessView({ amount, onClose }: { amount: number; onClose: () => void }) {
  return (
    <div className="flex flex-col items-center py-6 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 16 }}
        className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950"
      >
        <motion.svg
          className="h-10 w-10 text-emerald-600 dark:text-emerald-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 12.75l6 6 9-13.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
        </motion.svg>
      </motion.div>
      <h3 className="mt-6 text-xl font-bold text-gray-900 dark:text-white">
        Payment successful!
      </h3>
      <p className="mt-2 text-gray-500 dark:text-gray-400">
        {formatMoney(amount)} paid. It may take a moment for the status to update.
      </p>
      <button
        onClick={onClose}
        className="mt-8 rounded-xl bg-emerald-500 px-8 py-3 font-semibold text-white transition-transform hover:scale-105 hover:bg-emerald-600"
      >
        Back to dashboard
      </button>
    </div>
  );
}

export default function PayNowModal({
  bidId,
  onClose,
  onPaid,
}: {
  bidId: number;
  onClose: () => void;
  /** Called after a successful payment so the parent can refetch */
  onPaid: () => void;
}) {
  const [intent, setIntent] = useState<PaymentIntentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  useEffect(() => {
    createPaymentIntent(bidId)
      .then(setIntent)
      .catch((err) => setError(getApiError(err)));
  }, [bidId]);

  const stripe = getStripe();

  const handleSuccess = () => {
    setSucceeded(true);
    onPaid();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={succeeded ? undefined : onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.96 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {succeeded ? "" : "Complete payment"}
            </h2>
            {!succeeded && (
              <button
                onClick={onClose}
                aria-label="Close"
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {!publishableKey && (
            <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              Stripe is not configured. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in
              frontend/.env.local and restart the dev server.
            </p>
          )}

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              {error}
            </p>
          )}

          {publishableKey && !error && !intent && !succeeded && (
            <Spinner label="Preparing secure checkout…" />
          )}

          {succeeded && intent && (
            <SuccessView amount={intent.amount} onClose={onClose} />
          )}

          {publishableKey && stripe && intent && !succeeded && (
            <Elements
              stripe={stripe}
              options={{
                clientSecret: intent.client_secret,
                appearance: { theme: "stripe", variables: { colorPrimary: "#10b981" } },
              }}
            >
              <CheckoutForm amount={intent.amount} onSuccess={handleSuccess} />
            </Elements>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
