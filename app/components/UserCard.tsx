"use client";

import { motion } from "framer-motion";
import { FiUser, FiStar } from "react-icons/fi";

interface UserCardProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
    bio?: string;
    skillsOffered: string[];
    skillsDesired: string[];
    averageRating?: number;
    reviewCount?: number;
    hasActiveRequest?: boolean;
  };
  onRequestSwap: (userId: string) => void;
}

export default function UserCard({ user, onRequestSwap }: UserCardProps) {
  const isRequestDisabled = user.hasActiveRequest;
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="glass-dark rounded-2xl p-6 relative overflow-hidden group border border-white/5 hover:border-[#00FFFF]/30 transition-colors"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#00FFFF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      
      {/* User Header */}
      <div className="flex items-center gap-4 mb-4 relative z-10">
        {user.image ? (
          <img
            src={user.image}
            alt={user.name}
            className="w-16 h-16 rounded-full border-2 border-neon-cyan/50"
          />
        ) : (
          <div className="w-16 h-16 rounded-full border-2 border-neon-cyan/50 flex items-center justify-center bg-neon-cyan/10">
            <FiUser className="text-neon-cyan text-2xl" />
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-xl font-black font-heading text-white mb-1 group-hover:text-[#00FFFF] transition-colors">
            {user.name}
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex text-[#FFD700]">
              {[1, 2, 3, 4, 5].map((s) => (
                <FiStar
                  key={s}
                  size={12}
                  className={s <= Math.round(user.averageRating || 0) ? "fill-[#FFD700]" : "fill-transparent text-white/20"}
                />
              ))}
            </div>
            {user.reviewCount ? (
              <span className="text-[10px] text-white/30 font-bold uppercase tracking-wider">{user.reviewCount} Reviews</span>
            ) : (
              <span className="text-[10px] text-white/20 font-bold uppercase tracking-wider">New Mentor</span>
            )}
          </div>
        </div>
      </div>

      {/* Bio */}
      {user.bio && (
        <p className="text-gray-300 text-sm mb-4 line-clamp-3 relative z-10">{user.bio}</p>
      )}

      {/* Skills Offered */}
      <div className="mb-4 relative z-10">
        <h4 className="text-neon-cyan text-sm font-semibold mb-2">
          Skills Offered
        </h4>
        <div className="flex flex-wrap gap-2">
          {user.skillsOffered.map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-neon-cyan/10 border border-neon-cyan/50 rounded-full text-neon-cyan text-xs"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Skills Desired */}
      <div className="mb-4 relative z-10">
        <h4 className="text-neon-pink text-sm font-semibold mb-2">
          Skills Desired
        </h4>
        <div className="flex flex-wrap gap-2">
          {user.skillsDesired.map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-neon-pink/10 border border-neon-pink/50 rounded-full text-neon-pink text-xs"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Request Swap Button */}
      <motion.button
        whileHover={!isRequestDisabled ? { scale: 1.05 } : {}}
        whileTap={!isRequestDisabled ? { scale: 0.95 } : {}}
        onClick={() => !isRequestDisabled && onRequestSwap(user.id)}
        disabled={isRequestDisabled}
        className={`w-full py-3 bg-transparent border-2 rounded-lg font-semibold transition-all duration-300 ${
          isRequestDisabled
            ? "border-gray-600 text-gray-600 cursor-not-allowed"
            : "border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10 hover:neon-glow-cyan"
        }`}
      >
        {isRequestDisabled ? "Request Sent" : "Request Swap"}
      </motion.button>
    </motion.div>
  );
}
