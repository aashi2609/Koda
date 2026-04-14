"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Navigation from "../components/Navigation";
import SwapRequestCard from "../components/SwapRequestCard";

interface SwapUser {
  _id: string;
  name: string;
  email: string;
  image?: string;
}

interface SwapRequest {
  _id: string;
  senderId: SwapUser;
  receiverId: SwapUser;
  message: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [incoming, setIncoming] = useState<SwapRequest[]>([]);
  const [outgoing, setOutgoing] = useState<SwapRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const [inRes, outRes] = await Promise.all([
        fetch("/api/swaps?type=incoming"),
        fetch("/api/swaps?type=outgoing"),
      ]);
      if (inRes.ok) {
        const d = await inRes.json();
        setIncoming(d.swapRequests || []);
      }
      if (outRes.ok) {
        const d = await outRes.json();
        setOutgoing(d.swapRequests || []);
      }
    } catch (err) {
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
    if (status === "authenticated") fetchRequests();
  }, [status, router, fetchRequests]);

  const handleUpdateStatus = async (id: string, newStatus: "accepted" | "rejected") => {
    try {
      const res = await fetch(`/api/swaps/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to update");
      }
      showToast(
        `Request ${newStatus === "accepted" ? "accepted" : "rejected"} successfully`,
        "success"
      );
      fetchRequests();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "An error occurred", "error");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00FFFF]" />
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <div className="relative min-h-screen bg-[#030303] pt-20 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background glows */}
        <div className="absolute top-40 left-10 w-72 h-72 bg-neon-cyan/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-40 right-10 w-72 h-72 bg-neon-pink/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-neon-cyan to-neon-pink bg-clip-text text-transparent mb-2">
              Dashboard
            </h1>
            <p className="text-gray-400">Manage your skill swap requests</p>
          </motion.div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Incoming Requests */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl font-bold text-neon-cyan">Incoming Requests</h2>
                <span className="px-2 py-0.5 bg-neon-cyan/10 border border-neon-cyan/40 rounded-full text-neon-cyan text-sm">
                  {incoming.length}
                </span>
              </div>
              <div className="space-y-4">
                {incoming.length === 0 ? (
                  <EmptyState message="No incoming requests yet" color="cyan" />
                ) : (
                  incoming.map((req, i) => (
                    <motion.div
                      key={req._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <SwapRequestCard
                        request={req}
                        type="incoming"
                        onUpdateStatus={handleUpdateStatus}
                      />
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Outgoing Requests */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl font-bold text-neon-pink">Outgoing Requests</h2>
                <span className="px-2 py-0.5 bg-neon-pink/10 border border-neon-pink/40 rounded-full text-neon-pink text-sm">
                  {outgoing.length}
                </span>
              </div>
              <div className="space-y-4">
                {outgoing.length === 0 ? (
                  <EmptyState message="No outgoing requests yet" color="pink" />
                ) : (
                  outgoing.map((req, i) => (
                    <motion.div
                      key={req._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <SwapRequestCard
                        request={req}
                        type="outgoing"
                        onUpdateStatus={handleUpdateStatus}
                      />
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Toast Notification */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-lg border backdrop-blur-md text-sm font-medium ${
                toast.type === "success"
                  ? "bg-neon-cyan/10 border-neon-cyan/50 text-neon-cyan"
                  : "bg-neon-pink/10 border-neon-pink/50 text-neon-pink"
              }`}
            >
              {toast.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

function EmptyState({ message, color }: { message: string; color: "cyan" | "pink" }) {
  const borderColor = color === "cyan" ? "border-neon-cyan/20" : "border-neon-pink/20";
  const textColor = color === "cyan" ? "text-gray-500" : "text-gray-500";
  return (
    <div className={`backdrop-blur-md bg-white/3 border ${borderColor} rounded-lg p-8 text-center`}>
      <p className={textColor}>{message}</p>
    </div>
  );
}
