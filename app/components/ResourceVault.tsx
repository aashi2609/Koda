"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FiLink, FiPlus, FiTrash2, FiExternalLink, FiX } from "react-icons/fi";
import { useState } from "react";
import { UploadButton } from "@/utils/uploadthing";

interface Resource {
  _id?: string;
  label: string;
  url: string;
}

interface ResourceVaultProps {
  resources: Resource[];
  swapId: string;
  onUpdate: (resources: Resource[]) => void;
}

export default function ResourceVault({ resources, swapId, onUpdate }: ResourceVaultProps) {
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const addResource = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalUrl = url;
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }

    if (!label.trim() || !finalUrl.trim() || loading) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/swaps/${swapId}/resources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, url: finalUrl }),
      });
      if (res.ok) {
        const data = await res.json();
        onUpdate(data.resources);
        setLabel("");
        setUrl("");
        setShowForm(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteResource = async (id: string) => {
    try {
      const res = await fetch(`/api/swaps/${swapId}/resources?resourceId=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const data = await res.json();
        onUpdate(data.resources);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="backdrop-blur-md bg-black/40 border border-white/10 rounded-2xl p-6 relative">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <FiLink className="text-[#00FFFF]" /> Resources
        </h3>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="text-white/50 hover:text-[#00FFFF] transition-colors"
        >
          {showForm ? <FiX /> : <FiPlus />}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-6 space-y-3"
            onSubmit={addResource}
          >
            <div className="flex flex-col gap-3">
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Label (e.g. Figma File)"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[#00FFFF]"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="URL or Upload File"
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[#00FFFF]"
                />
                <UploadButton
                  endpoint="resourceUploader"
                  onClientUploadComplete={(res) => {
                    if (res?.[0]) {
                      setUrl(res[0].url);
                      if (!label) setLabel(res[0].name || "Uploaded File");
                    }
                  }}
                  onUploadError={(error: Error) => {
                    console.error("Upload failed", error);
                  }}
                  appearance={{
                    button: "bg-white/5 border border-white/10 text-white/40 text-[10px] uppercase font-bold px-4 hover:bg-white/10 transition-all",
                    allowedContent: "hidden"
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={!label.trim() || !url.trim() || loading}
                className="w-full py-2 bg-[#00FFFF]/20 text-[#00FFFF] border border-[#00FFFF] rounded-lg text-sm font-semibold hover:bg-[#00FFFF]/30 disabled:opacity-50"
              >
                Add to Vault
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
        <AnimatePresence>
          {resources.length === 0 && !showForm ? (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-white/40 text-sm text-center py-4">
              Add links to docs, repositories, or tools here.
            </motion.p>
          ) : (
            resources.map((r) => (
              <motion.div
                key={r._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative flex items-center bg-white/5 border border-white/10 rounded-xl p-3 hover:border-white/20 transition-all"
              >
                <div className="flex-1 min-w-0 pr-8">
                  <p className="text-white text-sm font-medium truncate">{r.label}</p>
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-white/50 text-xs truncate hover:text-[#00FFFF] transition-colors flex items-center gap-1 mt-1">
                    {r.url} <FiExternalLink />
                  </a>
                </div>
                <button
                  onClick={() => deleteResource(r._id!)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-[#FF00FF] opacity-0 group-hover:opacity-100 transition-all"
                >
                  <FiTrash2 />
                </button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
