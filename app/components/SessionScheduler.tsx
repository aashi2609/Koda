"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiCalendar, FiClock, FiPlus, FiExternalLink, FiCheck } from "react-icons/fi";
import { format } from "date-fns";

interface SessionSchedulerProps {
  swapId: string;
  currentSchedule?: string | Date;
  onUpdate: (newDate: Date) => void;
  partnerName: string;
}

export default function SessionScheduler({ swapId, currentSchedule, onUpdate, partnerName }: SessionSchedulerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  const handleSchedule = async () => {
    if (!selectedDate) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/swaps/${swapId}/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledAt: new Date(selectedDate) }),
      });
      if (res.ok) {
        const data = await res.json();
        onUpdate(new Date(data.scheduledAt));
        setShowPicker(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const getGoogleCalendarLink = () => {
    if (!currentSchedule) return "#";
    const start = new Date(currentSchedule);
    const end = new Date(start.getTime() + 60 * 60 * 1000); // +1 hour
    
    const fmt = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");
    
    const title = encodeURIComponent(`Koda Learning Session with ${partnerName}`);
    const details = encodeURIComponent(`Collaborative learning session on Koda. Check your dashboard for the Jitsi link: ${window.location.origin}/swap/${swapId}`);
    
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${fmt(start)}/${fmt(end)}`;
  };

  const formattedDate = currentSchedule 
    ? format(new Date(currentSchedule), "PPP") 
    : "Not Scheduled";
  const formattedTime = currentSchedule 
    ? format(new Date(currentSchedule), "p") 
    : "";

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold flex items-center gap-2">
          <FiCalendar className="text-[#00FFFF]" /> Schedule
        </h3>
        <button 
          onClick={() => setShowPicker(!showPicker)}
          className="text-white/40 hover:text-[#00FFFF] transition-colors"
        >
          {showPicker ? <FiPlus className="rotate-45" /> : <FiPlus />}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {showPicker ? (
          <motion.div
            key="picker"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="relative">
              <input
                type="datetime-local"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-white/5 border border-[#00FFFF]/30 rounded-lg p-3 text-white text-sm outline-none focus:border-[#00FFFF] transition-all [color-scheme:dark]"
              />
            </div>
            <button
              onClick={handleSchedule}
              disabled={loading || !selectedDate}
              className="w-full py-2 bg-[#00FFFF]/20 border border-[#00FFFF] rounded-lg text-[#00FFFF] text-sm font-bold hover:bg-[#00FFFF]/30 transition-all disabled:opacity-50"
            >
              {loading ? "Scheduling..." : "Confirm Time"}
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="display"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col justify-center"
          >
            {currentSchedule ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-2 bg-[#00FFFF]/10 rounded-lg text-[#00FFFF]">
                    <FiClock />
                  </div>
                  <div>
                    <div className="text-white font-semibold">{formattedDate}</div>
                    <div className="text-white/40 text-sm">{formattedTime}</div>
                  </div>
                </div>
                
                <a
                  href={getGoogleCalendarLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs text-[#00FFFF] hover:underline"
                >
                  <FiExternalLink /> Add to Google Calendar
                </a>
              </div>
            ) : (
              <div className="text-center py-4 border-2 border-dashed border-white/5 rounded-xl">
                <p className="text-white/20 text-sm">No session scheduled yet</p>
                <button 
                  onClick={() => setShowPicker(true)}
                  className="mt-2 text-xs text-[#00FFFF] hover:underline"
                >
                  Propose a time
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
