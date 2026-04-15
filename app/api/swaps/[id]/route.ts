import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/apiAuth";
import dbConnect from "@/lib/dbConnect";
import SwapRequest from "@/models/SwapRequest";
import User from "@/models/User";
import mongoose from "mongoose";
import { sendSwapAcceptedEmail } from "@/lib/mail";

/**
 * GET /api/swaps/[id]
 * Fetch a single swap with full user details
 */
export async function GET(
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

    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const swap = await SwapRequest.findById(id)
      .populate("senderId", "name email image bio skillsOffered skillsDesired verifiedSkills")
      .populate("receiverId", "name email image bio skillsOffered skillsDesired verifiedSkills")
      .populate("chatMessages.senderId", "name image");

    if (!swap) {
      return NextResponse.json({ error: "Swap not found" }, { status: 404 });
    }

    // Only participants can view
    const isSender = swap.senderId._id.toString() === currentUser._id.toString();
    const isReceiver = swap.receiverId._id.toString() === currentUser._id.toString();
    if (!isSender && !isReceiver) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({ swap, currentUserId: currentUser._id.toString() });
  } catch (error) {
    console.error("Error fetching swap:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/swaps/[id]
 * Update swap status
 */
export async function PATCH(
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
      return NextResponse.json({ error: "Invalid request ID" }, { status: 400 });
    }

    const body = await req.json();
    const { status } = body;

    const validTransitions: Record<string, string[]> = {
      pending: ["negotiating", "rejected"],
      negotiating: ["active", "rejected"],
      active: ["completed"],
    };

    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const swapRequest = await SwapRequest.findById(id);
    if (!swapRequest) {
      return NextResponse.json({ error: "Swap request not found" }, { status: 404 });
    }

    // Check authorization: receiver can accept/reject pending, both can advance negotiating/active
    const isSender = swapRequest.senderId.toString() === currentUser._id.toString();
    const isReceiver = swapRequest.receiverId.toString() === currentUser._id.toString();

    if (!isSender && !isReceiver) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // For pending → negotiating/rejected, only receiver can act
    if (swapRequest.status === "pending" && !isReceiver) {
      return NextResponse.json({ error: "Only the receiver can accept or reject pending requests" }, { status: 403 });
    }

    // Validate status transition
    const allowed = validTransitions[swapRequest.status];
    if (!allowed || !allowed.includes(status)) {
      return NextResponse.json(
        { error: `Cannot transition from '${swapRequest.status}' to '${status}'` },
        { status: 400 }
      );
    }

    swapRequest.status = status;

    // Auto-generate Jitsi room ID when going active
    if (status === "active" && !swapRequest.jitsiRoomId) {
      swapRequest.jitsiRoomId = `koda-${id}-${Date.now().toString(36)}`;
    }

    // Send email notification on status changes
    if (status === "negotiating" && isReceiver) {
      // Reciever accepted the request
      const sender = await User.findById(swapRequest.senderId);
      if (sender) {
        sendSwapAcceptedEmail(sender.email, sender.name, currentUser.name);
      }
    }

    await swapRequest.save();
    await swapRequest.populate("senderId receiverId", "name email image");

    return NextResponse.json({ swapRequest });
  } catch (error) {
    console.error("Error updating swap request:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
