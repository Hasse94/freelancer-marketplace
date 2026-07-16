"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { API_URL } from "../lib/api";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

// Inner form — has access to Stripe context
function CheckoutForm({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError("");

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (stripeError) {
      setError(stripeError.message || "Payment failed.");
      setProcessing(false);
      return;
    }

    // Payment succeeded (or is processing); webhook will finalize status
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement />
      {error && (
        <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={!stripe || processing}
          className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold rounded-lg transition"
        >
          {processing ? "Processing..." : "Pay now"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-3 border border-neutral-700 text-neutral-400 hover:text-white rounded-lg transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// Modal wrapper — fetches the client secret, then mounts Elements
export default function PayNowModal({
  bidId,
  onClose,
  onSuccess,
}: {
  bidId: number;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Create the payment intent once when the modal opens
  useState(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/payments/create-intent`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ bid_id: bidId }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.detail || "Could not start payment.");
          return;
        }
        setClientSecret(data.client_secret);
      } catch {
        setError("Cannot reach the server.");
      } finally {
        setLoading(false);
      }
    })();
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 py-6">
      <div className="w-full max-w-md bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Complete payment</h2>

        {loading && (
          <div className="py-10 text-center">
            <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        )}

        {error && (
          <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm mb-4">
            {error}
            <button onClick={onClose} className="block mt-3 text-neutral-400 hover:text-white text-xs">
              Close
            </button>
          </div>
        )}

        {clientSecret && (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: "night",
                variables: { colorPrimary: "#f97316" },
              },
            }}
          >
            <CheckoutForm onClose={onClose} onSuccess={onSuccess} />
          </Elements>
        )}
      </div>
    </div>
  );
}