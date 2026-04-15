"use client";

import { motion } from "framer-motion";
import { FiCheckCircle } from "react-icons/fi";
import confetti from "canvas-confetti";
import { useEffect } from "react";

export default function VerifiedBadge() {
  useEffect(() => {
    // Trigger confetti animation immediately on mount
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#00FFFF", "#FF00FF"]
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#00FFFF", "#FF00FF"]
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", bounce: 0.5 }}
      className="flex flex-col items-center justify-center p-8 text-center"
    >
      <motion.div 
        animate={{ 
          boxShadow: ["0 0 20px rgba(0,255,255,0.4)", "0 0 60px rgba(0,255,255,0.8)", "0 0 20px rgba(0,255,255,0.4)"] 
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-24 h-24 rounded-full bg-[#00FFFF]/20 border-2 border-[#00FFFF] flex items-center justify-center mb-6"
      >
        <FiCheckCircle className="text-5xl text-[#00FFFF]" />
      </motion.div>
      <h2 className="text-3xl font-bold bg-gradient-to-r from-[#00FFFF] to-[#FF00FF] bg-clip-text text-transparent mb-2">
        Skill Verified!
      </h2>
      <p className="text-white/60">
        Both users have confirmed completion. This skill has been added to the verified list!
      </p>
    </motion.div>
  );
}
