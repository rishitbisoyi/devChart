import connectDB from "@/lib/mongodb";
import Member from "@/models/Member";
import Task from "@/models/Tasks";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const member = await Member.findById(id);
    if (!member) {
      return Response.json(
        { message: "Member not found" },
        { status: 404 }
      );
    }

    const tasks = await Task.find({ assignedTo: member.name }).sort({
      createdAt: -1,
    });

    return Response.json({ member, tasks });
  } catch {
    return Response.json(
      { message: "Failed to fetch member" },
      { status: 500 }
    );
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
      return Response.json({ message: "Only admins can remove members" }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    await Member.findByIdAndDelete(id);
    return Response.json({ message: "Member deleted" });
  } catch {
    return Response.json({ message: "Failed to delete member" }, { status: 500 });
  }
}