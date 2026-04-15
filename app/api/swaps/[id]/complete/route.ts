import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/apiAuth";
import dbConnect from "@/lib/dbConnect";
import SwapRequest from "@/models/SwapRequest";
import User from "@/models/User";
import { sendSwapCompletionEmail } from "@/lib/mail";

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
    
    // We expect the client to indicate what role they are acting as (or we deduce it)
    // Actually it's better to deduce from DB to avoid spoofing
    const swap = await SwapRequest.findById(id);
    if (!swap) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const isSender = swap.senderId.toString() === currentUser._id.toString();
    const isReceiver = swap.receiverId.toString() === currentUser._id.toString();

    if (!isSender && !isReceiver) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    if (swap.status !== "active") return NextResponse.json({ error: "Swap is not active" }, { status: 400 });

    // The user initiates the completion toggle.
    // If the sender toggles, mark mentorVerified or learnerMarked depending on who is who.
    // We assume the receiver of the request is the mentor (the person offering the skill).
    if (isReceiver) {
      swap.mentorVerified = !swap.mentorVerified;
    } else {
      swap.learnerMarked = !swap.learnerMarked;
    }

    // Check if both have completed
    if (swap.mentorVerified && swap.learnerMarked) {
      swap.status = "completed";
      
      // Move skill from desired to verified for the learner (sender)
      if (swap.skillBeingSwapped) {
        const learner = await User.findById(swap.senderId);
        if (learner) {
          // Remove from desired
          learner.skillsDesired = learner.skillsDesired.filter(s => s !== swap.skillBeingSwapped);
          // Add to verified
          if (!learner.verifiedSkills.includes(swap.skillBeingSwapped)) {
            learner.verifiedSkills.push(swap.skillBeingSwapped);
          }
          await learner.save();
        }
      }

      // Send celebratory emails to both participants
      const sender = await User.findById(swap.senderId);
      const receiver = await User.findById(swap.receiverId);
      if (sender && receiver) {
        sendSwapCompletionEmail(sender.email, sender.name, receiver.name);
        sendSwapCompletionEmail(receiver.email, receiver.name, sender.name);
      }
    }

    await swap.save();

    return NextResponse.json({ 
      swap: await swap.populate("senderId receiverId", "name email image"),
    });

  } catch (err) {
    console.error("Complete error", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
