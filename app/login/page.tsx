"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FaGithub, FaGoogle } from "react-icons/fa";
import { FiLock, FiEye, FiEyeOff, FiAtSign, FiCheck } from "react-icons/fi";
import Link from "next/link";
import dynamic from "next/dynamic";

const Aurora = dynamic(() => import("../components/Aurora"), { ssr: false });

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    if (params.get("verified") === "true") setInfo("Email verified! You can now sign in.");
    if (params.get("error") === "token_expired") setError("Verification link expired. Please register again.");
    if (params.get("error") === "OAuthAccountNotLinked") setError("This email is linked to another sign-in method.");
    if (params.get("error") === "EMAIL_NOT_VERIFIED") setError("Please verify your email before signing in.");
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        login,
        password,
        redirect: false,
      });
      if (res?.error) {
        if (res.error === "EMAIL_NOT_VERIFIED") setError("Please verify your email before signing in.");
        else setError("Invalid username/email or password.");
      } else {
        router.push("/discover");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 outline-none focus:border-[#00FFFF] focus:shadow-[0_0_12px_rgba(0,255,255,0.3)] transition-all duration-300 text-sm";

  return (
    <div className="relative min-h-screen bg-[#030303] flex items-center justify-center p-4 overflow-hidden">
      {/* Aurora background */}
      <div className="fixed inset-0 z-0 opacity-50 pointer-events-none">
        <Aurora colorStops={["#FF00FF", "#5500AA", "#00FFFF"]} blend={0.5} amplitude={1.0} speed={0.6} />
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
          <h1 className="text-2xl font-extrabold text-white mb-1">Welcome back</h1>
          <p className="text-white/40 text-sm mb-6">Sign in to your account</p>

          {/* Status messages */}
          <AnimatePresence>
            {info && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-[#00FFFF] text-sm bg-[#00FFFF]/10 border border-[#00FFFF]/30 rounded-lg px-4 py-3 mb-4"
              >
                <FiCheck /> {info}
              </motion.div>
            )}
            {error && (
              <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="text-[#FF00FF] text-sm bg-[#FF00FF]/10 border border-[#FF00FF]/30 rounded-lg px-4 py-3 mb-4"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* OAuth */}
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
            <span className="text-white/30 text-xs">or sign in with credentials</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <FiAtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm" />
              <input
                type="text" placeholder="Username or Email"
                value={login} onChange={e => setLogin(e.target.value)} required
                className={inputClass}
              />
            </div>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm" />
              <input
                type={showPass ? "text" : "password"} placeholder="Password"
                value={password} onChange={e => setPassword(e.target.value)} required
                className={`${inputClass} pr-11`}
              />
              <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                {showPass ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-[#00FFFF]/70 hover:text-[#00FFFF] text-xs transition-colors">
                Forgot Password?
              </Link>
            </div>

            <motion.button
              type="submit" disabled={loading}
              whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(0,255,255,0.4)" }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-gradient-to-r from-[#00FFFF]/20 to-[#FF00FF]/20 border border-[#00FFFF] rounded-xl text-[#00FFFF] font-semibold text-sm hover:from-[#00FFFF]/30 hover:to-[#FF00FF]/30 transition-all disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </motion.button>
          </form>

          <p className="text-center text-white/40 text-sm mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[#00FFFF] hover:text-[#00FFFF]/80 font-medium transition-colors">
              Create Account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
