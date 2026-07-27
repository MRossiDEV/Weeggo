"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";

import { Logo } from "@/components/Logo";
import { LogoIcon } from "../LogoIcon";

export function AppSplash({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1300);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="weeggo-bg flex h-dvh flex-col items-center justify-center"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* <Logo height={30} /> */}
        <LogoIcon height={35} />
      </motion.div>

      <motion.div
        initial={{ width: 0 }}
        animate={{ width: 64 }}
        transition={{ delay: 0.3, duration: 0.7, ease: "easeInOut" }}
        className="mt-5 h-[3px] overflow-hidden rounded-full"
        style={{ background: "var(--weeggo-blue)" }}
      />
    </motion.div>
  );
}
