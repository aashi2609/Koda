import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/apiAuth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { bio, skillsOffered, skillsDesired, onboardingComplete } = body;

    // Validation
    if (!skillsOffered || !Array.isArray(skillsOffered) || skillsOffered.length === 0) {
      return NextResponse.json(
        { error: "At least one skill must be provided in skillsOffered" },
        { status: 400 }
      );
    }

    if (!skillsDesired || !Array.isArray(skillsDesired) || skillsDesired.length === 0) {
      return NextResponse.json(
        { error: "At least one skill must be provided in skillsDesired" },
        { status: 400 }
      );
    }

    if (bio && bio.length > 500) {
      return NextResponse.json(
        { error: "Bio cannot exceed 500 characters" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Build update object
    const updateData: Record<string, unknown> = {
      bio: bio || "",
      skillsOffered,
      skillsDesired,
    };

    // Set onboardingComplete if provided
    if (onboardingComplete) {
      updateData.onboardingComplete = true;
    }

    // Update user profile
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      updateData,
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        bio: updatedUser.bio,
        skillsOffered: updatedUser.skillsOffered,
        skillsDesired: updatedUser.skillsDesired,
        verifiedSkills: updatedUser.verifiedSkills,
        onboardingComplete: updatedUser.onboardingComplete,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        bio: user.bio,
        skillsOffered: user.skillsOffered,
        skillsDesired: user.skillsDesired,
        verifiedSkills: user.verifiedSkills,
        onboardingComplete: user.onboardingComplete,
      },
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
