"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { FaGithub, FaGoogle } from "react-icons/fa";
import { FiArrowRight, FiZap, FiUsers, FiRepeat, FiStar } from "react-icons/fi";
import dynamic from "next/dynamic";

import { useRouter } from "next/navigation";

const FloatingLines = dynamic(() => import("./components/FloatingLines"), { ssr: false });
import SplitText from "./components/SplitText";

/* ─── data ─────────────────────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: <FiRepeat className="text-3xl" />,
    title: "Skill Swap",
    desc: "Teach what you know, learn what you don't. Every exchange is mutual.",
    color: "cyan",
  },
  {
    icon: <FiUsers className="text-3xl" />,
    title: "Community",
    desc: "Connect with developers and students who share your curiosity.",
    color: "pink",
  },
  {
    icon: <FiZap className="text-3xl" />,
    title: "Instant Match",
    desc: "Filter by skill and find your perfect swap partner in seconds.",
    color: "cyan",
  },
  {
    icon: <FiStar className="text-3xl" />,
    title: "Zero Cost",
    desc: "No money changes hands. Knowledge is the only currency here.",
    color: "pink",
  },
];

const STEPS = [
  { num: "01", title: "Sign In", desc: "Use GitHub or Google — no new password needed." },
  { num: "02", title: "Set Your Skills", desc: "List what you can teach and what you want to learn." },
  { num: "03", title: "Discover", desc: "Browse the feed and filter by skills you need." },
  { num: "04", title: "Swap", desc: "Send a request, agree on a format, and start learning." },
];

/* ─── animated gradient border card ────────────────────────────────────────── */
function GlowCard({
  children,
  color,
  delay = 0,
}: {
  children: React.ReactNode;
  color: "cyan" | "pink";
  delay?: number;
}) {
  const glowColor = color === "cyan" ? "rgba(0,255,255,0.6)" : "rgba(255,0,255,0.6)";
  const borderColor = color === "cyan" ? "#00FFFF" : "#FF00FF";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{
        scale: 1.05,
        rotateX: 3,
        rotateY: -3,
        boxShadow: `0 0 30px ${glowColor}, 0 0 60px ${glowColor.replace("0.6", "0.2")}`,
      }}
      style={{ perspective: 800, transformStyle: "preserve-3d" }}
      className="relative group rounded-2xl p-[1px] transition-all duration-300"
    >
      {/* Animated gradient border */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(135deg, #00FFFF, #FF00FF, #00FFFF)`,
          backgroundSize: "200% 200%",
          animation: "gradientShift 3s ease infinite",
          padding: "1px",
        }}
      />
      {/* Static border */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{ border: `1px solid ${borderColor}30` }}
      />
      {/* Card body */}
      <div className="relative backdrop-blur-md bg-black/40 border border-white/10 rounded-2xl p-8 h-full transition-all duration-300 group-hover:bg-black/60">
        {children}
      </div>
    </motion.div>
  );
}

