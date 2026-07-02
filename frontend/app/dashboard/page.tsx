"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Spinner from "@/app/components/Spinner";
import { PageFade } from "@/app/components/motion";
import ProfileSetup from "@/app/components/dashboard/ProfileSetup";
import MyJobsTab from "@/app/components/dashboard/MyJobsTab";
import MyBidsTab from "@/app/components/dashboard/MyBidsTab";
import PaymentsTab from "@/app/components/dashboard/PaymentsTab";

type Tab = "jobs" | "bids" | "payments";

export default function DashboardPage() {
  const { user, loading, isLoggedIn, isClient, isFreelancer } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab | null>(null);

  // Protected route: bounce to login once the session check settles
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.replace("/auth/login");
    }
  }, [loading, isLoggedIn, router]);

  // Default to the first tab the user's role can use
  useEffect(() => {
    if (tab !== null || loading) return;
    if (isClient) setTab("jobs");
    else if (isFreelancer) setTab("bids");
    else setTab("payments");
  }, [tab, loading, isClient, isFreelancer]);

  if (loading || !isLoggedIn) {
    return <Spinner label="Checking your session…" />;
  }

  const tabs: { id: Tab; label: string; show: boolean }[] = [
    { id: "jobs", label: "My Jobs", show: isClient },
    { id: "bids", label: "My Bids", show: isFreelancer },
    { id: "payments", label: "Payments", show: isClient || isFreelancer },
  ];
  const visibleTabs = tabs.filter((t) => t.show);

  return (
    <PageFade>
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Signed in as <span className="font-medium">{user?.email}</span>
            {isClient && isFreelancer
              ? " — client & freelancer"
              : isClient
                ? " — client"
                : isFreelancer
                  ? " — freelancer"
                  : ""}
          </p>
        </div>

        <ProfileSetup />

        {visibleTabs.length > 0 && (
          <>
            <div className="mb-8 flex gap-2 rounded-xl bg-gray-100 p-1.5 dark:bg-gray-900 sm:w-fit">
              {visibleTabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex-1 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors sm:flex-none ${
                    tab === t.id
                      ? "bg-white text-emerald-600 shadow-sm dark:bg-gray-950 dark:text-emerald-400"
                      : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab === "jobs" && isClient && <MyJobsTab />}
            {tab === "bids" && isFreelancer && <MyBidsTab />}
            {tab === "payments" && (isClient || isFreelancer) && <PaymentsTab />}
          </>
        )}

        {visibleTabs.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400">
            Create a profile above to start posting jobs or bidding.
          </p>
        )}
      </div>
    </PageFade>
  );
}
