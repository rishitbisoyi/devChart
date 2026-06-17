import connectDB from "@/lib/mongodb";
import Task from "@/models/Tasks";
import Activity from "@/models/Activity";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const task = await Task.findById(id);
    if (!task) {
      return Response.json({ message: "Task not found" }, { status: 404 });
    }
    return Response.json(task);
  } catch {
    return Response.json(
      { message: "Failed to fetch task" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const existingTask = await Task.findById(id);
    if (!existingTask) {
      return Response.json({ message: "Task not found" }, { status: 404 });
    }

    // Handle subtask toggle
    if (body.subtaskId !== undefined) {
      const task = await Task.findById(id);
      if (!task) return Response.json({ message: "Task not found" }, { status: 404 });
      const sub = task.subtasks.id(body.subtaskId);
      if (sub) sub.done = !sub.done;
      await task.save();
      return Response.json(task);
    }

    // Handle subtask add
    if (body.addSubtask) {
      const updatedTask = await Task.findByIdAndUpdate(
        id,
        { $push: { subtasks: { text: body.addSubtask } } },
        { new: true }
      );
      return Response.json(updatedTask);
    }

    // Handle subtask delete
    if (body.deleteSubtask) {
      const updatedTask = await Task.findByIdAndUpdate(
        id,
        { $pull: { subtasks: { _id: body.deleteSubtask } } },
        { new: true }
      );
      return Response.json(updatedTask);
    }

    // Handle comment-only update
    if (body.comment) {
      const updatedTask = await Task.findByIdAndUpdate(
        id,
        {
          $push: {
            comments: { author: body.author || "Member", text: body.comment },
            activity: { action: `${body.author || "Member"} added a comment` },
          },
        },
        { new: true }
      );
      return Response.json(updatedTask);
    }

    let activityAction = "Task updated";
    let activityType: "moved" | "updated" = "updated";

    if (body.status && body.status !== existingTask.status) {
      const STATUS_LABELS: Record<string, string> = {
        todo: "To Do",
        "in-progress": "In Progress",
        done: "Done",
      };
      activityAction = `"${existingTask.title}" moved to ${STATUS_LABELS[body.status] ?? body.status}`;
      activityType = "moved";
    } else if (body.assignedTo && body.assignedTo !== existingTask.assignedTo) {
      activityAction = `"${existingTask.title}" assigned to ${body.assignedTo}`;
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      {
        ...body,
        $push: { activity: { action: activityAction } },
      },
      { new: true }
    );

    await Activity.create({
      action: activityAction,
      taskId: id,
      taskTitle: existingTask.title,
      memberId: body.assignedTo || existingTask.assignedTo || "",
      type: activityType,
    });

    return Response.json(updatedTask);
  } catch {
    return Response.json(
      { message: "Failed to update task" },
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
    if (!session) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }
    const sessionRole = (session.user as { role?: string })?.role;
    if (sessionRole !== "admin" && sessionRole !== "super-admin") {
      return Response.json({ message: "Only admins can delete tasks" }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;

    const task = await Task.findById(id);
    if (task) {
      await Activity.create({
        action: `Task "${task.title}" deleted`,
        taskId: id,
        taskTitle: task.title,
        memberId: task.assignedTo || "",
        type: "deleted",
      });
    }

    await Task.findByIdAndDelete(id);
    return Response.json({ message: "Task deleted successfully" });
  } catch {
    return Response.json(
      { message: "Failed to delete task" },
      { status: 500 }
    );
  }
}
