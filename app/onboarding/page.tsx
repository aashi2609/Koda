"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import dynamic from "next/dynamic";
import Navigation from "../components/Navigation";

const Aurora = dynamic(() => import("../components/Aurora"), { ssr: false });

export default function OnboardingPage() {
  const router = useRouter();
  const [bio, setBio] = useState("");
  const [skillsOffered, setSkillsOffered] = useState<string[]>([]);
  const [skillsDesired, setSkillsDesired] = useState<string[]>([]);
  const [currentOffered, setCurrentOffered] = useState("");
  const [currentDesired, setCurrentDesired] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const addSkill = (
    val: string, list: string[], setList: (v: string[]) => void, setVal: (v: string) => void
  ) => {
    const trimmed = val.trim();
    if (trimmed && !list.includes(trimmed)) setList([...list, trimmed]);
    setVal("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (skillsOffered.length === 0 || skillsDesired.length === 0) {
      setError("Please add at least one skill in each category");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio, skillsOffered, skillsDesired }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to update profile");
      router.push("/discover");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsSubmitting(false);
    }
  };

  const isValid = skillsOffered.length > 0 && skillsDesired.length > 0;

  return (
    <>
      <Navigation />
      <div className="relative min-h-screen bg-[#030303] flex items-center justify-center p-4 pt-24 overflow-hidden">

        {/* Aurora background */}
        <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
          <Aurora colorStops={["#00FFFF", "#5500FF", "#FF00FF"]} blend={0.5} amplitude={1.0} speed={0.8} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 w-full max-w-2xl"
        >
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8 sm:p-10 shadow-2xl">

            <div className="text-center mb-8">
              <motion.h1
                animate={{ textShadow: ["0 0 20px rgba(0,255,255,0.5)", "0 0 30px rgba(255,0,255,0.5)", "0 0 20px rgba(0,255,255,0.5)"] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="text-4xl sm:text-5xl font-bold mb-2 bg-gradient-to-r from-[#00FFFF] via-[#FF00FF] to-[#00FFFF] bg-clip-text text-transparent"
              >
                Complete Your Profile
              </motion.h1>
              <p className="text-gray-400 text-sm">Tell us about your skills to get started</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Bio */}
              <div>
                <label className="block text-white font-medium mb-2">Bio</label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value.slice(0, 500))}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-[#00FFFF]/30 rounded-lg text-white placeholder-gray-500 outline-none focus:border-[#00FFFF] focus:shadow-[0_0_12px_rgba(0,255,255,0.4)] transition-all duration-300 resize-none"
                />
                <p className={`text-right text-xs mt-1 ${500 - bio.length < 50 ? "text-[#FF00FF]" : "text-gray-500"}`}>
                  {500 - bio.length} chars remaining
                </p>
              </div>

              {/* Skills Offered */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Skills I Can Offer <span className="text-[#00FFFF]">*</span>
                </label>
                <input
                  type="text" value={currentOffered}
                  onChange={e => setCurrentOffered(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill(currentOffered, skillsOffered, setSkillsOffered, setCurrentOffered); }}}
                  placeholder="Type a skill and press Enter"
                  className="w-full px-4 py-3 bg-white/5 border border-[#00FFFF]/30 rounded-lg text-white placeholder-gray-500 outline-none focus:border-[#00FFFF] focus:shadow-[0_0_12px_rgba(0,255,255,0.4)] transition-all duration-300"
                />
                <div className="flex flex-wrap gap-2 mt-3">
                  <AnimatePresence>
                    {skillsOffered.map(skill => (
                      <motion.span key={skill} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-[#00FFFF]/10 border border-[#00FFFF]/50 rounded-full text-[#00FFFF] text-sm"
                      >
                        {skill}
                        <button type="button" onClick={() => setSkillsOffered(p => p.filter(s => s !== skill))} className="hover:text-white transition-colors"><FiX /></button>
                      </motion.span>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Skills Desired */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Skills I Want to Learn <span className="text-[#FF00FF]">*</span>
                </label>
                <input
                  type="text" value={currentDesired}
                  onChange={e => setCurrentDesired(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill(currentDesired, skillsDesired, setSkillsDesired, setCurrentDesired); }}}
                  placeholder="Type a skill and press Enter"
                  className="w-full px-4 py-3 bg-white/5 border border-[#FF00FF]/30 rounded-lg text-white placeholder-gray-500 outline-none focus:border-[#FF00FF] focus:shadow-[0_0_12px_rgba(255,0,255,0.4)] transition-all duration-300"
                />
                <div className="flex flex-wrap gap-2 mt-3">
                  <AnimatePresence>
                    {skillsDesired.map(skill => (
                      <motion.span key={skill} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-[#FF00FF]/10 border border-[#FF00FF]/50 rounded-full text-[#FF00FF] text-sm"
                      >
                        {skill}
                        <button type="button" onClick={() => setSkillsDesired(p => p.filter(s => s !== skill))} className="hover:text-white transition-colors"><FiX /></button>
                      </motion.span>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm"
                >
                  {error}
                </motion.div>
              )}

              <motion.button
                type="submit" disabled={!isValid || isSubmitting}
                whileHover={isValid ? { scale: 1.02, boxShadow: "0 0 20px rgba(0,255,255,0.4)" } : {}}
                whileTap={isValid ? { scale: 0.98 } : {}}
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                  isValid
                    ? "bg-gradient-to-r from-[#00FFFF]/20 to-[#FF00FF]/20 border-2 border-[#00FFFF] text-[#00FFFF] hover:from-[#00FFFF]/30 hover:to-[#FF00FF]/30"
                    : "bg-gray-800 border-2 border-gray-700 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? "Saving..." : "Complete Profile"}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </>
  );
}
