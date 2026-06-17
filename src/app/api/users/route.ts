import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as { role?: string })?.role;
    if (!session || (role !== "admin" && role !== "super-admin")) {
      return Response.json({ message: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const users = await User.find({}, "-password").sort({ createdAt: -1 });
    return Response.json(users);
  } catch {
    return Response.json({ message: "Failed to fetch users" }, { status: 500 });
  }
}
