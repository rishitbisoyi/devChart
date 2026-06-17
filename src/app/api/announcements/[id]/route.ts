import connectDB from "@/lib/mongodb";
import Announcement from "@/models/Announcement";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as { role?: string })?.role;
    if (!session || (role !== "admin" && role !== "super-admin")) {
      return Response.json({ message: "Only admins can update announcements" }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const announcement = await Announcement.findByIdAndUpdate(id, body, { new: true });
    if (!announcement) {
      return Response.json({ message: "Not found" }, { status: 404 });
    }
    return Response.json(announcement);
  } catch {
    return Response.json({ message: "Failed to update announcement" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as { role?: string })?.role;
    if (!session || (role !== "admin" && role !== "super-admin")) {
      return Response.json({ message: "Only admins can delete announcements" }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    await Announcement.findByIdAndDelete(id);
    return Response.json({ message: "Deleted" });
  } catch {
    return Response.json({ message: "Failed to delete announcement" }, { status: 500 });
  }
}
