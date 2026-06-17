import connectDB from "@/lib/mongodb";
import Activity from "@/models/Activity";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return Response.json({ message: "Unauthorized" }, { status: 401 });

    await connectDB();
    const activities = await Activity.find().sort({ createdAt: -1 }).limit(100);
    return Response.json(activities);
  } catch {
    return Response.json({ message: "Failed to fetch activity" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return Response.json({ message: "Unauthorized" }, { status: 401 });

    await connectDB();
    const body = await request.json();
    const activity = await Activity.create(body);
    return Response.json(activity, { status: 201 });
  } catch {
    return Response.json({ message: "Failed to log activity" }, { status: 500 });
  }
}