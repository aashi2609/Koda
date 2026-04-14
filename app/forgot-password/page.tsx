"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMail, FiCheck } from "react-icons/fi";
import Link from "next/link";
import dynamic from "next/dynamic";

const Aurora = dynamic(() => import("../components/Aurora"), { ssr: false });

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error); return; }
      setSent(true);
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#030303] flex items-center justify-center p-4 overflow-hidden">
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
        <Aurora colorStops={["#00FFFF", "#330066", "#FF00FF"]} blend={0.4} amplitude={0.9} speed={0.5} />
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/"><span className="text-3xl font-extrabold bg-gradient-to-r from-[#00FFFF] to-[#FF00FF] bg-clip-text text-transparent tracking-widest">KODA</span></Link>
        </div>

        <div className="backdrop-blur-md bg-black/40 border border-white/10 rounded-2xl p-8 shadow-2xl">
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div key="sent" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                <div className="w-14 h-14 rounded-full bg-[#00FFFF]/10 border-2 border-[#00FFFF] flex items-center justify-center mx-auto mb-5">
                  <FiCheck className="text-[#00FFFF] text-2xl" />
                </div>
                <h2 className="text-xl font-extrabold text-white mb-2">Check your inbox</h2>
                <p className="text-white/50 text-sm mb-6">If that email exists, a reset link has been sent.</p>
                <Link href="/login"><span className="text-[#00FFFF] text-sm hover:underline">Back to Login</span></Link>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h1 className="text-2xl font-extrabold text-white mb-1">Forgot Password</h1>
                <p className="text-white/40 text-sm mb-6">Enter your email and we&apos;ll send a reset link.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm" />
                    <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required
                      className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 outline-none focus:border-[#00FFFF] focus:shadow-[0_0_12px_rgba(0,255,255,0.3)] transition-all text-sm"
                    />
                  </div>
                  {error && <p className="text-[#FF00FF] text-sm">{error}</p>}
                  <motion.button type="submit" disabled={loading}
                    whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(0,255,255,0.4)" }} whileTap={{ scale: 0.98 }}
                    className="w-full py-3 bg-gradient-to-r from-[#00FFFF]/20 to-[#FF00FF]/20 border border-[#00FFFF] rounded-xl text-[#00FFFF] font-semibold text-sm transition-all disabled:opacity-50"
                  >
                    {loading ? "Sending..." : "Send Reset Link"}
                  </motion.button>
                </form>
                <p className="text-center text-white/40 text-sm mt-5">
                  <Link href="/login" className="text-[#00FFFF] hover:underline">Back to Login</Link>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
