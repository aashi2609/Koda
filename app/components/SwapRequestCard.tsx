"use client";

import { motion } from "framer-motion";
import { FiCheck, FiX, FiUser, FiClock } from "react-icons/fi";

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

interface SwapRequestCardProps {
  request: SwapRequest;
  type: "incoming" | "outgoing";
  onUpdateStatus: (id: string, status: "accepted" | "rejected") => void;
}

function StatusBadge({ status }: { status: "pending" | "accepted" | "rejected" }) {
  const styles = {
    pending: "bg-yellow-500/10 border-yellow-500/40 text-yellow-400",
    accepted: "bg-neon-cyan/10 border-neon-cyan/40 text-neon-cyan",
    rejected: "bg-neon-pink/10 border-neon-pink/40 text-neon-pink",
  };
  const icons = {
    pending: <FiClock className="text-xs" />,
    accepted: <FiCheck className="text-xs" />,
    rejected: <FiX className="text-xs" />,
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-medium capitalize ${styles[status]}`}
    >
      {icons[status]}
      {status}
    </span>
  );
}

export default function SwapRequestCard({ request, type, onUpdateStatus }: SwapRequestCardProps) {
  const otherUser = type === "incoming" ? request.senderId : request.receiverId;
  const label = type === "incoming" ? "From" : "To";

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="backdrop-blur-md bg-white/5 border border-neon-cyan/20 rounded-lg p-5 hover:border-neon-cyan/40 transition-all duration-300"
    >
      {/* User info row */}
      <div className="flex items-center justify-between mb-3">
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
            <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
            <p className="text-white font-semibold">{otherUser?.name}</p>
          </div>
        </div>
        <StatusBadge status={request.status} />
      </div>

      {/* Message */}
      <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3">
        {request.message}
      </p>

      {/* Date */}
      <p className="text-gray-600 text-xs mb-4">
        {new Date(request.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </p>

      {/* Action buttons — only for incoming pending requests */}
      {type === "incoming" && request.status === "pending" && (
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onUpdateStatus(request._id, "accepted")}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-transparent border-2 border-neon-cyan rounded-lg text-neon-cyan text-sm font-semibold hover:bg-neon-cyan/10 transition-all duration-300"
          >
            <FiCheck />
            Accept
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onUpdateStatus(request._id, "rejected")}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-transparent border-2 border-neon-pink rounded-lg text-neon-pink text-sm font-semibold hover:bg-neon-pink/10 transition-all duration-300"
          >
            <FiX />
            Reject
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}
