import connectDB from "@/lib/mongodb";
import Task from "@/models/Tasks";
import Activity from "@/models/Activity";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    await connectDB();
    const tasks = await Task.find().sort({ createdAt: -1 });
    return Response.json(tasks);
  } catch {
    return Response.json(
      { message: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    if (!body.createdBy) {
      body.createdBy = session.user?.name ?? "";
    }

    const task = await Task.create({
      title: body.title,
      description: body.description,
      priority: body.priority,
      status: body.status || "todo",
      assignedTo: body.assignedTo || "",
      dueDate: body.dueDate || null,
      createdBy: body.createdBy || "",
      tags: body.tags || [],
      activity: [{ action: `Task "${body.title}" created` }],
    });

    await Activity.create({
      action: `Task "${body.title}" created`,
      taskId: task._id,
      taskTitle: body.title,
      memberId: body.assignedTo || "",
      type: "created",
    });

    return Response.json(task, { status: 201 });
  } catch {
    return Response.json(
      { message: "Failed to create task" },
      { status: 500 }
    );
  }
}