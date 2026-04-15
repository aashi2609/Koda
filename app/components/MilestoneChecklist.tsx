"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FiCheck, FiX, FiPlus, FiTrash2 } from "react-icons/fi";
import { useState } from "react";

interface Milestone {
  _id?: string;
  title: string;
  completed: boolean;
}

interface MilestoneChecklistProps {
  milestones: Milestone[];
  swapId: string;
  onUpdate: (milestones: Milestone[]) => void;
}

export default function MilestoneChecklist({ milestones, swapId, onUpdate }: MilestoneChecklistProps) {
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const addMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || loading) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/swaps/${swapId}/milestones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      if (res.ok) {
        const data = await res.json();
        onUpdate(data.milestones);
        setNewTitle("");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMilestone = async (id: string, completed: boolean) => {
    try {
      const res = await fetch(`/api/swaps/${swapId}/milestones`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestoneId: id, completed: !completed }),
      });
      if (res.ok) {
        const data = await res.json();
        onUpdate(data.milestones);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteMilestone = async (id: string) => {
    try {
      const res = await fetch(`/api/swaps/${swapId}/milestones?milestoneId=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const data = await res.json();
        onUpdate(data.milestones);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const progress = milestones.length > 0 
    ? Math.round((milestones.filter(m => m.completed).length / milestones.length) * 100) 
    : 0;

  return (
    <div className="backdrop-blur-md bg-black/40 border border-white/10 rounded-2xl p-6 relative">
      <h3 className="text-xl font-bold text-white mb-4 flex justify-between items-center">
        Milestones
        <span className="text-sm font-normal text-[#00FFFF]">{progress}%</span>
      </h3>
      
      {/* Progress bar */}
      <div className="h-1.5 w-full bg-white/10 rounded-full mb-6 overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-gradient-to-r from-[#00FFFF] to-[#FF00FF]"
        />
      </div>

      <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto pr-2">
        <AnimatePresence>
          {milestones.length === 0 ? (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-white/40 text-sm text-center py-4">
              No milestones yet. Add one to track progress.
            </motion.p>
          ) : (
            milestones.map((m) => (
              <motion.div
                key={m._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-3 bg-white/5 border border-white/10 p-3 rounded-xl group transition-all hover:bg-white/10"
              >
                <button
                  onClick={() => toggleMilestone(m._id!, m.completed)}
                  className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                    m.completed 
                      ? "bg-[#00FFFF] border-[#00FFFF] text-black" 
                      : "border-white/30 text-transparent hover:border-[#00FFFF]"
                  }`}
                >
                  <FiCheck className="text-sm" />
                </button>
                <span className={`flex-1 text-sm transition-all ${m.completed ? "text-white/50 line-through" : "text-white"}`}>
                  {m.title}
                </span>
                <button
                  onClick={() => deleteMilestone(m._id!)}
                  className="text-white/20 hover:text-[#FF00FF] opacity-0 group-hover:opacity-100 transition-all"
                >
                  <FiTrash2 />
                </button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <form onSubmit={addMilestone} className="relative">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="New milestone..."
          className="w-full bg-transparent border border-white/20 rounded-xl pl-4 pr-12 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#00FFFF] transition-all"
        />
        <button
          type="submit"
          disabled={!newTitle.trim() || loading}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-[#00FFFF]/20 text-[#00FFFF] rounded-lg hover:bg-[#00FFFF]/40 disabled:opacity-50 transition-all"
        >
          <FiPlus />
        </button>
      </form>
    </div>
  );
}
