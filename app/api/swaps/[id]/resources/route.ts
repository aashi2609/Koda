import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/apiAuth";
import dbConnect from "@/lib/dbConnect";
import SwapRequest from "@/models/SwapRequest";
import User from "@/models/User";

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
    const { label, url } = await req.json();

    if (!label?.trim() || !url?.trim()) {
      return NextResponse.json({ error: "Label and URL required" }, { status: 400 });
    }

    const swap = await SwapRequest.findById(id);
    if (!swap) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const isParticipant =
      swap.senderId.toString() === currentUser._id.toString() ||
      swap.receiverId.toString() === currentUser._id.toString();

    if (!isParticipant) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    swap.resources.push({ label, url });
    await swap.save();

    return NextResponse.json({ resources: swap.resources });
  } catch (err) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const { session } = authResult;

  try {
    await dbConnect();
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const resourceId = searchParams.get("resourceId");

    if (!resourceId) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const swap = await SwapRequest.findById(id);
    if (!swap) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const isParticipant =
      swap.senderId.toString() === currentUser._id.toString() ||
      swap.receiverId.toString() === currentUser._id.toString();

    if (!isParticipant) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    swap.resources.pull(resourceId);
    await swap.save();

    return NextResponse.json({ resources: swap.resources });
  } catch (err) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
