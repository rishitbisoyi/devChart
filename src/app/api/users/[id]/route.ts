import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SUPER_ADMIN_EMAIL } from "@/lib/constants";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const sessionRole  = (session?.user as { role?: string })?.role;
    const sessionEmail = session?.user?.email;

    if (!session || (sessionRole !== "admin" && sessionRole !== "super-admin")) {
      return Response.json({ message: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const target = await User.findById(id);
    if (!target) return Response.json({ message: "User not found" }, { status: 404 });

    // Only super-admin can change roles to/from super-admin
    if (body.role === "super-admin" && sessionRole !== "super-admin") {
      return Response.json({ message: "Only super-admin can grant super-admin role" }, { status: 403 });
    }

    // Transfer super-admin: demote self, promote target
    if (body.role === "super-admin" && sessionRole === "super-admin") {
      // Demote current super-admin (themselves) to admin
      await User.updateOne({ email: sessionEmail }, { role: "admin" });
      // Elevate target
      target.role = "super-admin";
      await target.save();
      return Response.json(target);
    }

    // Admin cannot touch the designated super-admin account
    if (target.email === SUPER_ADMIN_EMAIL) {
      return Response.json({ message: "The super-admin account cannot be modified" }, { status: 403 });
    }

    // Prevent demoting if target is super-admin and caller is only admin
    if (target.role === "super-admin" && sessionRole !== "super-admin") {
      return Response.json({ message: "Cannot modify a super-admin account" }, { status: 403 });
    }

    target.role = body.role ?? target.role;
    await target.save();
    return Response.json({ id: target._id, name: target.name, email: target.email, role: target.role });
  } catch {
    return Response.json({ message: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const sessionRole = (session?.user as { role?: string })?.role;

    if (!session || (sessionRole !== "admin" && sessionRole !== "super-admin")) {
      return Response.json({ message: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    const target = await User.findById(id);
    if (!target) return Response.json({ message: "User not found" }, { status: 404 });

    // Protect the designated super-admin account from deletion
    if (target.email === SUPER_ADMIN_EMAIL) {
      return Response.json({ message: "The super-admin account cannot be deleted" }, { status: 403 });
    }

    // Only super-admin can delete another admin/super-admin
    if (target.role !== "member" && sessionRole !== "super-admin") {
      return Response.json({ message: "Only super-admin can delete admin accounts" }, { status: 403 });
    }

    await User.findByIdAndDelete(id);
    return Response.json({ message: "User deleted" });
  } catch {
    return Response.json({ message: "Failed to delete user" }, { status: 500 });
  }
}
