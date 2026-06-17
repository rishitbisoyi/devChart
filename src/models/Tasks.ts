import mongoose from "mongoose";

const ActivitySchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
  },

  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const SubtaskSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  done: { type: Boolean, default: false },
});

const CommentSchema = new mongoose.Schema({
  author: {
    type: String,
    default: "Member",
  },

  text: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["todo", "in-progress", "done"],
      default: "todo",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
    },

    assignedTo: {
      type: String,
      default: "",
    },

    dueDate: {
      type: Date,
      default: null,
    },

    createdBy: {
      type: String,
      default: "",
    },

    tags: {
      type: [String],
      default: [],
    },

    sprint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sprint",
      default: null,
    },

    subtasks: {
      type: [SubtaskSchema],
      default: [],
    },

    activity: {
      type: [ActivitySchema],
      default: [],
    },

    comments: {
      type: [CommentSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Task = mongoose.models.Task || mongoose.model("Task", TaskSchema);

export default Task;