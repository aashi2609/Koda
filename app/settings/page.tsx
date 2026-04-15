"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiUpload, FiUser, FiSave } from "react-icons/fi";
import dynamic from "next/dynamic";
import Navigation from "../components/Navigation";

const Aurora = dynamic(() => import("../components/Aurora"), { ssr: false });

function TagInput({
  label, tags, color, onAdd, onRemove, placeholder,
}: {
  label: string; tags: string[]; color: "cyan" | "pink";
  onAdd: (t: string) => void; onRemove: (t: string) => void; placeholder: string;
}) {
  const [val, setVal] = useState("");
  const c = color === "cyan" ? "#00FFFF" : "#FF00FF";
  const borderClass = color === "cyan" ? "border-[#00FFFF]/30 focus:border-[#00FFFF] focus:shadow-[0_0_12px_rgba(0,255,255,0.4)]" : "border-[#FF00FF]/30 focus:border-[#FF00FF] focus:shadow-[0_0_12px_rgba(255,0,255,0.4)]";
  const tagClass = color === "cyan" ? "bg-[#00FFFF]/10 border-[#00FFFF]/50 text-[#00FFFF]" : "bg-[#FF00FF]/10 border-[#FF00FF]/50 text-[#FF00FF]";

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && val.trim()) {
      e.preventDefault();
      if (!tags.includes(val.trim())) onAdd(val.trim());
      setVal("");
    }
  };

  return (
    <div>
      <label className="block text-white font-medium mb-2">
        {label} <span style={{ color: c }}>*</span>
      </label>
      <input
        type="text" value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={handleKey}
        placeholder={placeholder}
        className={`w-full px-4 py-3 bg-white/5 backdrop-blur-md border rounded-lg text-white placeholder-gray-500 outline-none transition-all duration-300 ${borderClass}`}
      />
      <div className="flex flex-wrap gap-2 mt-3">
        <AnimatePresence>
          {tags.map(tag => (
            <motion.span
              key={tag}
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
              className={`inline-flex items-center gap-2 px-3 py-1 border rounded-full text-sm ${tagClass}`}
            >
              {tag}
              <button type="button" onClick={() => onRemove(tag)} className="hover:text-white transition-colors">
                <FiX />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [bio, setBio] = useState("");
  const [skillsOffered, setSkillsOffered] = useState<string[]>([]);
  const [skillsDesired, setSkillsDesired] = useState<string[]>([]);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
    if (status === "authenticated") {
      fetch("/api/profile").then(r => r.json()).then(d => {
        if (d.user) {
          setBio(d.user.bio || "");
          setSkillsOffered(d.user.skillsOffered || []);
          setSkillsDesired(d.user.skillsDesired || []);
          setAvatarPreview(d.user.image || session?.user?.image || null);
        }
      });
    }
  }, [status, router, session]);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio, skillsOffered, skillsDesired }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      showToast("Profile updated successfully", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "An error occurred", "error");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00FFFF]" />
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <div className="relative min-h-screen bg-[#030303] pt-20 pb-12 px-4 overflow-hidden">

        {/* Aurora background */}
        <div className="fixed inset-0 z-0 opacity-30 pointer-events-none">
          <Aurora colorStops={["#00FFFF", "#8800FF", "#FF00FF"]} blend={0.4} amplitude={0.8} speed={0.5} />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#00FFFF] to-[#FF00FF] bg-clip-text text-transparent mb-2 drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">
              Settings
            </h1>
            <p className="text-gray-400">Update your profile and skills</p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSave}
            className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8 space-y-8"
          >
            {/* Avatar */}
            <div>
              <label className="block text-white font-medium mb-4">Avatar</label>
              <div className="flex items-center gap-6">
                <div
                  className="relative w-20 h-20 rounded-full border-2 border-[#00FFFF]/50 overflow-hidden cursor-pointer group"
                  onClick={() => fileRef.current?.click()}
                >
                  {avatarPreview ? (
                    <Image src={avatarPreview} alt="avatar" width={80} height={80} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#00FFFF]/10 flex items-center justify-center">
                      <FiUser className="text-[#00FFFF] text-2xl" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <FiUpload className="text-white text-xl" />
                  </div>
                </div>
                <div>
                  <p className="text-gray-300 text-sm">Click avatar to upload</p>
                  <p className="text-gray-500 text-xs mt-1">PNG, JPG up to 2MB</p>
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-white font-medium mb-2">Bio</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value.slice(0, 500))}
                placeholder="Tell the community about yourself..."
                rows={4}
                className="w-full px-4 py-3 bg-white/5 backdrop-blur-md border border-[#00FFFF]/30 rounded-lg text-white placeholder-gray-500 outline-none focus:border-[#00FFFF] focus:shadow-[0_0_12px_rgba(0,255,255,0.4)] transition-all duration-300 resize-none"
              />
              <p className={`text-right text-xs mt-1 ${500 - bio.length < 50 ? "text-[#FF00FF]" : "text-gray-500"}`}>
                {500 - bio.length} chars remaining
              </p>
            </div>

            {/* Skills */}
            <TagInput
              label="Skills I Can Offer" tags={skillsOffered} color="cyan"
              onAdd={t => setSkillsOffered(p => [...p, t])}
              onRemove={t => setSkillsOffered(p => p.filter(s => s !== t))}
              placeholder="Type a skill and press Enter"
            />
            <TagInput
              label="Skills I Want to Learn" tags={skillsDesired} color="pink"
              onAdd={t => setSkillsDesired(p => [...p, t])}
              onRemove={t => setSkillsDesired(p => p.filter(s => s !== t))}
              placeholder="Type a skill and press Enter"
            />

            {/* Save */}
            <motion.button
              type="submit" disabled={saving}
              whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(0,255,255,0.4)" }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-[#00FFFF]/20 to-[#FF00FF]/20 border-2 border-[#00FFFF] rounded-xl text-[#00FFFF] font-semibold text-lg hover:from-[#00FFFF]/30 hover:to-[#FF00FF]/30 transition-all duration-300 disabled:opacity-50"
            >
              <FiSave />
              {saving ? "Saving..." : "Save Changes"}
            </motion.button>
          </motion.form>
        </div>

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
              className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-lg border backdrop-blur-md text-sm font-medium ${
                toast.type === "success"
                  ? "bg-[#00FFFF]/10 border-[#00FFFF]/50 text-[#00FFFF]"
                  : "bg-[#FF00FF]/10 border-[#FF00FF]/50 text-[#FF00FF]"
              }`}
            >
              {toast.msg}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
