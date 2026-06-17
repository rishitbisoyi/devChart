import connectDB from "@/lib/mongodb";
import Announcement from "@/models/Announcement";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return Response.json({ message: "Unauthorized" }, { status: 401 });

    await connectDB();
    const announcements = await Announcement.find().sort({ pinned: -1, createdAt: -1 });
    return Response.json(announcements);
  } catch {
    return Response.json({ message: "Failed to fetch announcements" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as { role?: string })?.role;
    if (!session || (role !== "admin" && role !== "super-admin")) {
      return Response.json({ message: "Only admins can post announcements" }, { status: 403 });
    }

    await connectDB();
    const body = await request.json();
    const { title, content, emoji } = body;
    if (!title || !content) {
      return Response.json({ message: "Title and content are required" }, { status: 400 });
    }
    const announcement = await Announcement.create({
      title,
      content,
      author: session.user?.name ?? "Team",
      emoji,
    });
    return Response.json(announcement, { status: 201 });
  } catch {
    return Response.json({ message: "Failed to create announcement" }, { status: 500 });
  }
}
