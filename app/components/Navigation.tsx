"use client";

import { signOut, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { FiLogOut, FiUser, FiSettings } from "react-icons/fi";
import Link from "next/link";

export default function Navigation() {
  const { data: session } = useSession();
  if (!session) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#030303]/80 border-b border-[#00FFFF]/20">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/discover">
            <motion.span whileHover={{ scale: 1.05 }} className="text-2xl font-bold bg-gradient-to-r from-[#00FFFF] to-[#FF00FF] bg-clip-text text-transparent tracking-widest cursor-pointer">
              KODA
            </motion.span>
          </Link>

          <div className="flex items-center gap-6">
            {[
              { href: "/discover", label: "Discover" },
              { href: "/dashboard", label: "Dashboard" },
            ].map(({ href, label }) => (
              <Link key={href} href={href}>
                <motion.span whileHover={{ scale: 1.05 }} className="text-gray-300 hover:text-[#00FFFF] transition-colors cursor-pointer text-sm">
                  {label}
                </motion.span>
              </Link>
            ))}

            <div className="flex items-center gap-3 ml-2 pl-4 border-l border-[#00FFFF]/20">
              {session.user?.image ? (
                <motion.img
                  whileHover={{ scale: 1.1 }}
                  src={session.user.image} alt={session.user.name || "User"}
                  className="w-8 h-8 rounded-full border-2 border-[#00FFFF]/50"
                />
              ) : (
                <div className="w-8 h-8 rounded-full border-2 border-[#00FFFF]/50 flex items-center justify-center bg-[#00FFFF]/10">
                  <FiUser className="text-[#00FFFF]" />
                </div>
              )}

              <Link href="/settings">
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-3 py-2 border border-[#00FFFF]/30 rounded-lg text-gray-400 hover:text-[#00FFFF] hover:border-[#00FFFF] hover:bg-[#00FFFF]/10 transition-all duration-300"
                  title="Settings"
                >
                  <FiSettings />
                </motion.button>
              </Link>

              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-2 px-3 py-2 border border-[#FF00FF]/40 rounded-lg text-gray-400 hover:text-[#FF00FF] hover:border-[#FF00FF] hover:bg-[#FF00FF]/10 transition-all duration-300"
                title="Logout"
              >
                <FiLogOut />
                <span className="hidden sm:inline text-sm">Logout</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
