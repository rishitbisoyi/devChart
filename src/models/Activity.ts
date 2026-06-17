import mongoose from "mongoose";

const ActivitySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },
    taskTitle: {
      type: String,
      default: "",
    },
    memberId: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["created", "moved", "deleted", "updated"],
      default: "updated",
    },
  },
  {
    timestamps: true,
  }
);

const Activity =
  mongoose.models.Activity ||
  mongoose.model("Activity", ActivitySchema);

export default Activity;