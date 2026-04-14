"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiSend } from "react-icons/fi";

interface SwapRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiverName: string;
  receiverId: string;
  onSuccess: () => void;
}

export default function SwapRequestModal({
  isOpen,
  onClose,
  receiverName,
  receiverId,
  onSuccess,
}: SwapRequestModalProps) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const maxLength = 1000;
  const remainingChars = maxLength - message.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!message.trim()) {
      setError("Please enter a message");
      return;
    }

    if (message.length > maxLength) {
      setError(`Message cannot exceed ${maxLength} characters`);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/swaps", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiverId,
          message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send swap request");
      }

      // Success
      setMessage("");
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setMessage("");
      setError("");
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="backdrop-blur-md bg-white/5 border border-neon-cyan/30 rounded-lg p-6 w-full max-w-lg neon-glow-cyan">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Request Swap
                </h2>
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="text-gray-400 hover:text-neon-cyan transition-colors disabled:opacity-50"
                >
                  <FiX size={24} />
                </button>
              </div>

              {/* Receiver Info */}
              <div className="mb-6">
                <p className="text-gray-300">
                  Sending swap request to{" "}
                  <span className="text-neon-cyan font-semibold">
                    {receiverName}
                  </span>
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                {/* Message Textarea */}
                <div className="mb-4">
                  <label
                    htmlFor="message"
                    className="block text-sm font-semibold text-gray-300 mb-2"
                  >
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Introduce yourself and explain what skills you'd like to exchange..."
                    disabled={isSubmitting}
                    className="w-full h-40 px-4 py-3 bg-black/30 border border-neon-cyan/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan focus:neon-glow-cyan transition-all resize-none disabled:opacity-50"
                    maxLength={maxLength}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span
                      className={`text-sm ${
                        remainingChars < 100
                          ? "text-neon-pink"
                          : "text-gray-400"
                      }`}
                    >
                      {remainingChars} characters remaining
                    </span>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 bg-neon-pink/10 border border-neon-pink/50 rounded-lg text-neon-pink text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-transparent border-2 border-gray-500 rounded-lg text-gray-300 font-semibold hover:bg-gray-500/10 transition-all duration-300 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    disabled={isSubmitting || !message.trim()}
                    whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                    whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                    className="flex-1 py-3 bg-transparent border-2 border-neon-cyan rounded-lg text-neon-cyan font-semibold hover:bg-neon-cyan/10 hover:neon-glow-cyan transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <FiSend />
                        Send Request
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
