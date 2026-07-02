"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

/** Fades the whole page in on mount — used as a page transition. */
export function PageFade({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

/** Slides up + fades in when scrolled into view. */
export function SlideUp({
  children,
  delay = 0,
  className,
  ...rest
}: { children: ReactNode; delay?: number } & HTMLMotionProps<"div">) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, ease: "easeOut", delay }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Button wrapper with a subtle hover scale. */
export function HoverScale({
  children,
  className,
  ...rest
}: { children: ReactNode } & HTMLMotionProps<"div">) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
