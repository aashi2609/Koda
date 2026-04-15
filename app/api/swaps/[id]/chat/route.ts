import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/apiAuth";
import dbConnect from "@/lib/dbConnect";
import SwapRequest from "@/models/SwapRequest";
import User from "@/models/User";
import { getPusherServer } from "@/lib/pusher";

// GET chat history
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const { session } = authResult;

  try {
    await dbConnect();
    const { id } = await params;

    const swap = await SwapRequest.findById(id).populate("chatMessages.senderId", "name image");
    if (!swap) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const isParticipant =
      swap.senderId.toString() === currentUser._id.toString() ||
      swap.receiverId.toString() === currentUser._id.toString();

    if (!isParticipant) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    return NextResponse.json({ messages: swap.chatMessages });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// POST new chat message
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const { session } = authResult;

  try {
    await dbConnect();
    const { id } = await params;
    const { text } = await req.json();

    if (!text?.trim()) return NextResponse.json({ error: "Message empty" }, { status: 400 });

    const swap = await SwapRequest.findById(id);
    if (!swap) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const isParticipant =
      swap.senderId.toString() === currentUser._id.toString() ||
      swap.receiverId.toString() === currentUser._id.toString();

    if (!isParticipant) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const message = {
      senderId: currentUser._id,
      text,
      timestamp: new Date()
    };

    swap.chatMessages.push(message as never);
    await swap.save();

    const populatedSwap = await SwapRequest.findById(id).populate("chatMessages.senderId", "name image");
    const lastMessage = populatedSwap?.chatMessages[populatedSwap.chatMessages.length - 1];

    try {
      const pusher = getPusherServer();
      await pusher.trigger(`private-swap-${id}`, "new-message", lastMessage);
    } catch (pusherErr) {
      console.error("Pusher error:", pusherErr);
      // Fallback works, just no realtime
    }

    return NextResponse.json({ message: lastMessage });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
