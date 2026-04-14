"use client";

import { motion } from "framer-motion";
import { FiUser } from "react-icons/fi";

interface UserCardProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
    bio?: string;
    skillsOffered: string[];
    skillsDesired: string[];
  };
  onRequestSwap: (userId: string) => void;
}

export default function UserCard({ user, onRequestSwap }: UserCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="backdrop-blur-md bg-white/5 border border-neon-cyan/30 rounded-lg p-6 hover:border-neon-cyan/60 transition-all duration-300 hover:neon-glow-cyan"
    >
      {/* User Header */}
      <div className="flex items-center gap-4 mb-4">
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
          <h3 className="text-xl font-bold text-white">{user.name}</h3>
          <p className="text-gray-400 text-sm">{user.email}</p>
        </div>
      </div>

      {/* Bio */}
      {user.bio && (
        <p className="text-gray-300 text-sm mb-4 line-clamp-3">{user.bio}</p>
      )}

      {/* Skills Offered */}
      <div className="mb-4">
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
      <div className="mb-4">
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
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onRequestSwap(user.id)}
        className="w-full py-3 bg-transparent border-2 border-neon-cyan rounded-lg text-neon-cyan font-semibold hover:bg-neon-cyan/10 hover:neon-glow-cyan transition-all duration-300"
      >
        Request Swap
      </motion.button>
    </motion.div>
  );
}
