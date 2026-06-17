import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Member from "@/models/Member";
import bcrypt from "bcryptjs";
import { SUPER_ADMIN_EMAIL } from "@/lib/constants";

export async function POST(request: Request) {
  try {
    await connectDB();
    const { name, email, password } = await request.json();

    if (!name?.trim() || !email?.trim() || !password) {
      return Response.json({ message: "All fields are required" }, { status: 400 });
    }
    if (password.length < 6) {
      return Response.json({ message: "Password must be at least 6 characters" }, { status: 400 });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return Response.json({ message: "Email already registered" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const role = email.toLowerCase() === SUPER_ADMIN_EMAIL ? "super-admin" : "member";

    const user = await User.create({ name: name.trim(), email: email.toLowerCase(), password: hashed, role });

    // Auto-add to Members list if not already there
    const memberExists = await Member.findOne({ email: email.toLowerCase() });
    if (!memberExists) {
      const memberRole = role === "super-admin" ? "admin" : "member";
      await Member.create({ name: name.trim(), email: email.toLowerCase(), role: memberRole });
    }

    return Response.json({ id: user._id, name: user.name, email: user.email, role: user.role }, { status: 201 });
  } catch {
    return Response.json({ message: "Registration failed" }, { status: 500 });
  }
}
