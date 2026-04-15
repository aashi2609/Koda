"use client";

import { useState, useEffect, useRef } from "react";
import Pusher from "pusher-js";
import { motion } from "framer-motion";
import { FiSend } from "react-icons/fi";

interface Message {
  _id?: string;
  senderId: { _id: string; name: string; image?: string } | string;
  text: string;
  timestamp: string;
}

interface SwapChatProps {
  swapId: string;
  currentUserId: string;
}

export default function SwapChat({ swapId, currentUserId }: SwapChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch initial history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/swaps/${swapId}/chat`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [swapId]);

  // Handle pusher subscription
  useEffect(() => {
    // Determine key either from env or dummy to avoid breaking UI if not set
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    if (!pusherKey) return; // Silent return if pusher not configured

    const pusher = new Pusher(pusherKey, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap2",
      authEndpoint: "/api/pusher/auth",
    });

    const channel = pusher.subscribe(`private-swap-${swapId}`);
    
    channel.bind("new-message", (msg: Message) => {
      setMessages((prev) => {
        // Prevent duplicate append if we just sent it
        if (prev.find(m => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      scrollToBottom();
    });

    return () => {
      pusher.unsubscribe(`private-swap-${swapId}`);
      pusher.disconnect();
    };
  }, [swapId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const text = input;
    setInput("");

    try {
      const res = await fetch(`/api/swaps/${swapId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      
      if (res.ok) {
        const data = await res.json();
        // Optimistic append, but verify _id to prevent dupes in pusher callback
        setMessages((prev) => {
          if (prev.find(m => m._id === data.message._id)) return prev;
          return [...prev, data.message];
        });
        scrollToBottom();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getSenderIdStr = (senderId: Message["senderId"]) => {
    if (typeof senderId === "string") return senderId;
    return senderId?._id || senderId;
  };

  return (
    <div className="backdrop-blur-md bg-black/40 border border-white/10 rounded-2xl flex flex-col h-[500px] overflow-hidden relative shadow-2xl">
      <div className="px-6 py-4 border-b border-white/10 bg-white/5">
        <h3 className="font-bold text-white text-lg">Negotiation Chat</h3>
        <p className="text-xs text-white/50">Discuss milestones and swap details real-time</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00FFFF]" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-white/40 text-sm">
            Say hi! Start discussing the swap details.
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = getSenderIdStr(msg.senderId) === currentUserId;
            return (
              <motion.div
                key={msg._id || idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col max-w-[80%] ${isMe ? "ml-auto items-end" : "mr-auto items-start"}`}
              >
                <div 
                  className={`px-4 py-2 rounded-2xl ${
                    isMe 
                      ? "bg-gradient-to-r from-[#00FFFF]/80 to-[#00FFFF] text-black rounded-br-none" 
                      : "bg-white/10 text-white rounded-bl-none border border-white/5"
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
                <span className="text-[10px] text-white/30 mt-1 px-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white/5 border-t border-white/10">
        <form onSubmit={sendMessage} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-[#030303] border border-white/20 rounded-full pl-5 pr-12 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#00FFFF] transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="absolute right-2 w-10 h-10 flex items-center justify-center bg-gradient-to-r from-[#00FFFF] to-[#FF00FF] rounded-full text-black hover:opacity-90 disabled:opacity-50 disabled:grayscale transition-all"
          >
            <FiSend className="ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
}
