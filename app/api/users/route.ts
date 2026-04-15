import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/apiAuth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import SwapRequest from "@/models/SwapRequest";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (isErrorResponse(authResult)) {
      return authResult;
    }
    const { session } = authResult;

    if (!session.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    // Get the current user to exclude them from results
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get skill filter from query parameters
    const { searchParams } = new URL(req.url);
    const skillFilter = searchParams.get("skill");

    // Build query to exclude current user
    const query: Record<string, unknown> = {
      _id: { $ne: currentUser._id },
    };

    // Add skill filter if provided
    if (skillFilter) {
      query.skillsOffered = {
        $elemMatch: {
          $regex: new RegExp(skillFilter, "i"),
        },
      };
    }

    // Fetch users
    const users = await User.find(query).select(
      "name email image bio skillsOffered skillsDesired averageRating reviewCount createdAt"
    );

    // Get active swap requests sent by current user to any of these users
    const activeRequests = await SwapRequest.find({
      senderId: currentUser._id,
      receiverId: { $in: users.map(u => u._id) },
      status: { $in: ["pending", "negotiating", "active"] }
    });

    const activeReceiverIds = new Set(activeRequests.map(r => r.receiverId.toString()));

    return NextResponse.json({
      users: users.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        bio: user.bio,
        skillsOffered: user.skillsOffered,
        skillsDesired: user.skillsDesired,
        averageRating: user.averageRating || 0,
        reviewCount: user.reviewCount || 0,
        createdAt: user.createdAt,
        hasActiveRequest: activeReceiverIds.has(user._id.toString()),
      })),
    });
  } catch (error) {
    console.error("Users fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
