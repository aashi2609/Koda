import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/apiAuth";
import { getPusherServer } from "@/lib/pusher";

export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;

  try {
    const body = await req.text();
    const params = new URLSearchParams(body);
    const socketId = params.get("socket_id");
    const channel = params.get("channel_name");

    if (!socketId || !channel) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const pusher = getPusherServer();
    const authRecord = pusher.authorizeChannel(socketId, channel);

    return NextResponse.json(authRecord);
  } catch (err) {
    console.error("Pusher auth error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
