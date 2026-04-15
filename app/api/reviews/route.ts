import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/apiAuth";
import dbConnect from "@/lib/dbConnect";
import Review from "@/models/Review";
import User from "@/models/User";
import SwapRequest from "@/models/SwapRequest";

export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const { session } = authResult;

  try {
    await dbConnect();
    const body = await req.json();
    const { swapId, rating, comment } = body;

    if (!swapId || !rating) {
      return NextResponse.json({ error: "Swap ID and rating are required" }, { status: 400 });
    }

    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const swap = await SwapRequest.findById(swapId);
    if (!swap) return NextResponse.json({ error: "Swap not found" }, { status: 404 });

    // Determine reviewee
    const isSender = swap.senderId.toString() === currentUser._id.toString();
    const revieweeId = isSender ? swap.receiverId : swap.senderId;

    // Create review
    const review = await Review.create({
      swapId,
      reviewerId: currentUser._id,
      revieweeId,
      rating,
      comment
    });

    // Update reviewee stats
    const reviewee = await User.findById(revieweeId);
    if (reviewee) {
      const allReviews = await Review.find({ revieweeId });
      const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
      
      reviewee.reviewCount = allReviews.length;
      reviewee.averageRating = Number((totalRating / allReviews.length).toFixed(1));
      await reviewee.save();
    }

    return NextResponse.json({ message: "Review submitted successfully", review });
  } catch (error) {
    console.error("Review submission error:", error);
    interface MongoError extends Error {
      code?: number;
    }
    if ((error as MongoError).code === 11000) {
      return NextResponse.json({ error: "You have already reviewed this swap" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
