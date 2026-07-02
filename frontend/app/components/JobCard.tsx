"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Job } from "@/app/lib/types";

export function formatMoney(amount: number): string {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function JobCard({ job, index = 0 }: { job: Job; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, ease: "easeOut", delay: (index % 9) * 0.05 }}
      whileHover={{ scale: 1.02 }}
    >
      <Link
        href={`/jobs/${job.id}`}
        className="flex h-full flex-col rounded-2xl border border-gray-100 bg-gray-50 px-6 py-6 transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {job.title}
          </h3>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
              job.is_open
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                : "bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
            }`}
          >
            {job.is_open ? "Open" : "Closed"}
          </span>
        </div>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
          {job.description.length > 140
            ? `${job.description.slice(0, 140)}…`
            : job.description}
        </p>
        <div className="mt-5 flex items-center justify-between border-t border-gray-200 pt-4 text-sm dark:border-gray-800">
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {formatMoney(job.budget)}
          </span>
          <span className="text-gray-400 dark:text-gray-500">
            Posted {formatDate(job.created_at)}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
