import connectDB from "@/lib/mongodb";
import Member from "@/models/Member";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    await connectDB();
    const members = await Member.find().sort({ createdAt: -1 });
    return Response.json(members);
  } catch {
    return Response.json({ message: "Failed to fetch members" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as { role?: string })?.role;
    if (!session || (role !== "admin" && role !== "super-admin")) {
      return Response.json({ message: "Only admins can add members" }, { status: 403 });
    }

    await connectDB();
    const body = await request.json();

    if (!body.name?.trim() || !body.email?.trim()) {
      return Response.json({ message: "Name and email are required" }, { status: 400 });
    }

    const member = await Member.create({
      name: body.name.trim(),
      email: body.email.trim(),
      role: body.role ?? "member",
    });

    return Response.json(member, { status: 201 });
  } catch {
    return Response.json({ message: "Failed to create member" }, { status: 500 });
  }
}