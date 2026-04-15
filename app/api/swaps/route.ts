import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/apiAuth";
import dbConnect from "@/lib/dbConnect";
import SwapRequest from "@/models/SwapRequest";
import User from "@/models/User";
import mongoose from "mongoose";
import { sendSwapRequestEmail } from "@/lib/mail";

/**
 * POST /api/swaps
 * Creates a new swap request
 */
export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) {
    return authResult;
  }

  const { session } = authResult;

  try {
    await dbConnect();

    const body = await req.json();
    const { receiverId, message } = body;

    // Validate required fields
    if (!receiverId || !message) {
      return NextResponse.json(
        { error: "receiverId and message are required" },
        { status: 400 }
      );
    }

    // Validate message length
    if (message.length > 1000) {
      return NextResponse.json(
        { error: "Message cannot exceed 1000 characters" },
        { status: 400 }
      );
    }

    // Validate receiverId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return NextResponse.json(
        { error: "Invalid receiverId" },
        { status: 400 }
      );
    }

    // Get sender's user document to get their ObjectId
    const sender = await User.findOne({ email: session.user.email });
    if (!sender) {
      return NextResponse.json(
        { error: "Sender not found" },
        { status: 404 }
      );
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return NextResponse.json(
        { error: "Receiver not found" },
        { status: 404 }
      );
    }

    // Prevent sending request to self
    if (sender._id.toString() === receiverId) {
      return NextResponse.json(
        { error: "Cannot send swap request to yourself" },
        { status: 400 }
      );
    }

    // Check for existing active/pending request
    const existingRequest = await SwapRequest.findOne({
      senderId: sender._id,
      receiverId: receiverId,
      status: { $in: ["pending", "negotiating", "active"] },
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: `A swap is already ${existingRequest.status} with this user` },
        { status: 409 }
      );
    }

    // Create the swap request
    const swapRequest = await SwapRequest.create({
      senderId: sender._id,
      receiverId: receiverId,
      message: message,
      status: "pending",
    });

    // Populate user data for response
    await swapRequest.populate("senderId receiverId");

    // Send notification email to the receiver
    const senderName = sender.name;
    const receiverEmail = receiver.email;
    const receiverName = receiver.name;
    
    // Non-blocking email send
    sendSwapRequestEmail(receiverEmail, receiverName, senderName, message);

    return NextResponse.json(
      {
        message: "Swap request created successfully",
        swapRequest,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating swap request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/swaps?type=incoming|outgoing
 * Retrieves swap requests based on type
 */
export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) {
    return authResult;
  }

  const { session } = authResult;

  try {
    await dbConnect();

    // Get query parameter
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    // Validate type parameter
    if (!type || (type !== "incoming" && type !== "outgoing")) {
      return NextResponse.json(
        { error: "type query parameter must be 'incoming' or 'outgoing'" },
        { status: 400 }
      );
    }

    // Get current user's document
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    let swapRequests;

    if (type === "incoming") {
      // Get requests where current user is the receiver
      swapRequests = await SwapRequest.find({
        receiverId: currentUser._id,
      })
        .populate("senderId", "name email image bio skillsOffered skillsDesired")
        .populate("receiverId", "name email image bio skillsOffered skillsDesired")
        .sort({ createdAt: -1 });
    } else {
      // Get requests where current user is the sender
      swapRequests = await SwapRequest.find({
        senderId: currentUser._id,
      })
        .populate("senderId", "name email image bio skillsOffered skillsDesired")
        .populate("receiverId", "name email image bio skillsOffered skillsDesired")
        .sort({ createdAt: -1 });
    }

    return NextResponse.json({
      swapRequests,
    });
  } catch (error) {
    console.error("Error fetching swap requests:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
