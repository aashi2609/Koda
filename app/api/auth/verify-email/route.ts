import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=invalid_token", req.url));
  }

  await dbConnect();

  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpiry: { $gt: new Date() },
  });

  if (!user) {
    return NextResponse.redirect(new URL("/login?error=token_expired", req.url));
  }

  user.emailVerified = new Date();
  user.verificationToken = undefined;
  user.verificationTokenExpiry = undefined;
  await user.save();

  return NextResponse.redirect(new URL("/login?verified=true", req.url));
}
