import connectDB from "@/lib/mongodb";
import Task from "@/models/Tasks";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return Response.json({ message: "Unauthorized" }, { status: 401 });

    await connectDB();

    const tasks = await Task.find();

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const byStatus = {
      todo: tasks.filter((t) => t.status === "todo").length,
      "in-progress": tasks.filter((t) => t.status === "in-progress").length,
      done: tasks.filter((t) => t.status === "done").length,
    };

    const byPriority = {
      low: tasks.filter((t) => t.priority === "low").length,
      medium: tasks.filter((t) => t.priority === "medium").length,
      high: tasks.filter((t) => t.priority === "high").length,
    };

    const completedThisWeek = tasks.filter(
      (t) =>
        t.status === "done" &&
        t.updatedAt &&
        new Date(t.updatedAt) >= weekAgo
    ).length;

    const overdue = tasks.filter(
      (t) =>
        t.dueDate && new Date(t.dueDate) < now && t.status !== "done"
    ).length;

    const memberMap: Record<string, { total: number; done: number }> = {};
    tasks.forEach((t) => {
      const name = t.assignedTo?.trim() || "Unassigned";
      if (!memberMap[name]) memberMap[name] = { total: 0, done: 0 };
      memberMap[name].total += 1;
      if (t.status === "done") memberMap[name].done += 1;
    });

    const byMember = Object.entries(memberMap)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.total - a.total);

    return Response.json({
      total: tasks.length,
      byStatus,
      byPriority,
      completedThisWeek,
      overdue,
      byMember,
    });
  } catch {
    return Response.json(
      { message: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}