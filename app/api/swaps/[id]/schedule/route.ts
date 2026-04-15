import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/apiAuth";
import dbConnect from "@/lib/dbConnect";
import SwapRequest from "@/models/SwapRequest";
import User from "@/models/User";
import mongoose from "mongoose";

/**
 * POST /api/swaps/[id]/schedule
 * Set or update the scheduled time for a swap
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const { session } = authResult;

  try {
    await dbConnect();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid swap ID" }, { status: 400 });
    }

    const body = await req.json();
    const { scheduledAt } = body;

    if (!scheduledAt) {
      return NextResponse.json({ error: "Schedule date is required" }, { status: 400 });
    }

    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const swap = await SwapRequest.findById(id);
    if (!swap) return NextResponse.json({ error: "Swap not found" }, { status: 404 });

    // Only participants can schedule
    const isSender = swap.senderId.toString() === currentUser._id.toString();
    const isReceiver = swap.receiverId.toString() === currentUser._id.toString();
    
    if (!isSender && !isReceiver) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    swap.scheduledAt = new Date(scheduledAt);
    await swap.save();

    return NextResponse.json({ 
      message: "Session scheduled successfully",
      scheduledAt: swap.scheduledAt 
    });
  } catch (error) {
    console.error("Scheduling error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
