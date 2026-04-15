"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { FiSearch, FiX } from "react-icons/fi";
import Navigation from "../components/Navigation";
import UserCard from "../components/UserCard";
import { UserCardSkeleton } from "../components/Skeleton";
import SwapRequestModal from "../components/SwapRequestModal";
import dynamic from "next/dynamic";

const Aurora = dynamic(() => import("../components/Aurora"), { ssr: false });

interface User {
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
}

export default function DiscoverPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [skillFilter, setSkillFilter] = useState("");
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const checkProfile = async () => {
      if (status === "authenticated") {
        try {
          const response = await fetch("/api/profile");
          if (response.ok) {
            const data = await response.json();
            const user = data.user;

            // Redirect to onboarding if profile is incomplete
            if (
              !user.skillsOffered ||
              user.skillsOffered.length === 0 ||
              !user.skillsDesired ||
              user.skillsDesired.length === 0
            ) {
              router.push("/onboarding");
            }
          }
        } catch (error) {
          console.error("Profile check error:", error);
        }
      }
    };

    checkProfile();
  }, [status, router]);

  const fetchUsers = useCallback(async () => {
    if (status !== "authenticated") return;

    try {
      setLoading(true);
      setError("");

      const url = skillFilter
        ? `/api/users?skill=${encodeURIComponent(skillFilter)}`
        : "/api/users";

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [status, skillFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRequestSwap = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setIsModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleSwapSuccess = () => {
    setSuccessMessage("Swap request sent successfully!");
    fetchUsers(); // Refresh list to update button state
    setTimeout(() => setSuccessMessage(""), 5000);
  };

  const handleClearFilter = () => {
    setSkillFilter("");
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00FFFF] mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <div className="relative min-h-screen bg-[#030303] pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        {/* Aurora background */}
        <div className="fixed inset-0 z-0 opacity-30 pointer-events-none">
          <Aurora colorStops={["#00FFFF", "#5500FF", "#FF00FF"]} blend={0.4} amplitude={1.0} speed={0.6} />
        </div>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-neon-cyan to-neon-pink bg-clip-text text-transparent mb-2">
              Discover Skills
            </h1>
            <p className="text-gray-400">
              Find people to exchange skills with
            </p>
          </motion.div>

          {/* Filter Bar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neon-cyan text-xl" />
              <input
                type="text"
                placeholder="Filter by skill (e.g., React, Python, Design...)"
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                className="w-full pl-12 pr-12 py-4 bg-white/5 backdrop-blur-md border border-[#00FFFF]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00FFFF] focus:neon-glow-cyan transition-all duration-300"
              />
              {skillFilter && (
                <button
                  onClick={handleClearFilter}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-neon-pink transition-colors"
                >
                  <FiX className="text-xl" />
                </button>
              )}
            </div>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400"
            >
              {error}
            </motion.div>
          )}

          {/* Success Message */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-8 p-4 bg-neon-cyan/10 border border-[#00FFFF]/50 rounded-lg text-neon-cyan"
            >
              {successMessage}
            </motion.div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00FFFF]"></div>
            </div>
          )}

          {/* Empty State */}
          {!loading && users.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="backdrop-blur-md bg-white/5 border border-neon-pink/30 rounded-lg p-12 max-w-md mx-auto">
                <h3 className="text-2xl font-bold text-neon-pink mb-4">
                  No Users Found
                </h3>
                <p className="text-gray-400 mb-6">
                  {skillFilter
                    ? `No users found offering "${skillFilter}". Try a different skill or clear the filter.`
                    : "No users available for skill exchange at the moment."}
                </p>
                {skillFilter && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleClearFilter}
                    className="px-6 py-3 bg-transparent border-2 border-neon-pink rounded-lg text-neon-pink font-semibold hover:bg-neon-pink/10 transition-all duration-300"
                  >
                    Clear Filter
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}

          {/* User Grid */}
          {!loading && users.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {users.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <UserCard user={user} onRequestSwap={handleRequestSwap} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Swap Request Modal */}
      {selectedUser && (
        <SwapRequestModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          receiverName={selectedUser.name}
          receiverId={selectedUser.id}
          onSuccess={handleSwapSuccess}
        />
      )}
    </>
  );
}
