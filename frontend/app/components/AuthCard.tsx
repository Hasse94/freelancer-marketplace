"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

export function AuthCard({ title, subtitle, children }: {
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md rounded-2xl border border-gray-100 bg-gray-50 p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900"
      >
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {title}
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
        <div className="mt-8">{children}</div>
      </motion.div>
    </div>
  );
}

export function AuthInput({
  id,
  label,
  ...props
}: { id: string; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
      </label>
      <input
        id={id}
        {...props}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
      />
    </div>
  );
}

export function AuthError({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
    >
      {message}
    </p>
  );
}
