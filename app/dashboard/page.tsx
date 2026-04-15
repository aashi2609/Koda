"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Navigation from "../components/Navigation";
import SwapRequestCard from "../components/SwapRequestCard";
import dynamic from "next/dynamic";
import Skeleton, { DashboardStatSkeleton, UserCardSkeleton } from "../components/Skeleton";

const Aurora = dynamic(() => import("../components/Aurora"), { ssr: false });

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
  status: "pending" | "negotiating" | "active" | "completed" | "rejected";
  createdAt: string;
}

export default function DashboardPage() {
  const { status } = useSession();
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

  const handleUpdateStatus = async (id: string, newStatus: string) => {
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
        `Request updated to ${newStatus} successfully`,
        "success"
      );
      fetchRequests();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "An error occurred", "error");
    }
  };

  if (status === "loading" || loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-[#030303] pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
              <div className="space-y-4">
                <Skeleton className="w-64 h-12" />
                <Skeleton className="w-96 h-6" />
              </div>
              <div className="flex gap-8">
                <DashboardStatSkeleton />
                <DashboardStatSkeleton />
                <DashboardStatSkeleton />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <UserCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  const activeSwaps = [...incoming, ...outgoing].filter(s => ["negotiating", "active"].includes(s.status));
  const completedSwaps = [...incoming, ...outgoing].filter(s => s.status === "completed");
  const pendingIncoming = incoming.filter(s => s.status === "pending");
  const pendingOutgoing = outgoing.filter(s => s.status === "pending");

  return (
    <>
      <Navigation />
      <div className="relative min-h-screen bg-[#030303] pt-24 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Aurora background */}
        <div className="fixed inset-0 z-0 opacity-30 pointer-events-none">
          <Aurora colorStops={["#00FFFF", "#5500FF", "#FF00FF"]} blend={0.4} amplitude={1.0} speed={0.6} />
        </div>

        {/* Background glows */}
        <div className="absolute top-40 left-10 w-72 h-72 bg-[#00FFFF]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-40 right-10 w-72 h-72 bg-[#FF00FF]/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6"
          >
            <div>
              <h1 className="text-5xl font-extrabold bg-gradient-to-r from-[#00FFFF] to-[#FF00FF] bg-clip-text text-transparent mb-3 tracking-tighter">
                DASHBOARD
              </h1>
              <p className="text-white/40 font-medium">Coordinate your peer-to-peer learning sessions.</p>
            </div>

            {/* Stats Ribbon */}
            <div className="flex gap-4 sm:gap-8">
              {[
                { label: "Total Swaps", count: incoming.length + outgoing.length, color: "white" },
                { label: "Active Learning", count: activeSwaps.length, color: "#00FFFF" },
                { label: "Completed", count: completedSwaps.length, color: "#FF00FF" },
              ].map((stat, i) => (
                <div key={i} className="text-right">
                  <div className="text-xs font-bold uppercase tracking-widest text-white/30 mb-1">{stat.label}</div>
                  <div className="text-3xl font-black text-white" style={{ color: stat.color }}>{stat.count}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Active Sessions Section */}
          {activeSwaps.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-12">
              <h2 className="text-xl font-bold text-[#00FFFF] mb-6 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#00FFFF] animate-pulse" />
                Active Sessions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeSwaps.map((req) => (
                  <SwapRequestCard
                    key={req._id}
                    request={req}
                    type={incoming.find(i => i._id === req._id) ? "incoming" : "outgoing"}
                    onUpdateStatus={handleUpdateStatus}
                  />
                ))}
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Incoming Section */}
            <div>
              <h2 className="text-xl font-bold text-white mb-6 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  Incoming Requests
                  <span className="text-[10px] uppercase bg-white/5 border border-white/10 px-2 py-0.5 rounded text-white/40 font-bold tracking-wider">RECEIVED</span>
                </span>
                <span className="text-xs bg-white/10 px-2 py-1 rounded-md text-white/60">{incoming.length}</span>
              </h2>
              <div className="space-y-4">
                {pendingIncoming.length === 0 ? (
                  <EmptyState message="No pending incoming requests" />
                ) : (
                  pendingIncoming.map((req) => (
                    <SwapRequestCard key={req._id} request={req} type="incoming" onUpdateStatus={handleUpdateStatus} />
                  ))
                )}
              </div>
            </div>

            {/* Outgoing Section */}
            <div>
              <h2 className="text-xl font-bold text-white mb-6 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  Sent Requests
                  <span className="text-[10px] uppercase bg-white/5 border border-white/10 px-2 py-0.5 rounded text-white/40 font-bold tracking-wider">OUTGOING</span>
                </span>
                <span className="text-xs bg-white/10 px-2 py-1 rounded-md text-white/60">{outgoing.length}</span>
              </h2>
              <div className="space-y-4">
                {pendingOutgoing.length === 0 ? (
                  <EmptyState message="No pending outgoing requests" />
                ) : (
                  pendingOutgoing.map((req) => (
                    <SwapRequestCard key={req._id} request={req} type="outgoing" onUpdateStatus={handleUpdateStatus} />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Completed Section (Optional) */}
          {completedSwaps.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-16">
              <h2 className="text-xl font-bold text-[#FF00FF] mb-6">Completed Swaps</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60 grayscale hover:grayscale-0 transition-all">
                {completedSwaps.map((req) => (
                  <SwapRequestCard
                    key={req._id}
                    request={req}
                    type={incoming.find(i => i._id === req._id) ? "incoming" : "outgoing"}
                    onUpdateStatus={handleUpdateStatus}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Toast Notification */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 50, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 50, x: "-50%" }}
              className={`fixed bottom-8 left-1/2 z-50 px-6 py-4 rounded-2xl border backdrop-blur-xl text-sm font-bold tracking-tight shadow-2xl ${
                toast.type === "success"
                  ? "bg-[#00FFFF]/10 border-[#00FFFF]/50 text-[#00FFFF]"
                  : "bg-[#FF00FF]/10 border-[#FF00FF]/50 text-[#FF00FF]"
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

function EmptyState({ message }: { message: string }) {
  return (
    <div className="backdrop-blur-md bg-white/3 border border-white/10 rounded-2xl p-10 text-center">
      <p className="text-white/20 text-sm font-medium">{message}</p>
    </div>
  );
}
