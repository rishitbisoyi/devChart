import connectDB from "@/lib/mongodb";
import Sprint from "@/models/Sprint";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return Response.json({ message: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { id } = await params;
    const sprint = await Sprint.findById(id);
    if (!sprint) return Response.json({ message: "Sprint not found" }, { status: 404 });
    return Response.json(sprint);
  } catch {
    return Response.json({ message: "Failed to fetch sprint" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as { role?: string })?.role;
    if (!session || (role !== "admin" && role !== "super-admin")) {
      return Response.json({ message: "Only admins can update sprints" }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const sprint = await Sprint.findByIdAndUpdate(id, body, { new: true });
    if (!sprint) return Response.json({ message: "Sprint not found" }, { status: 404 });
    return Response.json(sprint);
  } catch {
    return Response.json({ message: "Failed to update sprint" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as { role?: string })?.role;
    if (!session || (role !== "admin" && role !== "super-admin")) {
      return Response.json({ message: "Only admins can delete sprints" }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    await Sprint.findByIdAndDelete(id);
    return Response.json({ message: "Sprint deleted" });
  } catch {
    return Response.json({ message: "Failed to delete sprint" }, { status: 500 });
  }
}
