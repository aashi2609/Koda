"use client";

import { motion } from "framer-motion";

interface SplitTextProps {
  text: string;
  className?: string;
  gradientClass?: string;
  delay?: number;
  duration?: number;
  tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
  textAlign?: React.CSSProperties["textAlign"];
  initialDelay?: number;
}

export default function SplitText({
  text,
  className = "",
  gradientClass = "",
  delay = 80,
  duration = 0.6,
  tag = "p",
  textAlign = "center",
  initialDelay = 0,
}: SplitTextProps) {
  const chars = text.split("");
  const Tag = tag as React.ElementType;

  return (
    <Tag
      className={`split-parent ${className}`}
      style={{ textAlign, display: "block" }}
    >
      {chars.map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration,
            delay: initialDelay + i * (delay / 1000),
            ease: [0.22, 1, 0.36, 1],
          }}
          className={gradientClass}
          style={{
            display: "inline-block",
            whiteSpace: char === " " ? "pre" : "normal",
          }}
        >
          {char}
        </motion.span>
      ))}
    </Tag>
  );
}
