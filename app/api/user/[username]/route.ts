import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function GET(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    console.log("Looking for username:", params.username);
    await connectDB();
    const user = await User.findOne({ username: params.username });
    console.log("Found user:", user ? "YES" : "NO");
    if (!user) {
      return NextResponse.json({ error: "User not found", username: params.username }, { status: 404 });
    }
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}