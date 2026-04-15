"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiStar, FiMessageSquare, FiSend, FiX } from "react-icons/fi";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  swapId: string;
  partnerName: string;
}

export default function ReviewModal({ isOpen, onClose, swapId, partnerName }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ swapId, rating, comment }),
      });
      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-md bg-[#120F17] border border-white/10 rounded-3xl p-8 shadow-2xl"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-white/20 hover:text-white">
          <FiX />
        </button>

        {submitted ? (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiStar className="text-3xl text-green-500 fill-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Thank You!</h2>
            <p className="text-white/40">Your feedback helps the Koda community grow.</p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">How was your swap?</h2>
            <p className="text-white/40 mb-8">Share your experience learning with {partnerName}.</p>

            <div className="space-y-8">
              {/* Rating Stars */}
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    className="transition-all transform hover:scale-125 focus:outline-none"
                  >
                    <FiStar
                      size={40}
                      className={
                        (hover || rating) >= star
                          ? "text-[#FFD700] fill-[#FFD700]"
                          : "text-white/10 fill-transparent"
                      }
                    />
                  </button>
                ))}
              </div>

              {/* Comment field */}
              <div className="space-y-2">
                <label className="text-xs uppercase font-bold tracking-widest text-white/30 flex items-center gap-2">
                  <FiMessageSquare /> Feedback (Optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What was the best part of the session?"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/10 outline-none focus:border-[#00FFFF]/50 transition-all min-h-[120px] resize-none"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || rating === 0}
                className="w-full h-14 bg-gradient-to-r from-[#00FFFF] to-[#FF00FF] rounded-xl text-black font-black uppercase tracking-tighter flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(0,255,255,0.4)] transition-all disabled:opacity-50 disabled:grayscale"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    Submit Review <FiSend />
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
