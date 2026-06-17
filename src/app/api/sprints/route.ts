import connectDB from "@/lib/mongodb";
import Sprint from "@/models/Sprint";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return Response.json({ message: "Unauthorized" }, { status: 401 });

    await connectDB();
    const sprints = await Sprint.find().sort({ createdAt: -1 });
    return Response.json(sprints);
  } catch {
    return Response.json({ message: "Failed to fetch sprints" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as { role?: string })?.role;
    if (!session || (role !== "admin" && role !== "super-admin")) {
      return Response.json({ message: "Only admins can create sprints" }, { status: 403 });
    }

    await connectDB();
    const body = await request.json();
    const sprint = await Sprint.create({
      name: body.name,
      goal: body.goal ?? "",
      startDate: body.startDate ?? null,
      endDate: body.endDate ?? null,
      status: body.status ?? "planned",
      color: body.color ?? "#3ddc84",
    });
    return Response.json(sprint, { status: 201 });
  } catch {
    return Response.json({ message: "Failed to create sprint" }, { status: 500 });
  }
}
