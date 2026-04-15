import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/apiAuth";
import dbConnect from "@/lib/dbConnect";
import SwapRequest, { ISwapRequest } from "@/models/SwapRequest";
import { HydratedDocument } from "mongoose";
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
    const body = await req.json();
    const { title } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const swap = (await SwapRequest.findById(id)) as HydratedDocument<ISwapRequest> | null;
    if (!swap) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const isParticipant =
      swap.senderId.toString() === currentUser._id.toString() ||
      swap.receiverId.toString() === currentUser._id.toString();

    if (!isParticipant) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    swap.milestones.push({ title, completed: false });
    await swap.save();

    return NextResponse.json({ milestones: swap.milestones });
  } catch (err) {
    console.error("Milestone err:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

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
    const { milestoneId, completed } = await req.json();

    const swap = (await SwapRequest.findById(id)) as HydratedDocument<ISwapRequest> | null;
    if (!swap) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const isParticipant =
      swap.senderId.toString() === currentUser._id.toString() ||
      swap.receiverId.toString() === currentUser._id.toString();

    if (!isParticipant) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const milestone = swap.milestones.id(milestoneId);
    if (!milestone) return NextResponse.json({ error: "Milestone not found" }, { status: 404 });

    milestone.completed = completed;
    await swap.save();

    return NextResponse.json({ milestones: swap.milestones });
  } catch (err) {
    console.error("Milestone update err:", err);
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
    const url = new URL(req.url);
    const milestoneId = url.searchParams.get("milestoneId");

    if (!milestoneId) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const swap = await SwapRequest.findById(id);
    if (!swap) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const isParticipant =
      swap.senderId.toString() === currentUser._id.toString() ||
      swap.receiverId.toString() === currentUser._id.toString();

    if (!isParticipant) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    swap.milestones.pull(milestoneId);
    await swap.save();

    return NextResponse.json({ milestones: swap.milestones });
  } catch (err) {
    console.error("Milestone delete err:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
