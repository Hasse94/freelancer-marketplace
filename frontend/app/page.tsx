"use client";

import Link from "next/link";
import { PageFade, SlideUp, HoverScale } from "@/app/components/motion";

const features = [
  {
    title: "Browse Jobs",
    description:
      "Explore open projects from clients around the world. Filter by skills and budget to find work that fits you.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
      </svg>
    ),
  },
  {
    title: "Submit Bids",
    description:
      "Pitch your proposal and set your price. Our Claude-powered matching puts your profile in front of the right clients.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.862 4.487z" />
      </svg>
    ),
  },
  {
    title: "Get Paid",
    description:
      "Secure payments through Stripe. When your bid is accepted, the client pays and you get paid — no chasing invoices.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
  },
];

export default function LandingPage() {
  return (
    <PageFade>
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-24 text-center md:py-32">
        <SlideUp>
          <span className="mb-6 inline-block rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            AI-powered freelancer matching
          </span>
          <h1 className="mx-auto max-w-3xl text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white md:text-6xl">
            Hire Freelancers.{" "}
            <span className="text-emerald-500">Get Work Done.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-500 dark:text-gray-400">
            Post a job, get matched with the best freelancers by Claude AI,
            and pay securely with Stripe — all in one place.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <HoverScale>
              <Link
                href="/auth/signup"
                className="inline-block rounded-xl bg-emerald-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 transition-colors hover:bg-emerald-600"
              >
                Get Started
              </Link>
            </HoverScale>
            <HoverScale>
              <Link
                href="/jobs"
                className="inline-block rounded-xl border border-gray-200 px-8 py-4 text-base font-semibold text-gray-700 transition-colors hover:border-emerald-500 hover:text-emerald-600 dark:border-gray-700 dark:text-gray-200 dark:hover:border-emerald-400 dark:hover:text-emerald-400"
              >
                Browse Jobs
              </Link>
            </HoverScale>
          </div>
        </SlideUp>
      </section>

      {/* Features */}
      <section className="bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <SlideUp className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              How it works
            </h2>
            <p className="mt-3 text-gray-500 dark:text-gray-400">
              Three simple steps from posting to payment.
            </p>
          </SlideUp>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {features.map((feature, i) => (
              <SlideUp key={feature.title} delay={i * 0.12}>
                <div className="h-full rounded-2xl border border-gray-100 bg-white px-6 py-8 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-950">
                  <div className="mb-5 inline-flex rounded-xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-3 leading-relaxed text-gray-500 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </SlideUp>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mx-auto max-w-7xl px-6 py-20 text-center">
        <SlideUp>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Ready to start?
          </h2>
          <p className="mt-3 text-gray-500 dark:text-gray-400">
            Create a free account as a client or a freelancer — it takes a minute.
          </p>
          <HoverScale className="mt-8 inline-block">
            <Link
              href="/auth/signup"
              className="inline-block rounded-xl bg-emerald-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 transition-colors hover:bg-emerald-600"
            >
              Create your account
            </Link>
          </HoverScale>
        </SlideUp>
      </section>
    </PageFade>
  );
}
