"use client";

import { motion } from "framer-motion";

interface SkeletonProps {
  className?: string;
  variant?: "rect" | "circle" | "text";
}

export default function Skeleton({ className = "", variant = "rect" }: SkeletonProps) {
  const baseClass = "relative overflow-hidden bg-white/5";
  
  const variantClasses = {
    rect: "rounded-xl",
    circle: "rounded-full",
    text: "rounded h-4 w-full",
  };

  return (
    <div className={`${baseClass} ${variantClasses[variant]} ${className}`}>
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: "linear",
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent"
      />
    </div>
  );
}

export function UserCardSkeleton() {
  return (
    <div className="glass-dark rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton variant="circle" className="w-16 h-16" />
        <div className="space-y-2 flex-1">
          <Skeleton variant="text" className="w-2/3 h-6" />
          <Skeleton variant="text" className="w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton variant="text" />
        <Skeleton variant="text" className="w-5/6" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="w-16 h-6 rounded-full" />
        <Skeleton className="w-20 h-6 rounded-full" />
      </div>
      <Skeleton className="w-full h-12 rounded-xl mt-4" />
    </div>
  );
}

export function DashboardStatSkeleton() {
  return (
    <div className="text-right space-y-2">
      <Skeleton variant="text" className="w-20 ml-auto" />
      <Skeleton variant="text" className="w-12 h-8 ml-auto" />
    </div>
  );
}
