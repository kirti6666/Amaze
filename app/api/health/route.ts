import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

// Simple route to confirm the Next.js <-> MongoDB connection works.
// Visit /api/health after running `npm run dev` with a valid MONGODB_URI set.
export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({ status: "ok", db: "connected" });
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: "Database connection failed" },
      { status: 500 }
    );
  }
}
