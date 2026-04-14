import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/apiAuth";
import dbConnect from "@/lib/dbConnect";
import SwapRequest from "@/models/SwapRequest";
import User from "@/models/User";
import mongoose from "mongoose";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const { session } = authResult;

  try {
    await dbConnect();

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid request ID" }, { status: 400 });
    }

    const body = await req.json();
    const { status } = body;

    if (!status || !["accepted", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Status must be 'accepted' or 'rejected'" },
        { status: 400 }
      );
    }

    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const swapRequest = await SwapRequest.findById(id);
    if (!swapRequest) {
      return NextResponse.json({ error: "Swap request not found" }, { status: 404 });
    }

    // Only the receiver can update the status
    if (swapRequest.receiverId.toString() !== currentUser._id.toString()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (swapRequest.status !== "pending") {
      return NextResponse.json(
        { error: "Can only update pending requests" },
        { status: 400 }
      );
    }

    swapRequest.status = status;
    await swapRequest.save();

    await swapRequest.populate("senderId receiverId", "name email image");

    return NextResponse.json({ swapRequest });
  } catch (error) {
    console.error("Error updating swap request:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
