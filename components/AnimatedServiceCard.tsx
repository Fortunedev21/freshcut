// components/AnimatedServiceCard.tsx
"use client";

import { motion } from "motion/react";

export default function AnimatedServiceCard({ children, fadeIn }: { children: React.ReactNode; fadeIn: any }) {
  return (
    <motion.div 
      {...fadeIn}
      className="glass-card min-w-[280px] md:min-w-0 snap-start p-5 flex flex-col group cursor-pointer"
    >
      {children}
    </motion.div>
  );
}