"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Brain, ShieldCheck, Zap } from "lucide-react";

const ParticleMesh = dynamic(() => import("./components/ParticleMesh"), {
  ssr: false,
});

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <ParticleMesh />
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-orange-500 text-sm font-semibold tracking-widest uppercase mb-4"
          >
            AI-Powered Freelancer Matching
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold leading-tight mb-6"
          >
            Find the Right
            <span className="text-orange-500"> Talent.</span>
            <br />
            Get Work Done.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto mb-10"
          >
            Post a job, let Claude AI match you with the best freelancers, and pay securely through Stripe.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex items-center justify-center gap-4"
          >
            <a href="/auth/signup" className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition transform hover:scale-105">
              Get Started
            </a>
            <a href="/jobs" className="px-8 py-3 border border-neutral-700 hover:border-orange-500 text-white font-semibold rounded-lg transition">
              Browse Jobs
            </a>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent z-10" />
      </section>

      {/* Stats band */}
      <section className="border-y border-neutral-800 py-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Brain,
              stat: "0–100",
              title: "Claude-powered matching",
              label: "Ranks freelancers by real fit, not keywords",
            },
            {
              icon: ShieldCheck,
              stat: "0 double charges",
              title: "Stripe payments",
              label: "Every payment webhook-verified and safe",
            },
            {
              icon: Zap,
              stat: "Seconds",
              title: "Instant analysis",
              label: "From posting a job to seeing top matches",
            },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-[#1a1a1a] border border-neutral-800 text-center"
              >
                <div className="w-11 h-11 mx-auto mb-4 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-orange-500" />
                </div>
                <p className="text-xl font-bold text-orange-500 mb-1">{item.stat}</p>
                <p className="text-white text-sm font-semibold mb-1">{item.title}</p>
                <p className="text-neutral-500 text-xs">{item.label}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center mb-4"
          >
            How It Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-neutral-400 text-center mb-16 max-w-xl mx-auto"
          >
            Three steps from posting to payment.
          </motion.p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Post a Job",
                desc: "Describe what you need. Claude AI extracts skills, complexity, and requirements automatically.",
              },
              {
                step: "02",
                title: "Get Matched",
                desc: "Claude Sonnet ranks freelancers by skill fit, budget alignment, and profile quality.",
              },
              {
                step: "03",
                title: "Pay Securely",
                desc: "Accept the best bid and pay through Stripe. Webhook-verified, no double charges.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="p-8 rounded-2xl bg-[#1a1a1a] border border-neutral-800 hover:border-orange-500/50 transition group"
              >
                <span className="text-orange-500 text-sm font-mono font-bold">{item.step}</span>
                <h3 className="text-xl font-bold mt-3 mb-3 group-hover:text-orange-500 transition">{item.title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why FreelanceHub */}
      <section className="py-24 px-6 border-t border-neutral-800">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center mb-4"
          >
            Why FreelanceHub
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-neutral-400 text-center mb-16 max-w-xl mx-auto"
          >
            Built around AI matching and payments that just work.
          </motion.p>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Matching that understands context",
                desc: "Instead of matching on keywords, Claude reads the full job and each freelancer's profile, then scores fit from 0 to 100.",
              },
              {
                title: "Payments you can trust",
                desc: "Every payment is verified by a Stripe webhook, and a database-level constraint makes double charges impossible.",
              },
              {
                title: "One account, both sides",
                desc: "Hire as a client and take on work as a freelancer from the same account — no juggling logins.",
              },
              {
                title: "Fast, transparent bidding",
                desc: "Freelancers pitch with a proposal and price. Clients see every bid and accept the one they want.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-[#1a1a1a] border border-neutral-800"
              >
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-6"
          >
            Ready to find your next<span className="text-orange-500"> opportunity</span>?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-neutral-400 text-lg mb-10"
          >
            Join as a client or freelancer. It takes 30 seconds.
          </motion.p>
          <motion.a
            href="/auth/signup"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="inline-block px-10 py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition transform hover:scale-105 text-lg"
          >
            Create Your Account
          </motion.a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-neutral-500">© 2026 FreelanceHub. Built with FastAPI, Next.js and Claude.</p>
          <div className="flex gap-6">
            <a href="/jobs" className="text-sm text-neutral-500 hover:text-white transition">Jobs</a>
            <a href="/auth/signup" className="text-sm text-neutral-500 hover:text-white transition">Sign Up</a>
            <a href="/dashboard" className="text-sm text-neutral-500 hover:text-white transition">Dashboard</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