/* ─── component ─────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="relative min-h-screen bg-[#030303] text-white overflow-x-hidden">

      {/* gradient shift keyframe */}
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 8px rgba(0,255,255,0.4), 0 0 16px rgba(0,255,255,0.2); }
          50% { box-shadow: 0 0 20px rgba(0,255,255,0.8), 0 0 40px rgba(0,255,255,0.4); }
        }
        .btn-pulse { animation: pulseGlow 2.5s ease-in-out infinite; }
        .btn-pulse:hover { animation: none; box-shadow: 0 0 20px rgba(0,255,255,0.8), 0 0 40px rgba(0,255,255,0.5); }
      `}</style>

      {/* ── FLOATING LINES BACKGROUND ─────────────────────────────────── */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{ position: "fixed" }}>
        <FloatingLines
          linesGradient={["#00FFFF", "#8800FF", "#FF00FF", "#6a6a6a"]}
          enabledWaves={["top", "middle", "bottom"]}
          lineCount={8}
          lineDistance={8}
          bendRadius={8}
          bendStrength={-2}
          interactive={false}
          parallax={false}
          animationSpeed={0.6}
        />
      </div>

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#030303]/70 border-b border-white/10"
      >
        <div className="relative max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-2xl font-bold bg-gradient-to-r from-[#00FFFF] to-[#FF00FF] bg-clip-text text-transparent tracking-widest">
            KODA
          </span>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => router.push("/register")}
              className="hidden sm:flex items-center gap-2 px-4 py-2 border border-white/20 rounded-lg text-sm text-white hover:text-[#00FFFF] hover:border-[#00FFFF] transition-all"
            >
              <FaGithub /> GitHub
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => router.push("/register")}
              className="btn-pulse flex items-center gap-2 px-4 py-2 bg-[#00FFFF]/10 border border-[#00FFFF] rounded-lg text-sm text-[#00FFFF] font-semibold hover:bg-[#00FFFF]/20 transition-all"
            >
              Get Started <FiArrowRight />
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-6 pt-16 z-10">
        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 max-w-5xl mx-auto text-center">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-10 backdrop-blur-md bg-white/5 border border-[#00FFFF]/30 rounded-full text-[#00FFFF] text-sm"
          >
            <FiZap className="text-xs" />
            Peer to Peer Skill Exchange
          </motion.div>

          {/* SplitText headline */}
          <div className="mb-6 flex flex-col items-center gap-2">
            {/* Line 1 — gradient */}
            <div className="overflow-visible">
              <SplitText
                text="Learn One."
                tag="h1"
                className="text-6xl sm:text-8xl lg:text-9xl font-extrabold leading-tight tracking-tight"
                delay={80}
                duration={0.7}
                initialDelay={0.2}
                textAlign="center"
                gradientClass="bg-gradient-to-r from-[#00FFFF] via-white to-[#FF00FF] bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]"
              />
            </div>
            {/* Line 2 — white */}
            <div className="overflow-visible">
              <SplitText
                text="Teach One."
                tag="h1"
                className="text-6xl sm:text-8xl lg:text-9xl font-extrabold leading-tight tracking-tight text-white drop-shadow-[0_0_10px_rgba(255,0,255,0.5)]"
                delay={80}
                duration={0.7}
                initialDelay={0.9}
                textAlign="center"
              />
            </div>
          </div>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-lg sm:text-xl text-white font-medium max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Koda connects developers and students who want to swap skills. You teach
            what you know — they teach what you need. No money. Just knowledge.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(0,255,255,0.8)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/register")}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 backdrop-blur-md bg-black/40 border border-[#00FFFF] rounded-xl text-[#00FFFF] font-semibold text-lg hover:bg-[#00FFFF]/10 transition-all group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00FFFF]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <FaGithub className="text-xl relative z-10" />
              <span className="relative z-10">Continue with GitHub</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(255,0,255,0.8)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/register")}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 backdrop-blur-md bg-black/40 border border-[#FF00FF] rounded-xl text-[#FF00FF] font-semibold text-lg hover:bg-[#FF00FF]/10 transition-all group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FF00FF]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <FaGoogle className="text-xl relative z-10" />
              <span className="relative z-10">Continue with Google</span>
            </motion.button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-6 text-white/50 text-sm"
          >
            Free forever · No credit card · Sign in with your existing account
          </motion.p>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/40 z-10"
        >
          <div className="w-px h-10 bg-gradient-to-b from-transparent to-[#00FFFF]/40" />
          <span className="text-xs tracking-widest uppercase">Scroll</span>
        </motion.div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────── */}
      <section className="relative py-28 px-6 z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-[#00FFFF] text-sm tracking-widest uppercase mb-3">Why Koda</p>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-[#00FFFF] drop-shadow-[0_0_8px_rgba(0,255,255,0.7)]">
              Skills are the new currency
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <GlowCard key={f.title} color={f.color as "cyan" | "pink"} delay={i * 0.1}>
                <div className={`mb-4 ${f.color === "cyan" ? "text-[#00FFFF]" : "text-[#FF00FF]"}`}>
                  {f.icon}
                </div>
                <h3 className="text-white font-extrabold text-lg mb-3">{f.title}</h3>
                <p className="text-white font-medium text-sm leading-relaxed">{f.desc}</p>
              </GlowCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────── */}
      <section className="relative py-28 px-6 z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-[#FF00FF] text-sm tracking-widest uppercase mb-3">How it works</p>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white">
              Four steps to your first swap
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <GlowCard key={s.num} color={i % 2 === 0 ? "cyan" : "pink"} delay={i * 0.12}>
                <div className="text-5xl font-extrabold bg-gradient-to-br from-[#00FFFF] to-[#FF00FF] bg-clip-text text-transparent mb-4 leading-none">
                  {s.num}
                </div>
                <h3 className="text-white font-extrabold text-lg mb-2">{s.title}</h3>
                <p className="text-white font-medium text-sm leading-relaxed">{s.desc}</p>
              </GlowCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="relative py-28 px-6 z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto text-center backdrop-blur-md bg-black/40 border border-white/10 rounded-3xl p-12 sm:p-16 relative overflow-hidden"
        >
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#00FFFF]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#FF00FF]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <motion.h2
              animate={{ textShadow: ["0 0 20px rgba(0,255,255,0.4)", "0 0 30px rgba(255,0,255,0.4)", "0 0 20px rgba(0,255,255,0.4)"] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-[#00FFFF] to-[#FF00FF] bg-clip-text text-transparent mb-4"
            >
              Ready to swap?
            </motion.h2>
            <p className="text-white font-medium text-lg mb-10">
              Join the community. Sign in and start exchanging skills today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(0,255,255,0.8)" }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push("/register")}
                className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-black/40 border-2 border-[#00FFFF] rounded-xl text-[#00FFFF] font-semibold hover:bg-[#00FFFF]/10 transition-all"
              >
                <FaGithub className="text-xl" /> Sign in with GitHub
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(255,0,255,0.8)" }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push("/register")}
                className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-black/40 border-2 border-[#FF00FF] rounded-xl text-[#FF00FF] font-semibold hover:bg-[#FF00FF]/10 transition-all"
              >
                <FaGoogle className="text-xl" /> Sign in with Google
              </motion.button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/10 py-8 px-6">
        <div className="relative max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xl font-bold bg-gradient-to-r from-[#00FFFF] to-[#FF00FF] bg-clip-text text-transparent tracking-widest">
            KODA
          </span>
          <p className="text-white/60 text-sm">© {new Date().getFullYear()} Koda · Peer-to-Peer Skill Exchange</p>
          <p className="text-white/40 text-xs">Built with Next.js · MongoDB · Auth.js</p>
        </div>
      </footer>
    </div>
  );
}
