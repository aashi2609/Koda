"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiVideo, FiCheckCircle } from "react-icons/fi";
import Navigation from "../../components/Navigation";
import MilestoneChecklist from "../../components/MilestoneChecklist";
import ResourceVault from "../../components/ResourceVault";
import SwapChat from "../../components/SwapChat";
import VerifiedBadge from "../../components/VerifiedBadge";
import MagicBento from "../../components/MagicBento";
import SessionScheduler from "../../components/SessionScheduler";
import ReviewModal from "../../components/ReviewModal";
import dynamic from "next/dynamic";

const Aurora = dynamic(() => import("../../components/Aurora"), { ssr: false });

export default function SwapHubPage() {
  const { id } = useParams() as { id: string };
  const { data: session, status } = useSession();
  const router = useRouter();

  const [swap, setSwap] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    const fetchSwap = async () => {
      try {
        const res = await fetch(`/api/swaps/${id}`);
        if (!res.ok) throw new Error("Failed to load swap");
        const data = await res.json();
        setSwap(data.swap);
        setCurrentUserId(data.currentUserId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading swap");
      } finally {
        setLoading(false);
      }
    };
    if (status === "authenticated") fetchSwap();
  }, [id, status]);

  const updateStatus = async (newStatus: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/swaps/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        setSwap((prev: any) => ({ ...prev, status: data.swapRequest.status, jitsiRoomId: data.swapRequest.jitsiRoomId }));
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/swaps/${id}/complete`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setSwap(data.swap);
        if (data.swap.status === "completed") {
          setShowReviewModal(true);
        }
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00FFFF]" />
      </div>
    );
  }

  if (error || !swap) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center text-white">
        {error || "Swap not found"}
      </div>
    );
  }

  const isSender = swap.senderId._id === currentUserId;
  const partner = isSender ? swap.receiverId : swap.senderId;
  const isCompleted = swap.status === "completed";

  const bentoCards = [
    {
      className: "bento-card-hub",
      label: swap.status,
      title: "Session Hub",
      description: `Collaborating with ${partner.name}`,
      content: (
        <div className="flex-1 flex flex-col justify-end">
          {isCompleted ? (
            <VerifiedBadge />
          ) : (
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              {swap.status === "negotiating" && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => updateStatus("active")}
                  disabled={actionLoading}
                  className="flex-1 py-4 bg-gradient-to-r from-[#00FFFF]/20 to-[#FF00FF]/20 border border-[#00FFFF] rounded-xl text-[#00FFFF] font-semibold text-sm hover:from-[#00FFFF]/30 hover:to-[#FF00FF]/30 transition-all text-center"
                >
                  {actionLoading ? "Starting..." : "Start Learning (Move to Active)"}
                </motion.button>
              )}

              {swap.status === "active" && (
                <>
                  <motion.a
                    href={`https://meet.jit.si/${swap.jitsiRoomId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-4 flex items-center justify-center gap-2 bg-[#00FFFF]/10 border border-[#00FFFF] rounded-xl text-[#00FFFF] font-semibold text-sm hover:bg-[#00FFFF]/20 transition-all"
                  >
                    <FiVideo className="text-lg" /> Join Meeting
                  </motion.a>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleMarkComplete}
                    disabled={actionLoading || (isSender ? swap.learnerMarked : swap.mentorVerified)}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 border rounded-xl text-sm font-semibold transition-all ${
                      (isSender ? swap.learnerMarked : swap.mentorVerified)
                        ? "bg-white/10 border-white/20 text-white/50 cursor-not-allowed"
                        : "bg-[#FF00FF]/10 border-[#FF00FF] text-[#FF00FF] hover:bg-[#FF00FF]/20 cursor-pointer"
                    }`}
                  >
                    <FiCheckCircle className="text-lg" />
                    {(isSender ? swap.learnerMarked : swap.mentorVerified) ? "Verifying..." : (isSender ? "Mark as Learned" : "Verify Skill Taught")}
                  </motion.button>
                </>
              )}
            </div>
          )}
          {swap.status === "active" && !isCompleted && (
            <div className="mt-4 text-center text-xs text-white/40 italic">
              {swap.learnerMarked && !swap.mentorVerified && isSender && "Waiting for mentor to verify..."}
              {swap.mentorVerified && !swap.learnerMarked && !isSender && "Waiting for learner to mark as learned..."}
            </div>
          )}
        </div>
      )
    },
    {
      className: "bento-card-chat",
      label: "Live Chat",
      content: <SwapChat swapId={swap._id} currentUserId={currentUserId} />
    },
    {
      className: "bento-card-milestones",
      label: "Progress",
      content: (
        <MilestoneChecklist 
          milestones={swap.milestones || []} 
          swapId={swap._id} 
          onUpdate={(mcs) => setSwap({ ...swap, milestones: mcs })} 
        />
      )
    },
    {
      className: "bento-card-resources",
      label: "Vault",
      content: (
        <ResourceVault 
          resources={swap.resources || []} 
          swapId={swap._id} 
          onUpdate={(resList) => setSwap({ ...swap, resources: resList })} 
        />
      )
    },
    {
      className: "bento-card-schedule",
      label: "Calendar",
      content: (
        <SessionScheduler 
          swapId={swap._id}
          currentSchedule={swap.scheduledAt}
          partnerName={partner.name}
          onUpdate={(newDate) => setSwap({ ...swap, scheduledAt: newDate })}
        />
      )
    }
  ];

  return (
    <>
      <Navigation />
      <div className="relative min-h-screen bg-[#030303] pt-24 pb-12 px-4 overflow-hidden">
        {/* Aurora background */}
        <div className="fixed inset-0 z-0 opacity-30 pointer-events-none">
          <Aurora colorStops={["#00FFFF", "#5500FF", "#FF00FF"]} blend={0.4} amplitude={1.0} speed={0.6} />
        </div>

        {/* Ambient background glows */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#00FFFF]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-[#FF00FF]/5 rounded-full blur-[120px] pointer-events-none" />

        <MagicBento 
          cardData={bentoCards}
          textAutoHide={false}
          enableStars={true}
          enableSpotlight={true}
          enableBorderGlow={true}
          enableTilt={true}
          enableMagnetism={true}
          clickEffect={true}
          spotlightRadius={400}
          particleCount={15}
          glowColor="0, 255, 255"
        />

        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          swapId={swap._id}
          partnerName={partner.name}
        />
      </div>
    </>
  );
}
