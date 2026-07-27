"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"

import { Logo } from "@/components/Logo"
import { LogoIcon } from "@/components/LogoIcon"

interface SplashProps {
  onComplete: () => void
}

export default function Splash({ onComplete }: SplashProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1200)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex h-full w-full flex-col items-center justify-center bg-background text-foreground"
    >
      {/* <Logo height={26} /> */}
      <LogoIcon height={26} />
      <span className="mt-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">CARGANDO ASISTENTE</span>
    </motion.div>
  )
}
