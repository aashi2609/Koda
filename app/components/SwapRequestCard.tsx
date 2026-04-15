"use client";

import { motion } from "framer-motion";
import { FiCheck, FiX, FiUser, FiClock, FiMessageSquare, FiPlay, FiExternalLink } from "react-icons/fi";
import Link from "next/link";

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

interface SwapRequestCardProps {
  request: SwapRequest;
  type: "incoming" | "outgoing";
  onUpdateStatus: (id: string, status: any) => void;
}

function StatusBadge({ status }: { status: any }) {
  const styles: any = {
    pending: "bg-yellow-500/10 border-yellow-500/40 text-yellow-500",
    negotiating: "bg-orange-500/10 border-orange-500/40 text-orange-500",
    active: "bg-neon-cyan/10 border-neon-cyan/40 text-neon-cyan",
    completed: "bg-green-500/10 border-green-500/40 text-green-500",
    rejected: "bg-neon-pink/10 border-neon-pink/40 text-neon-pink",
  };
  const icons: any = {
    pending: <FiClock className="text-xs" />,
    negotiating: <FiMessageSquare className="text-xs" />,
    active: <FiPlay className="text-xs" />,
    completed: <FiCheck className="text-xs" />,
    rejected: <FiX className="text-xs" />,
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${styles[status]}`}
    >
      {icons[status]}
      {status}
    </span>
  );
}

export default function SwapRequestCard({ request, type, onUpdateStatus }: SwapRequestCardProps) {
  const otherUser = type === "incoming" ? request.senderId : request.receiverId;
  const label = type === "incoming" ? "From" : "To";

  const showHubButton = ["negotiating", "active", "completed"].includes(request.status);

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-5 hover:border-neon-cyan/40 transition-all duration-300 relative overflow-hidden"
    >
      {/* User info row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {otherUser?.image ? (
            <img
              src={otherUser.image}
              alt={otherUser.name}
              className="w-10 h-10 rounded-full border-2 border-neon-cyan/30"
            />
          ) : (
            <div className="w-10 h-10 rounded-full border-2 border-neon-cyan/30 bg-neon-cyan/10 flex items-center justify-center">
              <FiUser className="text-neon-cyan" />
            </div>
          )}
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">{label}</p>
            <p className="text-white font-bold">{otherUser?.name}</p>
          </div>
        </div>
        <StatusBadge status={request.status} />
      </div>

      {/* Message */}
      <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2 italic">
        "{request.message}"
      </p>

      {/* Date */}
      <div className="flex justify-between items-center mt-auto">
        <p className="text-gray-600 text-[10px] uppercase tracking-tighter">
          {new Date(request.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>

        {showHubButton && (
          <Link href={`/swap/${request._id}`}>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 12px rgba(0,255,255,0.3)" }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-1.5 bg-neon-cyan/10 border border-neon-cyan/40 rounded-lg text-neon-cyan text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-neon-cyan/20 transition-all"
            >
              Open Hub <FiExternalLink />
            </motion.button>
          </Link>
        )}
      </div>

      {/* Action buttons — only for incoming pending requests */}
      {type === "incoming" && request.status === "pending" && (
        <div className="flex gap-3 mt-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onUpdateStatus(request._id, "negotiating")}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#00FFFF]/10 border border-[#00FFFF]/50 rounded-lg text-[#00FFFF] text-xs font-bold uppercase tracking-widest hover:bg-[#00FFFF]/20 transition-all"
          >
            <FiCheck /> Accept
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onUpdateStatus(request._id, "rejected")}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white/50 text-xs font-bold uppercase tracking-widest hover:border-neon-pink/50 hover:text-neon-pink transition-all"
          >
            <FiX /> Reject
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}
