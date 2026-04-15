"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { FaGithub, FaGoogle } from "react-icons/fa";
import { FiUser, FiMail, FiLock, FiAtSign, FiEye, FiEyeOff, FiCheck } from "react-icons/fi";
import Link from "next/link";
import dynamic from "next/dynamic";

const Aurora = dynamic(() => import("../components/Aurora"), { ssr: false });

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("Passwords do not match"); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, username: form.username, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed"); return; }
      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 outline-none focus:border-[#00FFFF] focus:shadow-[0_0_12px_rgba(0,255,255,0.3)] transition-all duration-300 text-sm";

  return (
    <div className="relative min-h-screen bg-[#030303] flex items-center justify-center p-4 overflow-hidden">
      {/* Aurora background */}
      <div className="fixed inset-0 z-0 opacity-50 pointer-events-none">
        <Aurora colorStops={["#00FFFF", "#5500AA", "#FF00FF"]} blend={0.5} amplitude={1.2} speed={0.7} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <span className="text-3xl font-extrabold bg-gradient-to-r from-[#00FFFF] to-[#FF00FF] bg-clip-text text-transparent tracking-widest cursor-pointer">
              KODA
            </span>
          </Link>
        </div>

        <div className="backdrop-blur-md bg-black/40 border border-white/10 rounded-2xl p-8 shadow-2xl">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 rounded-full bg-[#00FFFF]/10 border-2 border-[#00FFFF] flex items-center justify-center mx-auto mb-6">
                  <FiCheck className="text-[#00FFFF] text-3xl" />
                </div>
                <h2 className="text-2xl font-extrabold text-white mb-3">Check your inbox</h2>
                <p className="text-white/60 text-sm mb-6">
                  We sent a verification link to <span className="text-[#00FFFF]">{form.email}</span>.
                  Click it to activate your account.
                </p>
                <Link href="/login">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    className="px-6 py-3 border border-[#00FFFF] rounded-xl text-[#00FFFF] text-sm font-semibold hover:bg-[#00FFFF]/10 transition-all"
                  >
                    Go to Login
                  </motion.button>
                </Link>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h1 className="text-2xl font-extrabold text-white mb-1">Create Account</h1>
                <p className="text-white/40 text-sm mb-6">Join the skill exchange community</p>

                {/* OAuth buttons */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: "0 0 16px rgba(0,255,255,0.3)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => signIn("github", { callbackUrl: "/discover" })}
                    className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-medium hover:border-[#00FFFF]/50 transition-all"
                  >
                    <FaGithub /> GitHub
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: "0 0 16px rgba(255,0,255,0.3)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => signIn("google", { callbackUrl: "/discover" })}
                    className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-medium hover:border-[#FF00FF]/50 transition-all"
                  >
                    <FaGoogle /> Google
                  </motion.button>
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-white/30 text-xs">or register with email</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name */}
                  <div className="relative">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm" />
                    <input type="text" placeholder="Full Name" value={form.name} onChange={e => update("name", e.target.value)} required className={inputClass} />
                  </div>
                  {/* Username */}
                  <div className="relative">
                    <FiAtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm" />
                    <input type="text" placeholder="Username" value={form.username} onChange={e => update("username", e.target.value)} required className={inputClass} />
                  </div>
                  {/* Email */}
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm" />
                    <input type="email" placeholder="Email Address" value={form.email} onChange={e => update("email", e.target.value)} required className={inputClass} />
                  </div>
                  {/* Password */}
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm" />
                    <input type={showPass ? "text" : "password"} placeholder="Password (min 8 chars)" value={form.password} onChange={e => update("password", e.target.value)} required className={`${inputClass} pr-11`} />
                    <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                      {showPass ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {/* Confirm */}
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm" />
                    <input type={showPass ? "text" : "password"} placeholder="Confirm Password" value={form.confirm} onChange={e => update("confirm", e.target.value)} required className={inputClass} />
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="text-[#FF00FF] text-sm bg-[#FF00FF]/10 border border-[#FF00FF]/30 rounded-lg px-4 py-3"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <motion.button
                    type="submit" disabled={loading}
                    whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(0,255,255,0.4)" }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 bg-gradient-to-r from-[#00FFFF]/20 to-[#FF00FF]/20 border border-[#00FFFF] rounded-xl text-[#00FFFF] font-semibold text-sm hover:from-[#00FFFF]/30 hover:to-[#FF00FF]/30 transition-all disabled:opacity-50"
                  >
                    {loading ? "Creating account..." : "Create Account"}
                  </motion.button>
                </form>

                <p className="text-center text-white/40 text-sm mt-6">
                  Already have an account?{" "}
                  <Link href="/login" className="text-[#00FFFF] hover:text-[#00FFFF]/80 font-medium transition-colors">
                    Sign In
                  </Link>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
