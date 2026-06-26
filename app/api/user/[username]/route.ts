import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function GET(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    await connectDB();
    const user = await User.findOne({ username: params.username });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
